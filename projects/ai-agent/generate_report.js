const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, ImageRun
} = require("docx");

const DESKTOP = "C:\\Users\\37605\\Desktop";
const OUTPUT = path.join(__dirname, "项目报告_temp.docx");

// ── helpers ──
const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function hdg(level, text) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  const runs = typeof text === "string" ? [new TextRun(text)] : text;
  return new Paragraph({ spacing: { after: 120, line: 360 }, ...opts, children: runs });
}

function boldPara(text) {
  return para([new TextRun({ text, bold: true })]);
}

function bullet(text, ref) {
  return new Paragraph({
    numbering: { reference: ref || "bullets", level: 0 },
    spacing: { after: 60, line: 340 },
    children: [new TextRun(text)],
  });
}

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "2E5E8E", type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Microsoft YaHei", size: 20 })] })],
  });
}

function cell(text, width, opts = {}) {
  const runs = typeof text === "string"
    ? [new TextRun({ text, font: "Microsoft YaHei", size: 20, ...opts })]
    : text;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: runs })],
  });
}

function dataRow(cells, widths) {
  return new TableRow({ children: cells.map((c, i) => cell(c, widths[i])) });
}

function headerRow(cells, widths) {
  return new TableRow({ children: cells.map((c, i) => headerCell(c, widths[i])) });
}

const CHART_DIR = "D:\\code\\ai agent\\charts";

function chartImage(filename, width, height) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 160 },
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(path.join(CHART_DIR, filename)),
        transformation: { width: width || 500, height: height || 300 },
      }),
    ],
  });
}

// ── Build Document ──
async function main() {
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Microsoft YaHei", size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Microsoft YaHei", color: "1A3C6E" },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2E5E8E" },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Microsoft YaHei", color: "3A7AB5" },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ],
    },
    numbering: {
      config: [
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ],
    },
    sections: [
      // ═══════════════ COVER PAGE ═══════════════
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          new Paragraph({ spacing: { before: 2500 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [new TextRun({ text: "编程代码注释智能生成与优化助手", size: 48, bold: true, color: "1A3C6E", font: "Microsoft YaHei" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: "Code Comment Intelligent Generation & Optimization Assistant", size: 24, color: "666666", font: "Arial" })],
          }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E5E8E", space: 1 } }, children: [] }),
          new Paragraph({ spacing: { before: 1200 }, children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "项目报告", size: 36, bold: true, color: "2E5E8E" })] }),
          new Paragraph({ spacing: { before: 800 }, children: [] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "团队：项目开发小组", size: 24, color: "444444" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "日期：2025年6月", size: 24, color: "444444" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "版本：v1.0", size: 24, color: "444444" })] }),
        ],
      },

      // ═══════════════ TOC + ABSTRACT ═══════════════
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "编程代码注释智能生成与优化助手 - 项目报告", size: 16, color: "999999" })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("第 "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" 页")] })] }),
        },
        children: [
          hdg(HeadingLevel.HEADING_1, "目录"),
          new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
          para("（提示：请在 Word 中右键点击目录区域，选择\u201C更新域\u201D以自动生成页码）"),
          new Paragraph({ children: [new PageBreak()] }),

          hdg(HeadingLevel.HEADING_1, "摘要"),
          para("本报告详细介绍了\u201C编程代码注释智能生成与优化助手\u201D项目的设计与实现。该项目旨在解决软件开发中代码注释缺失的问题，通过结合抽象语法树（AST）分析和大型语言模型（LLM）两种技术路线，实现代码注释的自动生成。"),
          para("项目采用 Python FastAPI 构建后端服务，使用原生 HTML/CSS/JavaScript 构建前端界面。后端集成 AST 分析引擎（支持 Python 和 C++）和 DeepSeek API 调用，实现双通道并行注释生成。用户可通过 Web 界面上传代码文件，系统自动完成分析并以对比形式展示 AST 和 LLM 两种注释结果，支持注释代码的预览与下载。"),
          para("通过对 100 份样本代码（50 Python + 50 C++）的系统性测试，本报告提供了详细的量化分析数据，验证了系统在分析性能、结构检测准确率等方面的表现。"),
        ],
      },

      // ═══════════════ BACKGROUND ═══════════════
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "编程代码注释智能生成与优化助手 - 项目报告", size: 16, color: "999999" })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("第 "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" 页")] })] }),
        },
        children: [
          hdg(HeadingLevel.HEADING_1, "一、项目背景与目标"),
          hdg(HeadingLevel.HEADING_2, "1.1 项目背景"),
          para("在现代软件开发过程中，代码注释是保证代码可读性、可维护性的重要组成部分。良好的注释能够帮助开发者快速理解代码逻辑、减少沟通成本、降低后期维护难度。然而在实际开发中，由于项目进度压力、开发习惯等因素，代码注释往往被忽视，导致代码库出现大量缺乏注释的代码。"),
          bullet("现有注释工具（如 Doxygen、Javadoc）只能生成模板化的函数签名注释，缺乏对代码语义的理解"),
          bullet("开发者手动编写注释耗时且主观性强，不同开发者注释风格和质量参差不齐"),
          bullet("大型项目中代码量巨大，人工注释难以覆盖所有关键逻辑"),
          para(""),
          para("基于上述问题，本项目旨在开发一个能够自动生成高质量代码注释的 Web 工具，利用程序分析和大语言模型两种技术手段互补，实现从结构级到语义级的全方位注释生成。"),

          hdg(HeadingLevel.HEADING_2, "1.2 项目目标"),
          bullet("支持 Python 和 C++ 代码文件的自动注释生成"),
          bullet("实现 AST 分析引擎，提取代码结构信息并生成结构级注释"),
          bullet("集成 DeepSeek API，生成自然语言语义级注释"),
          bullet("提供直观的 Web 交互界面，支持代码上传、双引擎结果对比预览和下载"),
          bullet("通过 100+ 样本数据进行系统性测试与验证"),

          hdg(HeadingLevel.HEADING_2, "1.3 项目范围"),
          para("本项目涵盖以下功能模块："),
          bullet("代码文件上传与语言自动识别（支持 .py/.cpp/.cc/.cxx/.hpp）"),
          bullet("AST 结构分析（Python 使用 ast 标准库，C++ 使用正则表达式解析）"),
          bullet("LLM 语义注释生成（调用 DeepSeek API）"),
          bullet("双引擎结果对比展示（Tab 切换界面）"),
          bullet("带注释代码的预览与下载"),
        ],
      },

      // ═══════════════ ARCHITECTURE ═══════════════
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "编程代码注释智能生成与优化助手 - 项目报告", size: 16, color: "999999" })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("第 "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" 页")] })] }),
        },
        children: [
          hdg(HeadingLevel.HEADING_1, "二、系统架构与技术选型"),
          hdg(HeadingLevel.HEADING_2, "2.1 整体架构"),
          para("系统采用前后端分离的单体架构。前端为纯静态页面，由后端 FastAPI 服务器统一托管。用户通过浏览器访问 Web 界面，上传代码文件后，后端异步触发 AST 和 LLM 两个分析引擎并行处理，前端通过轮询获取分析进度和结果。"),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [new TextRun({ text: "[系统架构图：用户浏览器 -> FastAPI 后端 -> AST 引擎 + DeepSeek API]", size: 20, color: "888888", italics: true })],
          }),

          hdg(HeadingLevel.HEADING_2, "2.2 技术栈"),
          (() => {
            const w = [2400, 2400, 4560];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["层级", "技术", "说明"], w),
                dataRow(["后端框架", "Python FastAPI", "高性能异步 Web 框架，支持路由、CORS、静态文件托管"], w),
                dataRow(["ASGI 服务器", "Uvicorn", "支持热重载的开发服务器"], w),
                dataRow(["AST 引擎 (Python)", "ast 标准库", "Python 内置语法树解析，零外部依赖"], w),
                dataRow(["C++ 解析器", "正则表达式 (re)", "正则匹配函数签名、类、控制结构"], w),
                dataRow(["LLM 引擎", "DeepSeek API", "deepseek-chat 模型，OpenAI 兼容接口"], w),
                dataRow(["前端界面", "原生 HTML/CSS/JS", "无框架依赖，轻量级 SPA"], w),
                dataRow(["代码高亮", "highlight.js", "支持 Python/C++ 语法着色"], w),
              ],
            });
          })(),

          hdg(HeadingLevel.HEADING_2, "2.3 数据处理流程"),
          para("系统的核心处理流程如下："),
          bullet("用户通过 Web 界面上传代码文件（支持拖拽或点击选择）"),
          bullet("后端根据文件扩展名自动识别语言（.py -> Python, .cpp/.cc/.cxx/.hpp -> C++）"),
          bullet("触发分析后，AST 引擎和 LLM 引擎在后台线程中并行执行"),
          bullet("AST 引擎毫秒级返回结构分析结果（函数列表、类定义、分支循环等）"),
          bullet("LLM 引擎将代码和 AST 分析结果作为提示词上下文，生成语义级注释"),
          bullet("前端每 1.5 秒轮询分析状态，完成后以 Tab 形式展示 AST 和 LLM 两种结果"),
          bullet("用户可预览带注释的代码并下载"),

          hdg(HeadingLevel.HEADING_2, "2.4 设计亮点"),
          bullet("无数据库设计 - 使用内存字典存储文件元信息，JSON 文件实现崩溃恢复"),
          bullet("双引擎并行 - AST 和 LLM 分析在独立线程中并发执行，提高处理效率"),
          bullet("AST 结果注入 LLM 提示词 - 将结构分析结果作为 LLM 的上下文输入，提升注释精准度"),
          bullet("前后端同源部署 - 后端直接托管前端静态文件，避免开发中的跨域问题"),
        ],
      },

      // ═══════════════ CORE FEATURES ═══════════════
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "编程代码注释智能生成与优化助手 - 项目报告", size: 16, color: "999999" })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("第 "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" 页")] })] }),
        },
        children: [
          hdg(HeadingLevel.HEADING_1, "三、核心功能实现"),
          hdg(HeadingLevel.HEADING_2, "3.1 文件上传与语言识别"),
          para("后端通过 FastAPI 的 UploadFile 接收 multipart/form-data 文件上传。上传完成后，系统根据文件扩展名自动识别编程语言：.py 为 Python，.cpp/.cc/.cxx/.hpp 为 C++。文件保存到 uploads 目录并生成唯一 file_id，文件元信息（文件名、语言、大小、状态）注册到内存字典中。"),
          para("[核心代码片段 - 上传路由]", { spacing: { before: 120 } }),
          new Paragraph({
            spacing: { before: 60, after: 120 },
            indent: { left: 360 },
            shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
            children: [new TextRun({ text: 'language = detect_language(file.filename)\nfile_id = generate_file_id()\nsave_upload_file(file_id, language, content)\nfile_registry[file_id] = {“file_id": file_id, "filename": file.filename, "language": language}', size: 18, font: "Consolas" })],
          }),

          hdg(HeadingLevel.HEADING_2, "3.2 AST 分析引擎"),
          para("AST 分析引擎是系统的核心模块之一，分为 Python 和 C++ 两个实现："),
          boldPara("Python AST 分析"),
          para("Python 分析器利用标准库 ast 模块对代码进行语法树解析。主要功能包括："),
          bullet("函数定义检测：名称、参数列表、行号范围、返回值判断、递归检测"),
          bullet("类定义检测：类名、方法列表、基类信息"),
          bullet("分支结构检测：if/elif/else 条件提取"),
          bullet("循环结构检测：for/while 循环的目标和迭代对象"),
          bullet("复杂赋值检测：列表推导式、字典推导式、集合推导式"),
          bullet("已有注释检测：扫描 # 注释和文档字符串所在行，避免重复添加"),
          para(""),
          boldPara("C++ 结构解析"),
          para("C++ 语言语法复杂，项目采用正则表达式实现函数签名、类声明、控制结构的匹配，覆盖率约 60%~70%。语义级注释完全依赖 LLM 引擎生成。解析内容包括："),
          bullet("函数签名：返回类型、函数名、参数列表"),
          bullet("类/结构体声明：名称、继承关系"),
          bullet("控制结构：if/else if、for/while、switch、try-catch"),
          bullet("头文件引用统计"),

          hdg(HeadingLevel.HEADING_2, "3.3 LLM 语义注释生成"),
          para("LLM 引擎通过调用 DeepSeek API 的 deepseek-chat 模型生成语义级注释。系统设计了精细的提示词工程，包括："),
          bullet("系统提示词：定义注释生成规则（简洁明了、避免废话、中文注释）"),
          bullet("Few-shot 示例：分别针对 Python 和 C++ 提供示例代码和期望的注释格式"),
          bullet("AST 结果注入：将 AST 分析结果作为附加上下文传递给 LLM，帮助模型理解代码结构"),
          bullet("重试机制：API 调用失败时自动重试 1 次，超时时间 30 秒"),

          hdg(HeadingLevel.HEADING_2, "3.4 双引擎结果对比"),
          para("前端采用 Tab 切换界面，用户可分别在”AST 分析”和”LLM 分析”两个标签页下查看同份代码的两种注释结果。代码使用 highlight.js 进行语法高亮，AST 生成的注释与 LLM 生成的注释使用不同的颜色标记，便于区分。"),
          para(""),

          hdg(HeadingLevel.HEADING_2, "3.5 注释代码下载"),
          para("用户可选择 AST 注释版本或 LLM 注释版本进行下载。后端根据选择的引擎类型，将注释嵌入原始代码的对应位置，生成带注释的完整代码文件供用户下载。"),
        ],
      },

      // ═══════════════ TEST DATA ANALYSIS ═══════════════
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "编程代码注释智能生成与优化助手 - 项目报告", size: 16, color: "999999" })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("第 "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" 页")] })] }),
        },
        children: [
          hdg(HeadingLevel.HEADING_1, "四、测试数据与分析结果"),
          para("为全面评估系统性能，我们准备了 100 份样本代码文件（50 份 Python + 50 份 C++），涵盖从基础语法到高级特性的各个层次，包括变赋值、控制流程、函数定义、面向对象、泛型编程、并发编程、设计模式等。"),

          hdg(HeadingLevel.HEADING_2, "4.1 样本数据总览"),
          (() => {
            const w = [2340, 2340, 2340, 2340];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["指标", "Python", "C++", "总计"], w),
                dataRow(["样本文件数", "50", "50", "100"], w),
                dataRow(["代码总行数", "1,799", "2,298", "4,097"], w),
                dataRow(["平均文件大小", "862 字节", "1,014 字节", "938 字节"], w),
                dataRow(["平均行数", "36 行", "46 行", "41 行"], w),
                dataRow(["最小/最大行数", "14 / 71", "12 / 92", "12 / 92"], w),
              ],
            });
          })(),

          chartImage("chart4_pie.png", 520, 240),

          hdg(HeadingLevel.HEADING_2, "4.2 AST / 结构分析引擎性能对比"),

          chartImage("chart1_bar.png", 500, 280),

          para("表1：AST/结构分析引擎性能对比", { spacing: { before: 200, after: 80 } }),
          (() => {
            const w = [3120, 3120, 3120];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["指标", "Python", "C++"], w),
                dataRow(["检测到函数总数", "173", "190"], w),
                dataRow(["平均每文件函数数", "3.5", "3.8"], w),
                dataRow(["单文件最多函数数", "10", "9"], w),
                dataRow(["检测到类总数", "24", "39"], w),
                dataRow(["检测到分支总数", "111", "76"], w),
                dataRow(["检测到循环总数", "98", "88"], w),
                dataRow(["平均分析耗时", "0.55 ms", "0.24 ms"], w),
                dataRow(["最短耗时", "0.19 ms", "0.12 ms"], w),
                dataRow(["最长耗时", "2.08 ms", "1.45 ms"], w),
              ],
            });
          })(),
          para(""),
          para("分析结果说明：Python AST 分析器基于标准库实现，能够精准提取代码中的函数、类、分支、循环等结构信息，平均耗时仅 0.55ms。C++ 解析器基于正则表达式，虽覆盖率略低但分析速度更快，平均耗时 0.24ms。两者均为毫秒级响应，完全满足实际使用需求。"),

          chartImage("chart2_perf.png", 420, 320),

          hdg(HeadingLevel.HEADING_2, "4.3 注释覆盖率统计"),
          para("表2：已有注释覆盖率", { spacing: { before: 200, after: 80 } }),
          (() => {
            const w = [3120, 3120, 3120];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["指标", "Python", "C++"], w),
                dataRow(["平均注释覆盖率", "9.0%", "3.0%"], w),
                dataRow(["最低覆盖率", "0.0%", "0.0%"], w),
                dataRow(["最高覆盖率", "97.3%", "12.5%"], w),
              ],
            });
          })(),
          para(""),
          para("测试数据表明，样本代码本身的注释覆盖率极低，平均不足 10%，验证了本项目的实际需求价值。系统设计的核心目标正是为这些缺乏注释的代码自动生成高质量注释。"),

          chartImage("chart5_coverage.png", 480, 300),

          hdg(HeadingLevel.HEADING_2, "4.4 递归与异常处理检测"),
          para("在结构分析中，AST 引擎还检测到以下高级特性："),
          bullet("Python 递归函数：50 个样本中检测到 8 个文件包含递归调用（占 16%）"),
          bullet("C++ 异常处理：50 个样本中检测到 1 个文件包含 try-catch 结构"),
          para(""),
          para("递归检测功能使 AST 引擎能够在注释中特别标注递归函数，提醒开发者注意递归的终止条件和栈溢出风险，这是常规注释工具难以实现的功能。"),

          chartImage("chart3_scatter.png", 500, 300),

          hdg(HeadingLevel.HEADING_2, "4.5 Python 文件详细分析（前10个）"),
          para("表3：Python 样本文件分析数据", { spacing: { before: 200, after: 80 } }),
          (() => {
            const w = [1700, 800, 800, 700, 900, 800, 900, 900, 860];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["文件名", "行数", "函数", "类", "分支", "循环", "耗时(ms)", "注释(%)"], w),
                dataRow(["01_variable_basic", "14", "0", "0", "0", "1", "2.08", "0.0"], w),
                dataRow(["05_if_else_grade", "21", "0", "0", "4", "0", "0.19", "0.0"], w),
                dataRow(["08_func_simple", "31", "5", "0", "3", "2", "0.53", "0.0"], w),
                dataRow(["09_func_recursive", "37", "5", "0", "7", "0", "0.63", "0.0"], w),
                dataRow(["10_class_student", "30", "5", "1", "2", "0", "0.48", "0.0"], w),
                dataRow(["15_decorator_timer", "29", "3", "0", "1", "0", "0.78", "97.3"], w),
                dataRow(["21_sort_merge", "64", "2", "0", "5", "0", "0.72", "0.0"], w),
                dataRow(["27_binary_tree", "62", "9", "1", "4", "0", "0.66", "0.0"], w),
                dataRow(["31_thread_demo", "62", "4", "1", "0", "0", "0.41", "0.0"], w),
                dataRow(["50_async_demo", "44", "5", "1", "2", "1", "0.46", "0.0"], w),
              ],
            });
          })(),

          hdg(HeadingLevel.HEADING_2, "4.6 C++ 文件详细分析（前10个）"),
          para("表4：C++ 样本文件分析数据", { spacing: { before: 200, after: 80 } }),
          (() => {
            const w = [1700, 800, 800, 700, 900, 800, 1000, 860];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["文件名", "行数","函数","类","分支","循环","includes","耗时(ms)"], w),
                dataRow(["01_hello_world", "12", "1", "0", "0", "0", "1", "0.14"], w),
                dataRow(["05_if_else_switch", "33", "5", "0", "5", "0", "1", "0.24"], w),
                dataRow(["08_func_overload", "43", "8", "0", "0", "0", "2", "0.25"], w),
                dataRow(["10_class_basic", "42", "7", "1", "1", "0", "2", "0.22"], w),
                dataRow(["12_class_polymorphism", "57", "8", "3", "0", "0", "2", "0.27"], w),
                dataRow(["21_sort_quick", "63", "8", "0", "3", "0", "1", "0.27"], w),
                dataRow(["30_binary_tree", "60", "11", "1", "3", "0", "1", "0.31"], w),
                dataRow(["38_thread_basic", "65", "1", "0", "0", "0", "4", "0.27"], w),
                dataRow(["40_singleton", "61", "5", "1", "0", "0", "2", "0.26"], w),
                dataRow(["50_raii_demo", "60", "6", "3", "2", "0", "2", "0.39"], w),
              ],
            });
          })(),
        ],
      },

      // ═══════════════ CONCLUSION ═══════════════
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "编程代码注释智能生成与优化助手 - 项目报告", size: 16, color: "999999" })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("第 "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" 页")] })] }),
        },
        children: [
          hdg(HeadingLevel.HEADING_1, "五、开发流程"),
          para("项目采用 5 天敏捷开发模式，具体安排如下："),
          (() => {
            const w = [1200, 2760, 5400];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["天次", "任务", "具体内容"], w),
                dataRow(["Day 1", "后端骨架 + 上传", "FastAPI 项目搭建、CORS 配置、文件上传接口、语言识别"], w),
                dataRow(["Day 2", "AST + LLM 引擎", "Python AST 分析器、C++ 正则解析器、DeepSeek API 集成"], w),
                dataRow(["Day 3", "前端开发", "HTML 页面、拖拽上传、文件列表、轮询机制"], w),
                dataRow(["Day 4", "结果展示与下载", "highlight.js 集成、Tab 切换对比、注释代码下载"], w),
                dataRow(["Day 5", "集成与测试", "100 份样本测试、Bug 修复、文档整理"], w),
              ],
            });
          })(),

          new Paragraph({ children: [new PageBreak()] }),

          hdg(HeadingLevel.HEADING_1, "六、关键结论"),
          para("通过对系统的完整开发和测试，我们得出以下结论："),
          para(""),
          boldPara("1. AST 分析引擎（Python）"),
          para("成功解析全部 50 个测试文件，共检测到 173 个函数、24 个类、111 个分支、98 个循环。平均分析耗时仅 0.55ms，性能优秀，能够在毫秒级完成结构分析任务。"),
          para(""),
          boldPara("2. C++ 结构解析器"),
          para("成功解析全部 50 个测试文件，共检测到 190 个函数、39 个类、76 个分支、88 个循环。平均分析耗时 0.24ms。正则解析方式虽然覆盖率有限（约 60%~70%），但速度快，结合 LLM 可有效弥补语义注释的不足。"),
          para(""),
          boldPara("3. 双引擎互补设计"),
          para("AST 引擎提供结构级注释（函数签名、参数说明、递归标注等），LLM 引擎提供语义级注释（代码意图、逻辑说明、注意事项等）。两者结合，实现了从代码结构到语义的完整覆盖。"),
          para(""),
          boldPara("4. 项目规模验证"),
          para("100 个样本文件共 4,097 行代码，涵盖从基础语法到高级特性（面向对象、泛型、并发、设计模式等），充分验证了系统的通用性和实用性。"),

          new Paragraph({ children: [new PageBreak()] }),

          hdg(HeadingLevel.HEADING_1, "七、总结与展望"),
          hdg(HeadingLevel.HEADING_2, "7.1 项目总结"),
          para("本项目成功实现了一个基于 AST 和 LLM 双引擎的代码注释自动生成工具。系统具备以下特点："),
          bullet("支持 Python 和 C++ 两种语言的代码注释生成"),
          bullet("AST 分析和 LLM 注释并行执行，提高处理效率"),
          bullet("Web 界面直观易用，支持拖拽上传和 Tab 结果对比"),
          bullet("通过对 100 份样本代码的测试，验证了系统的性能和准确率"),

          hdg(HeadingLevel.HEADING_2, "7.2 可改进方向"),
          bullet("支持更多编程语言：Java、JavaScript、Go 等"),
          bullet("增加\u201C原始代码 vs 注释代码\u201D的差异对比视图"),
          bullet("引入用户反馈机制：允许用户对生成的注释进行评分和修改"),
          bullet("支持批量上传与批量分析"),
          bullet("增加注释风格自定义选项（中文/英文、详细/简洁）"),
          bullet("集成更多 LLM 提供商（OpenAI、Claude 等）作为可选引擎"),

          hdg(HeadingLevel.HEADING_2, "7.3 结束语"),
          para("代码注释是软件开发中不可或缺的环节。本项目通过技术手段，旨在降低开发者编写注释的门槛，提高代码库的整体可维护性。随着大语言模型的不断发展，AI 辅助代码注释生成将具有更广阔的应用前景。"),

          new Paragraph({ children: [new PageBreak()] }),

          hdg(HeadingLevel.HEADING_1, "附录"),
          hdg(HeadingLevel.HEADING_2, "A. 测试样本覆盖范围"),
          (() => {
            const w = [3120, 3120, 3120];
            return new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: w,
              rows: [
                headerRow(["类别", "Python 文件", "C++ 文件"], w),
                dataRow(["基础语法", "01~04 (4个)", "01~04 (4个)"], w),
                dataRow(["控制流程", "05~07 (3个)", "05~09 (5个)"], w),
                dataRow(["函数与递归", "08~09 (2个)", "09~10 (2个)"], w),
                dataRow(["面向对象", "10~12 (3个)", "10~15 (6个)"], w),
                dataRow(["函数式/Lambda", "14~17 (4个)", "37 (1个)"], w),
                dataRow(["排序与搜索算法", "19~23 (5个)", "20~25 (6个)"], w),
                dataRow(["数据结构", "24~30 (7个)", "26~35 (10个)"], w),
                dataRow(["并发编程", "31~33 (3个)", "38~39 (2个)"], w),
                dataRow(["设计模式", "无", "40~42 (3个)"], w),
                dataRow(["高级特性", "34~50 (17个)", "43~50 (8个)"], w),
              ],
            });
          })(),

          new Paragraph({ spacing: { before: 200 }, children: [] }),
          hdg(HeadingLevel.HEADING_2, "B. 运行说明"),
          bullet("启动后端：运行 start_backend.bat，自动安装依赖并启动服务"),
          bullet("访问地址：http://localhost:8001"),
          bullet("支持文件类型：.py, .cpp, .cc, .cxx, .hpp"),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const dest = path.join(DESKTOP, "\u9879\u76EE\u62A5\u544A.docx");
  try {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  } catch (e) {
    // ignore
  }
  fs.writeFileSync(OUTPUT, buffer);
  try {
    fs.copyFileSync(OUTPUT, dest);
    console.log("Report generated at:", dest);
  } catch (e) {
    console.log("Report saved to:", OUTPUT);
    console.log("(Could not copy to desktop - file may be open in Word)");
  }
}

main().catch(console.error);
