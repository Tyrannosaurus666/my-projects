"""
FastAPI 主入口 —— 路由定义、CORS 配置、服务启动。
"""
import os
import json
import threading
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse

from config import UPLOAD_DIR
from utils import detect_language, generate_file_id, validate_file, save_upload_file, read_upload_file, get_upload_file_path, load_registry, save_registry

# ── 全局状态（内存存储） ──────────────────────────────────────────
# 文件元信息: file_id → {filename, language, status, ...}
file_registry: dict[str, dict] = {}

# 分析任务状态: file_id → {status, ast_done, llm_done}
task_status: dict[str, dict] = {}

# 分析结果缓存: file_id → {ast_result, llm_result}
analysis_results: dict[str, dict] = {}

# ── 创建应用 ──────────────────────────────────────────────────────
app = FastAPI(
    title="代码注释智能生成与优化助手",
    description="上传 Python/C++ 代码，自动生成高质量注释",
    version="1.0.0",
)

# 从磁盘加载文件注册表，确保重启后文件不丢失
file_registry.update(load_registry())

# CORS 配置：允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 前端静态文件目录（使后端同时提供前端页面，避免跨域问题）
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")


# ── 内部辅助函数 ──────────────────────────────────────────────────

def _run_analysis_async(file_id: str, language: str, code: str):
    """在后台线程中并发执行 AST 和 LLM 分析。

    此函数会在独立线程中运行，避免阻塞 API 响应。
    """
    task_status[file_id] = {"status": "processing", "ast_done": False, "llm_done": False}

    results = {}

    # ── AST 分析 ──
    try:
        if language == "python":
            from analyzer.ast_analyzer import analyze_python_code
            ast_result = analyze_python_code(code)
            results["ast_result"] = ast_result
        else:
            from analyzer.cpp_parser import analyze_cpp_code
            cpp_result = analyze_cpp_code(code)
            results["ast_result"] = cpp_result
    except Exception as e:
        results["ast_result"] = {"error": str(e)}
    finally:
        task_status[file_id]["ast_done"] = True

    # ── LLM 分析 ──
    try:
        from llm.client import generate_comments
        llm_result = generate_comments(code, language, ast_hints=results.get("ast_result"))
        results["llm_result"] = llm_result
    except Exception as e:
        results["llm_result"] = {"error": str(e)}
    finally:
        task_status[file_id]["llm_done"] = True

    # 存储结果
    analysis_results[file_id] = results
    task_status[file_id]["status"] = "completed"


# ── API 路由 ──────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    """健康检查。"""
    return {"message": "代码注释智能生成与优化助手 API", "version": "1.0.0"}


@app.post("/upload")
async def upload_code(file: UploadFile = File(...)):
    """上传代码文件。

    接收 multipart/form-data，保存文件并返回 file_id。
    """
    # 1. 读取文件内容
    content = await file.read()
    file_size = len(content)

    # 2. 校验文件
    is_valid, error_msg = validate_file(file.filename or "unknown", file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # 3. 检测语言
    language = detect_language(file.filename)
    if language == "unknown":
        raise HTTPException(status_code=400, detail="无法识别文件类型，仅支持 .py 和 .cpp")

    # 4. 生成 ID 并保存
    file_id = generate_file_id()
    save_upload_file(file_id, language, content)

    # 5. 注册文件信息
    file_registry[file_id] = {
        "file_id": file_id,
        "filename": file.filename,
        "language": language,
        "status": "uploaded",
        "size": file_size,
    }
    save_registry(file_registry)

    return {
        "file_id": file_id,
        "filename": file.filename,
        "language": language,
        "status": "uploaded",
    }


@app.post("/analyze/{file_id}")
async def trigger_analysis(file_id: str):
    """触发代码分析任务（AST + LLM 并行）。"""
    if file_id not in file_registry:
        raise HTTPException(status_code=404, detail="文件不存在，请先上传")

    file_info = file_registry[file_id]
    language = file_info["language"]
    ext = ".py" if language == "python" else ".cpp"
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件已被清理，请重新上传")

    with open(file_path, "r", encoding="utf-8") as f:
        code = f.read()

    # 标记状态
    file_registry[file_id]["status"] = "analyzing"

    # 启动后台分析线程
    thread = threading.Thread(
        target=_run_analysis_async,
        args=(file_id, language, code),
        daemon=True,
    )
    thread.start()

    return {
        "file_id": file_id,
        "status": "processing",
    }


@app.get("/analyze/{file_id}/status")
async def get_analysis_status(file_id: str):
    """查询分析进度。"""
    if file_id not in file_registry:
        raise HTTPException(status_code=404, detail="文件不存在")

    if file_id not in task_status:
        return {
            "file_id": file_id,
            "status": file_registry[file_id].get("status", "uploaded"),
            "ast_done": False,
            "llm_done": False,
        }

    ts = task_status[file_id]
    return {
        "file_id": file_id,
        "status": ts.get("status", "processing"),
        "ast_done": ts.get("ast_done", False),
        "llm_done": ts.get("llm_done", False),
    }


@app.get("/result/{file_id}")
async def get_analysis_result(file_id: str):
    """获取分析结果。"""
    if file_id not in file_registry:
        raise HTTPException(status_code=404, detail="文件不存在")

    if file_id not in task_status:
        raise HTTPException(status_code=400, detail="尚未进行分析")

    if task_status[file_id].get("status") != "completed":
        raise HTTPException(status_code=400, detail="分析尚未完成，请等待")

    result = analysis_results.get(file_id, {})
    return {
        "file_id": file_id,
        "filename": file_registry[file_id]["filename"],
        "language": file_registry[file_id]["language"],
        "ast_result": result.get("ast_result"),
        "llm_result": result.get("llm_result"),
    }


@app.get("/download/{file_id}")
async def download_annotated_code(file_id: str, type: str = Query("llm")):
    """下载带注释的代码文件。

    Args:
        file_id: 文件 ID
        type: "ast" 或 "llm"，选择下载哪个引擎生成的注释版本
    """
    if file_id not in file_registry:
        raise HTTPException(status_code=404, detail="文件不存在")

    if file_id not in analysis_results:
        raise HTTPException(status_code=400, detail="分析结果不存在")

    result_key = f"{type}_result"
    result = analysis_results[file_id].get(result_key)

    if not result:
        raise HTTPException(status_code=400, detail=f"{type} 分析结果不可用")

    # 如果是 LLM 返回的带注释代码字符串，直接写入临时文件
    if isinstance(result, str):
        annotated_code = result
    elif isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=500, detail=f"分析失败: {result['error']}")
    else:
        # AST 结果通常是结构化 dict，转换为注释文本
        annotated_code = _format_ast_result(analysis_results[file_id])

    file_info = file_registry[file_id]
    suffix = ".py" if file_info["language"] == "python" else ".cpp"
    tmp_path = os.path.join(UPLOAD_DIR, f"{file_id}_annotated{suffix}")

    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(annotated_code)

    download_name = f"{file_info['filename'].rsplit('.', 1)[0]}_annotated{suffix}"

    return FileResponse(
        path=tmp_path,
        filename=download_name,
        media_type="application/octet-stream",
    )


def _format_ast_result(results: dict) -> str:
    """将 AST 分析结果格式化为可读文本（备用）。"""
    ast = results.get("ast_result", {})
    if isinstance(ast, str):
        return ast
    if isinstance(ast, dict) and "error" in ast:
        return f"# AST 分析错误: {ast['error']}"

    lines = ["# === AST 结构分析结果 ===\n"]
    for key, items in ast.items():
        if isinstance(items, list):
            lines.append(f"# --- {key} ---")
            for item in items:
                lines.append(str(item))
    return "\n".join(lines)


@app.get("/files")
async def list_files():
    """列出所有已上传文件（供前端刷新文件列表）。"""
    files = []
    for fid, info in file_registry.items():
        files.append({
            "file_id": fid,
            "filename": info["filename"],
            "language": info["language"],
            "status": info.get("status", "uploaded"),
        })
    return {"files": files, "count": len(files)}


@app.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """删除文件及其分析结果。"""
    if file_id in file_registry:
        del file_registry[file_id]
    if file_id in task_status:
        del task_status[file_id]
    if file_id in analysis_results:
        del analysis_results[file_id]

    save_registry(file_registry)

    # 删除磁盘文件
    for ext in [".py", ".cpp"]:
        fpath = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
        if os.path.exists(fpath):
            os.remove(fpath)

    return {"message": "已删除", "file_id": file_id}


@app.delete("/files")
async def clear_all_files():
    """清空所有文件和分析结果。"""
    file_registry.clear()
    task_status.clear()
    analysis_results.clear()

    save_registry(file_registry)

    # 清空 uploads 目录
    for fname in os.listdir(UPLOAD_DIR):
        fpath = os.path.join(UPLOAD_DIR, fname)
        if os.path.isfile(fpath):
            os.remove(fpath)

    return {"message": "已清空所有文件"}


# ── 前端页面托管（catch-all，API 路由优先） ────────────────────────
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path == "" or full_path == "/":
        full_path = "index.html"
    file_path = os.path.join(FRONTEND_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Not Found")


# ── 启动入口 ──────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
