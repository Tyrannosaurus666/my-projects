"""验证所有后端模块可正常导入和工作。"""
import sys

print("=== 全模块导入测试 ===")

from config import DEEPSEEK_MODEL, UPLOAD_DIR, LLM_MAX_RETRIES
print(f"[OK] config: model={DEEPSEEK_MODEL}")

from utils import detect_language, validate_file
print(f"[OK] utils: .py={detect_language('test.py')}, .cpp={detect_language('test.cpp')}")

from analyzer.ast_analyzer import analyze_python_code, format_ast_result_as_annotated_code
print("[OK] ast_analyzer")

from analyzer.cpp_parser import analyze_cpp_code
print("[OK] cpp_parser")

from llm.prompt import build_user_prompt, SYSTEM_PROMPT
print("[OK] prompt")

from llm.client import generate_comments
print("[OK] client (API key not configured, but import OK)")

print("\nALL 6 MODULES IMPORT OK\n")

# ── Python AST 分析测试 ──
test_py = '''
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

class Calculator:
    def add(self, a, b):
        return a + b

for i in range(10):
    if i % 2 == 0:
        print(i)
'''
result = analyze_python_code(test_py)
print("=== Python AST 分析 ===")
# factorial + add = 2 functions
assert len(result["functions"]) == 2, f"Expected 2 functions, got {len(result['functions'])}"
assert len(result["classes"]) == 1
assert result["has_recursion"] is True
# if n <= 1 (inside factorial), if i % 2 == 0 (inside loop) = 2 branches
# + the else inside 'if n <= 1': return 1 ... return n * factorial(n-1)
# Actually the first if has: if n<=1 return 1, else (orelse) return n * factorial(n-1)
# That's 1 if node. The for loop has if i%2==0, that's another. Total = 2
assert len(result["branches"]) >= 2, f"Expected at least 2 branches, got {len(result['branches'])}"
assert len(result["loops"]) == 1

for f in result["functions"]:
    print(f"  {f['name']}({f['args']}) line={f['lineno']} recursive={f['is_recursive']}")
for c in result["classes"]:
    print(f"  {c['name']} methods={c['methods']}")
print(f"  分支: {len(result['branches'])}, 循环: {len(result['loops'])}")
print(f"  摘要: {result['summary']}")

# 格式化注释后代码
annotated = format_ast_result_as_annotated_code(test_py, result)
assert '"""' in annotated
assert "factorial" in annotated
print("\n[OK] format_ast_result_as_annotated_code")

# ── C++ 分析测试 ──
test_cpp = '''
#include <iostream>
int main(int argc, char* argv[]) {
    if (argc > 1) {
        return 0;
    }
    return 0;
}
'''
cpp_r = analyze_cpp_code(test_cpp)
assert len(cpp_r["functions"]) >= 1, f"Expected >=1 function, got {len(cpp_r['functions'])}"
print(f"\n=== C++ 分析: {len(cpp_r['functions'])} funcs, {len(cpp_r['branches'])} branches ===")
for f in cpp_r["functions"]:
    print(f"  {f['return_type']} {f['name']}({f['params']}) line={f['lineno']}")

# ── Prompt 构建测试 ──
prompt = build_user_prompt("print(1)", "python", result)
assert "代码结构分析" in prompt
assert len(prompt) > 100
print(f"\n[OK] Prompt 构建: {len(prompt)} chars, has AST hints=True")

# ── FastAPI app 可导入 ──
print("\n[OK] 测试 main.py FastAPI app 导入...")
# 不实际启动服务，只验证 app 对象可创建
from main import app
print(f"[OK] FastAPI app: {app.title}")

print("\n========== ALL TESTS PASSED ==========")
