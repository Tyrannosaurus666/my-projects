"""
C++ 简易语法分析器。

使用正则表达式提取 C/C++ 代码的结构信息：
- 函数签名（返回类型 + 函数名 + 参数列表）
- 类声明
- 基本控制结构

C++ 语法复杂，不实现完整解析器。结构信息作为 LLM 的辅助上下文，
语义注释完全依赖 LLM 生成。
"""

import re
from typing import Any


# ── 正则模式 ──────────────────────────────────────────────────────────

# 函数签名: 返回类型 函数名(参数) {
# 支持: int main(int argc, char* argv[])、void foo()、std::string getName() const
FUNC_PATTERN = re.compile(
    r'(?P<return_type>[\w:]+(?:[\s*&]+[\w:]+)*)\s+'
    r'(?P<name>[\w~]+)\s*'
    r'\((?P<params>[^)]*)\)\s*'
    r'(?:const\s*)?'
    r'\{',
    re.MULTILINE
)

# 类/结构体声明
CLASS_PATTERN = re.compile(
    r'(?:class|struct)\s+(?P<name>\w+)\s*'
    r'(?::\s*(?P<inheritance>[^{]+))?\s*\{',
    re.MULTILINE
)

# #include 语句
INCLUDE_PATTERN = re.compile(r'#include\s+[<"](?P<header>[^>"]+)[>"]')

# 条件分支: if, else if, else
IF_PATTERN = re.compile(
    r'(?P<keyword>if|else\s+if)\s*\((?P<condition>[^{]*?)\)\s*\{',
    re.MULTILINE
)

# 循环: for, while
LOOP_PATTERN = re.compile(
    r'(?P<keyword>for|while)\s*\((?P<condition>[^{]*?)\)\s*\{',
    re.MULTILINE
)

# switch 语句
SWITCH_PATTERN = re.compile(
    r'switch\s*\((?P<expr>[^{]*?)\)\s*\{',
    re.MULTILINE
)

# try-catch
TRY_CATCH_PATTERN = re.compile(
    r'try\s*\{|catch\s*\([^{]*?\)\s*\{',
    re.MULTILINE
)


def _clean_signature(text: str) -> str:
    """清理多余空白，规范化签名字符串。"""
    return re.sub(r'\s+', ' ', text.strip())


def _detect_existing_comments(source_lines: list[str]) -> set[int]:
    """检测已有注释的行号集合。

    Args:
        source_lines: 源代码行列表

    Returns:
        已有注释的行号集合（1-based）
    """
    commented_lines: set[int] = set()
    in_block_comment = False

    for i, line in enumerate(source_lines, 1):
        stripped = line.strip()

        # 块注释
        if '/*' in stripped:
            in_block_comment = True
            commented_lines.add(i)
        if in_block_comment:
            commented_lines.add(i)
        if '*/' in stripped:
            in_block_comment = False
            continue

        if in_block_comment:
            continue

        # 行注释 //
        if stripped.startswith('//'):
            commented_lines.add(i)

    return commented_lines


def analyze_cpp_code(source_code: str) -> dict[str, Any]:
    """分析 C++ 源代码的结构。

    使用正则匹配提取函数签名、类声明、控制结构等。

    Args:
        source_code: C++ 源代码字符串

    Returns:
        结构化分析结果字典:
        {
            "functions": [...],
            "classes": [...],
            "branches": [...],
            "loops": [...],
            "includes": [...],
            "has_try_catch": bool,
            "commented_lines": [...],
            "summary": str,
            "note": "语义注释由 LLM 生成"
        }
    """
    source_lines = source_code.splitlines()
    commented_lines = _detect_existing_comments(source_lines)

    # 提取函数
    functions = []
    for m in FUNC_PATTERN.finditer(source_code):
        lineno = source_code[:m.start()].count('\n') + 1
        func_info = {
            "name": m.group("name"),
            "return_type": _clean_signature(m.group("return_type")),
            "params": _clean_signature(m.group("params")),
            "lineno": lineno,
            "already_commented": lineno in commented_lines,
        }
        functions.append(func_info)

    # 提取类
    classes = []
    for m in CLASS_PATTERN.finditer(source_code):
        lineno = source_code[:m.start()].count('\n') + 1
        class_info = {
            "name": m.group("name"),
            "lineno": lineno,
            "inheritance": _clean_signature(m.group("inheritance") or ""),
            "already_commented": lineno in commented_lines,
        }
        classes.append(class_info)

    # 提取头文件引用
    includes = []
    for m in INCLUDE_PATTERN.finditer(source_code):
        includes.append(m.group("header"))

    # 提取条件分支
    branches = []
    for m in IF_PATTERN.finditer(source_code):
        lineno = source_code[:m.start()].count('\n') + 1
        branches.append({
            "type": m.group("keyword"),
            "condition": _clean_signature(m.group("condition"))[:60],
            "lineno": lineno,
            "already_commented": lineno in commented_lines,
        })

    # 提取循环
    loops = []
    for m in LOOP_PATTERN.finditer(source_code):
        lineno = source_code[:m.start()].count('\n') + 1
        loops.append({
            "type": m.group("keyword"),
            "condition": _clean_signature(m.group("condition"))[:60],
            "lineno": lineno,
            "already_commented": lineno in commented_lines,
        })

    # switch 语句
    for m in SWITCH_PATTERN.finditer(source_code):
        lineno = source_code[:m.start()].count('\n') + 1
        branches.append({
            "type": "switch",
            "condition": _clean_signature(m.group("expr"))[:40],
            "lineno": lineno,
            "already_commented": lineno in commented_lines,
        })

    # try-catch
    try_matches = TRY_CATCH_PATTERN.findall(source_code)

    # 生成摘要
    func_count = len(functions)
    class_count = len(classes)
    branch_count = len(branches)
    loop_count = len(loops)

    result = {
        "functions": functions,
        "classes": classes,
        "branches": branches,
        "loops": loops,
        "includes": includes[:30],  # 限制头文件数量
        "has_try_catch": len(try_matches) > 0,
        "commented_lines": sorted(commented_lines),
        "summary": (
            f"检测到 {func_count} 个函数、{class_count} 个类、"
            f"{branch_count} 个分支结构、{loop_count} 个循环 "
            f"（注：C++ 结构分析依赖正则，覆盖率约 60-70%，"
            f"语义注释由 LLM 生成）"
        ),
        "note": "C++ 语义注释由 LLM 生成",
    }

    return result
