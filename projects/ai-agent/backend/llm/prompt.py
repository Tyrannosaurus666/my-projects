"""
Prompt 模板 —— 定义发送给 DeepSeek API 的 System Prompt 和 Few-shot 示例。

包含:
- SYSTEM_PROMPT: 角色设定和注释规范
- FEW_SHOT_EXAMPLE: 示例（原始代码 → 注释后代码）
- build_user_prompt(): 根据语言和 AST 提示构建用户消息
"""

# ── System Prompt ──────────────────────────────────────────────────────

SYSTEM_PROMPT = """你是一个编程教学助手。你的任务是为学生代码添加清晰、有用的注释。

## 注释规范（必须严格遵守）：
1. 每个函数/类定义上方必须添加功能说明注释
2. 复杂逻辑块（>5行）上方添加块注释说明意图
3. 禁止对明显自明的语句加注释（如 x = 1、print(x)）
4. 对易错/关键语句用 "# 注意：" 标注
5. 已有注释的代码行不要重复添加注释
6. 直接返回带注释的完整代码，不要任何额外解释
7. 不要改变原有代码的逻辑和缩进格式

## 注释风格：
- 函数注释：使用文档字符串或块注释简短描述功能、参数和返回值
- 行内注释：# 简洁说明意图
- 块注释：# === 某功能块 ===
"""

# ── Few-shot 示例 ──────────────────────────────────────────────────────

FEW_SHOT_PYTHON = """
## 示例（Python）:

原始代码：
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

注释后代码：
```python
def factorial(n):
    \"\"\"计算 n 的阶乘（n!），使用递归实现。

    参数:
        n: 非负整数

    返回:
        n! 的值
    \"\"\"
    # 注意：此函数使用了递归，n 过大可能导致栈溢出
    if n <= 1:          # 递归终止条件
        return 1
    return n * factorial(n - 1)
```
"""

FEW_SHOT_CPP = """
## 示例（C++）:

原始代码：
```cpp
int factorial(int n) {
    if (n <= 1)
        return 1;
    return n * factorial(n - 1);
}
```

注释后代码：
```cpp
/*
 * 计算 n 的阶乘（n!），使用递归实现。
 * @param n 非负整数
 * @return n! 的值
 */
// 注意：此函数使用了递归，n 过大可能导致栈溢出
int factorial(int n) {
    if (n <= 1)         // 递归终止条件
        return 1;
    return n * factorial(n - 1);
}
```
"""


def build_user_prompt(
    code: str,
    language: str,
    ast_hints: dict | None = None,
) -> str:
    """构建发送给 LLM 的用户消息。

    Args:
        code: 原始源代码
        language: "python" 或 "cpp"
        ast_hints: AST 分析结果（可选），作为辅助上下文

    Returns:
        完整的用户提示文本
    """
    lang_label = "Python" if language == "python" else "C++"

    # 基本提示
    prompt = f"请为以下 {lang_label} 代码添加注释，直接返回完整的带注释代码：\n\n```{language}\n{code}\n```"

    # 附加 AST 提示
    if ast_hints and "error" not in ast_hints:
        hint_parts = []

        if "summary" in ast_hints:
            hint_parts.append(f"\n## 代码结构分析（辅助你更精准地注释）\n{ast_hints['summary']}")

        if ast_hints.get("functions"):
            hint_parts.append("\n### 函数列表")
            for f in ast_hints["functions"]:
                rec = " [递归]" if f.get("is_recursive") else ""
                hint_parts.append(f"- {f['name']} (行 {f['lineno']}){rec}")

        if ast_hints.get("classes"):
            hint_parts.append("\n### 类列表")
            for c in ast_hints["classes"]:
                methods = ", ".join(c.get("methods", []))
                hint_parts.append(f"- {c['name']} (行 {c['lineno']}), 方法: {methods}")

        if ast_hints.get("branches"):
            hint_parts.append(f"\n### 分支结构 ({len(ast_hints['branches'])} 处)")
            for b in ast_hints["branches"][:10]:
                cond = b.get("condition", "")
                hint_parts.append(f"- 行 {b['lineno']}: {cond}")

        if ast_hints.get("loops"):
            hint_parts.append(f"\n### 循环结构 ({len(ast_hints['loops'])} 处)")
            for lp in ast_hints["loops"][:10]:
                hint_parts.append(f"- 行 {lp['lineno']}: {lp.get('type', '')} 循环")

        if ast_hints.get("commented_lines"):
            commented = ast_hints["commented_lines"][:30]
            hint_parts.append(f"\n### 已有注释的行号: {commented}")
            hint_parts.append("请跳过这些行，不要重复添加注释。")

        prompt += "\n".join(hint_parts)

    # 附加 few-shot 示例
    if language == "python":
        prompt += "\n\n" + FEW_SHOT_PYTHON
    else:
        prompt += "\n\n" + FEW_SHOT_CPP

    return prompt
