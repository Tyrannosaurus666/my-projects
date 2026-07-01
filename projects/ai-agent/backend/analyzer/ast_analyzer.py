"""
Python AST 语法树分析引擎。

使用 Python 标准库 `ast` 模块提取代码结构信息：
- 函数定义（名称、参数、行号、递归检测）
- 类定义（名称、方法列表、基类）
- 分支结构（if/elif/else）
- 循环结构（for/while）
- 复杂赋值（列表推导等）
- 已有注释检测
"""

import ast
import re
from typing import Any


def _extract_existing_comments(source_lines: list[str]) -> set[int]:
    """检测已有注释的行号集合。

    扫描源码中的单行注释（#）和文档字符串所在行，
    返回已存在注释的行号集合，避免重复添加注释。

    Args:
        source_lines: 源代码行列表

    Returns:
        已有注释的行号集合（1-based）
    """
    commented_lines: set[int] = set()

    # 正则匹配 # 注释（排除字符串内的 #，简化处理）
    in_triple_quote = False
    for i, line in enumerate(source_lines, 1):
        stripped = line.strip()

        # 处理三引号
        if stripped.startswith('"""') or stripped.startswith("'''"):
            in_triple_quote = not in_triple_quote
            commented_lines.add(i)
            continue

        if in_triple_quote:
            commented_lines.add(i)
            continue

        # 行内 # 注释
        if '#' in line:
            # 简单判断 # 是否在代码之后（非全行注释也算）
            code_part = line.split('#')[0].strip()
            if code_part == '' or not code_part.endswith(('"', "'")):
                commented_lines.add(i)

        # 紧邻函数/类上方有注释的行也标记（docstring 风格）
        if stripped.startswith('#'):
            commented_lines.add(i)

    return commented_lines


def _generate_func_comment(node: ast.FunctionDef) -> str:
    """为函数节点生成 Docstring 风格的注释文本。

    Args:
        node: AST FunctionDef 节点

    Returns:
        格式化的注释字符串
    """
    args = [a.arg for a in node.args.args]
    args_str = ", ".join(args) if args else "无参数"
    comment = f'"""\n{node.name} 函数。\n\n参数:\n'
    for arg in args:
        comment += f"    {arg}: 参数说明\n"
    comment += f'\n返回:\n    返回值说明\n"""'
    return comment


def _detect_recursion(node: ast.FunctionDef) -> bool:
    """检测函数是否包含递归调用。

    Args:
        node: AST FunctionDef 节点

    Returns:
        是否递归
    """
    func_name = node.name

    class RecursionVisitor(ast.NodeVisitor):
        def __init__(self):
            self.recursive = False

        def visit_Call(self, call_node):
            if isinstance(call_node.func, ast.Name) and call_node.func.id == func_name:
                self.recursive = True

    visitor = RecursionVisitor()
    visitor.visit(node)
    return visitor.recursive


def analyze_python_code(source_code: str) -> dict[str, Any]:
    """分析 Python 源代码的语法结构。

    Args:
        source_code: Python 源代码字符串

    Returns:
        结构化分析结果字典:
        {
            "functions": [...],
            "classes": [...],
            "branches": [...],
            "loops": [...],
            "complex_assignments": [...],
            "has_recursion": bool,
            "commented_lines": [...],
            "summary": str
        }
    """
    source_lines = source_code.splitlines()
    commented_lines = _extract_existing_comments(source_lines)

    result: dict[str, Any] = {
        "functions": [],
        "classes": [],
        "branches": [],
        "loops": [],
        "complex_assignments": [],
        "has_recursion": False,
        "commented_lines": sorted(commented_lines),
    }

    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        return {"error": f"Python 语法错误: {e}"}

    class Analyzer(ast.NodeVisitor):
        def visit_FunctionDef(self, node):
            func_info = {
                "name": node.name,
                "lineno": node.lineno,
                "end_lineno": node.end_lineno if hasattr(node, 'end_lineno') else node.lineno,
                "args": [a.arg for a in node.args.args],
                "has_return": any(isinstance(n, ast.Return) for n in ast.walk(node)),
                "is_recursive": _detect_recursion(node),
                "decorators": [
                    d.id if isinstance(d, ast.Name) else str(d)
                    for d in node.decorator_list
                ],
                "comment": _generate_func_comment(node),
                "already_commented": node.lineno in commented_lines,
            }

            if func_info["is_recursive"]:
                result["has_recursion"] = True

            result["functions"].append(func_info)
            self.generic_visit(node)

        def visit_AsyncFunctionDef(self, node):
            # 异步函数也当成普通函数处理
            self.visit_FunctionDef(node)

        def visit_ClassDef(self, node):
            methods = []
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    methods.append(item.name)

            bases = []
            for base in node.bases:
                if isinstance(base, ast.Name):
                    bases.append(base.id)

            class_info = {
                "name": node.name,
                "lineno": node.lineno,
                "methods": methods,
                "bases": bases,
                "already_commented": node.lineno in commented_lines,
            }
            result["classes"].append(class_info)
            self.generic_visit(node)

        def visit_If(self, node):
            # 获取测试条件的大致文本
            test_text = ast.unparse(node.test) if hasattr(ast, 'unparse') else "条件判断"
            # 截短
            if len(test_text) > 60:
                test_text = test_text[:57] + "..."

            branch_info = {
                "lineno": node.lineno,
                "condition": test_text,
                "has_else": bool(node.orelse),
                "has_elif": any(isinstance(n, ast.If) for n in node.orelse),
                "already_commented": node.lineno in commented_lines,
            }
            result["branches"].append(branch_info)
            self.generic_visit(node)

        def visit_For(self, node):
            target = ast.unparse(node.target) if hasattr(ast, 'unparse') else "迭代变量"
            iter_text = ast.unparse(node.iter) if hasattr(ast, 'unparse') else "迭代对象"
            if len(iter_text) > 40:
                iter_text = iter_text[:37] + "..."

            loop_info = {
                "type": "for",
                "lineno": node.lineno,
                "target": target,
                "iterable": iter_text,
                "already_commented": node.lineno in commented_lines,
            }
            result["loops"].append(loop_info)
            self.generic_visit(node)

        def visit_While(self, node):
            test_text = ast.unparse(node.test) if hasattr(ast, 'unparse') else "循环条件"
            if len(test_text) > 40:
                test_text = test_text[:37] + "..."

            loop_info = {
                "type": "while",
                "lineno": node.lineno,
                "condition": test_text,
                "already_commented": node.lineno in commented_lines,
            }
            result["loops"].append(loop_info)
            self.generic_visit(node)

        def visit_Assign(self, node):
            # 检测复杂赋值（列表推导、字典推导、集合推导等）
            # node.value 可能是单个节点或 Tuple（多目标解包）
            values = node.value.elts if isinstance(node.value, ast.Tuple) else [node.value]

            for v in values:
                assign_info = {}
                if isinstance(v, ast.ListComp):
                    assign_info = {
                        "type": "list_comprehension",
                        "lineno": node.lineno,
                        "targets": [ast.unparse(t) if hasattr(ast, 'unparse') else str(t) for t in node.targets],
                    }
                elif isinstance(v, ast.DictComp):
                    assign_info = {
                        "type": "dict_comprehension",
                        "lineno": node.lineno,
                    }
                elif isinstance(v, ast.SetComp):
                    assign_info = {
                        "type": "set_comprehension",
                        "lineno": node.lineno,
                    }
                if assign_info:
                    result["complex_assignments"].append(assign_info)

            self.generic_visit(node)

    Analyzer().visit(tree)

    # 生成摘要
    func_count = len(result["functions"])
    class_count = len(result["classes"])
    branch_count = len(result["branches"])
    loop_count = len(result["loops"])
    recursion_note = "（包含递归调用）" if result["has_recursion"] else ""

    result["summary"] = (
        f"检测到 {func_count} 个函数、{class_count} 个类、"
        f"{branch_count} 个分支结构、{loop_count} 个循环 {recursion_note}"
    )

    return result


def format_ast_result_as_annotated_code(source_code: str, ast_result: dict) -> str:
    """根据 AST 分析结果，将结构化信息格式化为带注释的代码。

    在原代码中插入 AST 生成的注释（函数/类/分支/循环上方）。

    Args:
        source_code: 原始源代码
        ast_result: analyze_python_code 的返回结果

    Returns:
        带 AST 注释的代码字符串
    """
    if "error" in ast_result:
        return f"# AST 分析错误: {ast_result['error']}\n\n{source_code}"

    lines = source_code.splitlines()
    annotated_lines: list[str] = []

    # 按行号建立注释映射
    annotations: dict[int, list[str]] = {}

    # 函数注释
    for func in ast_result.get("functions", []):
        if not func.get("already_commented"):
            args_str = ", ".join(func["args"])
            ann = [f'"""', f'{func["name"]} 函数。']
            if func["args"]:
                ann.append(f'参数: {args_str}')
            if func["is_recursive"]:
                ann.append('注意: 此函数使用了递归')
            ann.append('"""')
            lineno = func["lineno"]
            annotations.setdefault(lineno, []).extend(ann)

    # 类注释
    for cls in ast_result.get("classes", []):
        if not cls.get("already_commented"):
            methods_str = ", ".join(cls["methods"]) if cls["methods"] else "无方法"
            bases_str = f"({', '.join(cls['bases'])})" if cls.get("bases") else ""
            ann = [
                f'# 类 {cls["name"]}{bases_str}',
                f'# 方法列表: {methods_str}',
            ]
            lineno = cls["lineno"]
            annotations.setdefault(lineno, []).extend(ann)

    # 分支注释
    for branch in ast_result.get("branches", []):
        if not branch.get("already_commented"):
            ann = [f'# 判断: {branch["condition"]}']
            lineno = branch["lineno"]
            annotations.setdefault(lineno, []).extend(ann)

    # 循环注释
    for loop in ast_result.get("loops", []):
        if not loop.get("already_commented"):
            if loop["type"] == "for":
                ann = [f'# 遍历 {loop.get("iterable", "迭代对象")}']
            else:
                ann = [f'# 当 {loop.get("condition", "条件成立")} 时循环']
            lineno = loop["lineno"]
            annotations.setdefault(lineno, []).extend(ann)

    # 逐行插入注释
    for i, line in enumerate(lines, 1):
        if i in annotations:
            for ann_line in annotations[i]:
                annotated_lines.append(ann_line)
        annotated_lines.append(line)

    return "\n".join(annotated_lines)
