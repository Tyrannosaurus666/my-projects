"""端到端测试：上传 → 分析 → 结果验证"""
import requests
import time

BASE = "http://localhost:8000"

print("=== E2E Test Start ===")

# 1. 健康检查
resp = requests.get(f"{BASE}/")
print(f"GET /: {resp.json()}")

# 2. 上传测试文件
test_code = b"""def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

class MyClass:
    def hello(self):
        pass

for i in range(5):
    print(fib(i))
"""

files = {"file": ("test_e2e.py", test_code, "text/plain")}
up = requests.post(f"{BASE}/upload", files=files)
assert up.status_code == 200, f"Upload failed: {up.text}"
data = up.json()
fid = data["file_id"]
print(f"POST /upload: {up.status_code}, file_id={fid}, lang={data['language']}")

# 3. 触发分析
ana = requests.post(f"{BASE}/analyze/{fid}")
assert ana.status_code == 200, f"Analyze failed: {ana.text}"
print(f"POST /analyze: {ana.status_code} {ana.json()}")

# 4. 轮询状态（最多等 30 秒）
for i in range(30):
    time.sleep(1)
    st = requests.get(f"{BASE}/analyze/{fid}/status").json()
    print(f"  poll[{i}]: status={st['status']}, ast={st['ast_done']}, llm={st['llm_done']}")
    if st["status"] == "completed":
        break

# 5. 获取结果
res = requests.get(f"{BASE}/result/{fid}").json()
print(f"\nGET /result: file={res['filename']}, lang={res['language']}")

ast = res["ast_result"]
assert "functions" in ast, f"AST missing functions: {ast.keys()}"
assert len(ast["functions"]) >= 2, f"Expected >=2 functions, got {len(ast['functions'])}"
assert len(ast["classes"]) >= 1, f"Expected >=1 classes, got {len(ast['classes'])}"
print(f"  AST: functions={len(ast['functions'])}, classes={len(ast['classes'])}, branches={len(ast.get('branches',[]))}")
print(f"  AST summary: {ast.get('summary', 'N/A')}")

# LLM 结果（无 API Key 时会报 error，这是预期的）
llm = res["llm_result"]
if isinstance(llm, dict) and "error" in llm:
    print(f"  LLM: expected error (no API key): {llm['error'][:80]}")
else:
    print(f"  LLM: success (len={len(str(llm))})")

# 6. 文件列表
lst = requests.get(f"{BASE}/files").json()
assert lst["count"] >= 1
print(f"\nGET /files: {lst['count']} files")

# 7. 清理
requests.delete(f"{BASE}/files/{fid}")
print(f"DELETE /files/{fid}: done")

print("\n=== E2E Test PASSED ===")
