"""生成报告所需的图表（柱状图、散点图、饼图）"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "charts")
os.makedirs(OUT_DIR, exist_ok=True)

plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False
plt.rcParams["figure.dpi"] = 150

def chart1_bar_engine_comparison():
    """柱状图：Python vs C++ 结构分析引擎对比"""
    categories = ["函数", "类", "分支", "循环"]
    py_vals = [173, 24, 111, 98]
    cpp_vals = [190, 39, 76, 88]
    x = np.arange(len(categories))
    width = 0.35

    fig, ax = plt.subplots(figsize=(7, 4.2))
    bars1 = ax.bar(x - width/2, py_vals, width, label="Python", color="#2E5E8E")
    bars2 = ax.bar(x + width/2, cpp_vals, width, label="C++", color="#E8913A")
    ax.set_ylabel("检测数量", fontsize=11)
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=11)
    ax.legend(fontsize=10)
    ax.grid(axis="y", alpha=0.3)

    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                str(bar.get_height()), ha="center", va="bottom", fontsize=9)
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                str(bar.get_height()), ha="center", va="bottom", fontsize=9)
    plt.tight_layout()
    path = os.path.join(OUT_DIR, "chart1_bar.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  [OK] {path}")


def chart2_performance_comparison():
    """柱状图：AST分析耗时对比"""
    categories = ["Python (AST)", "C++ (正则)"]
    times = [0.55, 0.24]

    fig, ax = plt.subplots(figsize=(5, 4))
    bars = ax.bar(categories, times, color=["#2E5E8E", "#E8913A"], width=0.5)
    ax.set_ylabel("平均耗时 (ms)", fontsize=11)
    ax.set_title("AST / 结构分析引擎耗时对比", fontsize=12, fontweight="bold")
    ax.grid(axis="y", alpha=0.3)

    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f"{bar.get_height():.2f} ms", ha="center", va="bottom", fontsize=10)
    plt.tight_layout()
    path = os.path.join(OUT_DIR, "chart2_perf.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  [OK] {path}")


def chart3_file_size_vs_functions():
    """散点图：文件大小 vs 函数数量"""
    # Python file data
    py_sizes = []
    py_funcs = []
    cpp_sizes = []
    cpp_funcs = []

    import json
    with open("analysis_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    for r in data["py_details"]:
        py_sizes.append(r["size_bytes"])
        py_funcs.append(r["functions"])
    for r in data["cpp_details"]:
        cpp_sizes.append(r["size_bytes"])
        cpp_funcs.append(r["functions"])

    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.scatter(py_sizes, py_funcs, c="#2E5E8E", label="Python", alpha=0.7, s=40)
    ax.scatter(cpp_sizes, cpp_funcs, c="#E8913A", label="C++", alpha=0.7, s=40)
    ax.set_xlabel("文件大小 (字节)", fontsize=11)
    ax.set_ylabel("检测函数数", fontsize=11)
    ax.set_title("文件大小与检测函数数的关系", fontsize=12, fontweight="bold")
    ax.legend(fontsize=10)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    path = os.path.join(OUT_DIR, "chart3_scatter.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  [OK] {path}")


def chart4_structure_composition():
    """饼图：两种语言结构检测组成对比（并排）"""
    labels = ["函数", "类", "分支", "循环"]
    py_vals = [173, 24, 111, 98]
    cpp_vals = [190, 39, 76, 88]
    colors = ["#2E5E8E", "#4A9BD9", "#E8913A", "#F4C542"]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4))

    ax1.pie(py_vals, labels=labels, colors=colors, autopct="%1.1f%%",
            startangle=90, textprops={"fontsize": 9})
    ax1.set_title("Python 结构组成", fontsize=11, fontweight="bold")

    ax2.pie(cpp_vals, labels=labels, colors=colors, autopct="%1.1f%%",
            startangle=90, textprops={"fontsize": 9})
    ax2.set_title("C++ 结构组成", fontsize=11, fontweight="bold")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "chart4_pie.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  [OK] {path}")


def chart5_comment_coverage():
    """柱状图：注释覆盖率对比"""
    categories = ["平均覆盖率", "最低覆盖率", "最高覆盖率"]
    py_vals = [9.0, 0.0, 97.3]
    cpp_vals = [3.0, 0.0, 12.5]
    x = np.arange(len(categories))
    width = 0.35

    fig, ax = plt.subplots(figsize=(6, 4))
    bars1 = ax.bar(x - width/2, py_vals, width, label="Python", color="#2E5E8E")
    bars2 = ax.bar(x + width/2, cpp_vals, width, label="C++", color="#E8913A")
    ax.set_ylabel("覆盖率 (%)", fontsize=11)
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=10)
    ax.legend(fontsize=10)
    ax.grid(axis="y", alpha=0.3)

    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f"{bar.get_height():.1f}%", ha="center", va="bottom", fontsize=8)
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f"{bar.get_height():.1f}%", ha="center", va="bottom", fontsize=8)
    plt.tight_layout()
    path = os.path.join(OUT_DIR, "chart5_coverage.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  [OK] {path}")


def main():
    print("生成图表...")
    chart1_bar_engine_comparison()
    chart2_performance_comparison()
    chart3_file_size_vs_functions()
    chart4_structure_composition()
    chart5_comment_coverage()
    print("所有图表生成完毕！")


if __name__ == "__main__":
    main()
