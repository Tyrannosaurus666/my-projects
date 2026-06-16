const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak
} = require("docx");

const DESKTOP = "C:\\Users\\37605\\Desktop";
const OUTPUT = path.join(DESKTOP, "测试数据分析表.docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function hdg(level, text) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}
function para(text) {
  return new Paragraph({ spacing: { after: 120, line: 360 }, children: [new TextRun(text)] });
}
function boldPara(text) {
  return para([new TextRun({ text, bold: true })]);
}

function hCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: "2E5E8E", type: ShadingType.CLEAR },
    margins: cellMargins, verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Microsoft YaHei", size: 20 })] })],
  });
}

function dCell(text, width, opts = {}) {
  const runs = typeof text === "string"
    ? [new TextRun({ text, font: "Microsoft YaHei", size: 20, ...opts })]
    : text;
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: runs })],
  });
}

function hRow(cells, widths) {
  return new TableRow({ children: cells.map((c, i) => hCell(c, widths[i])) });
}
function dRow(cells, widths) {
  return new TableRow({ children: cells.map((c, i) => dCell(c, widths[i])) });
}

async function main() {
  // ── The 4 tables ──

  const W1 = [2340, 2340, 2340, 2340];
  const R1 = [
    hRow(["指标", "Python", "C++", "总计"], W1),
    dRow(["样本文件数", "50", "50", "100"], W1),
    dRow(["代码总行数", "1,799", "2,298", "4,097"], W1),
    dRow(["平均文件大小", "862 \u5B57\u8282", "1,014 \u5B57\u8282", "938 \u5B57\u8282"], W1),
    dRow(["平均行数", "36 \u884C", "46 \u884C", "41 \u884C"], W1),
    dRow(["最小/最大行数", "14 / 71", "12 / 92", "12 / 92"], W1),
  ];

  const W2 = [3120, 3120, 3120];
  const R2 = [
    hRow(["\u6307\u6807", "Python", "C++"], W2),
    dRow(["\u68C0\u6D4B\u5230\u51FD\u6570\u603B\u6570", "173", "190"], W2),
    dRow(["\u5E73\u5747\u6BCF\u6587\u4EF6\u51FD\u6570\u6570", "3.5", "3.8"], W2),
    dRow(["\u5355\u6587\u4EF6\u6700\u591A\u51FD\u6570\u6570", "10", "9"], W2),
    dRow(["\u68C0\u6D4B\u5230\u7C7B\u603B\u6570", "24", "39"], W2),
    dRow(["\u68C0\u6D4B\u5230\u5206\u652F\u603B\u6570", "111", "76"], W2),
    dRow(["\u68C0\u6D4B\u5230\u5FAA\u73AF\u603B\u6570", "98", "88"], W2),
    dRow(["\u5E73\u5747\u5206\u6790\u8017\u65F6", "0.55 ms", "0.24 ms"], W2),
    dRow(["\u6700\u77ED\u8017\u65F6", "0.19 ms", "0.12 ms"], W2),
    dRow(["\u6700\u957F\u8017\u65F6", "2.08 ms", "1.45 ms"], W2),
  ];

  const W3 = [3120, 3120, 3120];
  const R3 = [
    hRow(["\u6307\u6807", "Python", "C++"], W3),
    dRow(["\u5E73\u5747\u6CE8\u91CA\u8986\u76D6\u7387", "9.0%", "3.0%"], W3),
    dRow(["\u6700\u4F4E\u8986\u76D6\u7387", "0.0%", "0.0%"], W3),
    dRow(["\u6700\u9AD8\u8986\u76D6\u7387", "97.3%", "12.5%"], W3),
  ];

  const W4 = [3120, 3120, 3120];
  const R4 = [
    hRow(["\u7C7B\u522B", "Python \u6587\u4EF6", "C++ \u6587\u4EF6"], W4),
    dRow(["\u57FA\u7840\u8BED\u6CD5", "01~04 (4\u4E2A)", "01~04 (4\u4E2A)"], W4),
    dRow(["\u63A7\u5236\u6D41\u7A0B", "05~07 (3\u4E2A)", "05~09 (5\u4E2A)"], W4),
    dRow(["\u51FD\u6570\u4E0E\u9012\u5F52", "08~09 (2\u4E2A)", "09~10 (2\u4E2A)"], W4),
    dRow(["\u9762\u5411\u5BF9\u8C61", "10~12 (3\u4E2A)", "10~15 (6\u4E2A)"], W4),
    dRow(["\u6392\u5E8F\u4E0E\u641C\u7D22\u7B97\u6CD5", "19~23 (5\u4E2A)", "20~25 (6\u4E2A)"], W4),
    dRow(["\u6570\u636E\u7ED3\u6784", "24~30 (7\u4E2A)", "26~35 (10\u4E2A)"], W4),
    dRow(["\u5E76\u53D1\u7F16\u7A0B", "31~33 (3\u4E2A)", "38~39 (2\u4E2A)"], W4),
    dRow(["\u8BBE\u8BA1\u6A21\u5F0F", "\u65E0", "40~42 (3\u4E2A)"], W4),
    dRow(["\u9AD8\u7EA7\u7279\u6027", "34~50 (17\u4E2A)", "43~50 (8\u4E2A)"], W4),
  ];

  const W5 = [1700, 800, 800, 700, 900, 800, 900, 900, 860];
  const R5 = [
    hRow(["\u6587\u4EF6\u540D", "\u884C\u6570", "\u51FD\u6570", "\u7C7B", "\u5206\u652F", "\u5FAA\u73AF", "\u8017\u65F6(ms)", "\u6CE8\u91CA(%)"], W5),
    dRow(["01_variable_basic", "14", "0", "0", "0", "1", "2.08", "0.0"], W5),
    dRow(["05_if_else_grade", "21", "0", "0", "4", "0", "0.19", "0.0"], W5),
    dRow(["08_func_simple", "31", "5", "0", "3", "2", "0.53", "0.0"], W5),
    dRow(["09_func_recursive", "37", "5", "0", "7", "0", "0.63", "0.0"], W5),
    dRow(["10_class_student", "30", "5", "1", "2", "0", "0.48", "0.0"], W5),
    dRow(["15_decorator_timer", "29", "3", "0", "1", "0", "0.78", "97.3"], W5),
    dRow(["21_sort_merge", "64", "2", "0", "5", "0", "0.72", "0.0"], W5),
    dRow(["27_binary_tree", "62", "9", "1", "4", "0", "0.66", "0.0"], W5),
    dRow(["31_thread_demo", "62", "4", "1", "0", "0", "0.41", "0.0"], W5),
    dRow(["50_async_demo", "44", "5", "1", "2", "1", "0.46", "0.0"], W5),
  ];

  const W6 = [1700, 800, 800, 700, 900, 800, 1000, 860];
  const R6 = [
    hRow(["\u6587\u4EF6\u540D", "\u884C\u6570", "\u51FD\u6570", "\u7C7B", "\u5206\u652F", "\u5FAA\u73AF", "includes", "\u8017\u65F6(ms)"], W6),
    dRow(["01_hello_world", "12", "1", "0", "0", "0", "1", "0.14"], W6),
    dRow(["05_if_else_switch", "33", "5", "0", "5", "0", "1", "0.24"], W6),
    dRow(["08_func_overload", "43", "8", "0", "0", "0", "2", "0.25"], W6),
    dRow(["10_class_basic", "42", "7", "1", "1", "0", "2", "0.22"], W6),
    dRow(["12_class_polymorphism", "57", "8", "3", "0", "0", "2", "0.27"], W6),
    dRow(["21_sort_quick", "63", "8", "0", "3", "0", "1", "0.27"], W6),
    dRow(["30_binary_tree", "60", "11", "1", "3", "0", "1", "0.31"], W6),
    dRow(["38_thread_basic", "65", "1", "0", "0", "0", "4", "0.27"], W6),
    dRow(["40_singleton", "61", "5", "1", "0", "0", "2", "0.26"], W6),
    dRow(["50_raii_demo", "60", "6", "3", "2", "0", "2", "0.39"], W6),
  ];

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
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "\u7F16\u7A0B\u4EE3\u7801\u6CE8\u91CA\u667A\u80FD\u751F\u6210\u4E0E\u4F18\u5316\u52A9\u624B - \u6D4B\u8BD5\u6570\u636E\u5206\u6790", size: 16, color: "999999" })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("\u7B2C "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" \u9875")] })] }),
      },
      children: [
        // ── Title ──
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 400 },
          children: [new TextRun({ text: "\u7F16\u7A0B\u4EE3\u7801\u6CE8\u91CA\u667A\u80FD\u751F\u6210\u4E0E\u4F18\u5316\u52A9\u624B", size: 36, bold: true, color: "1A3C6E" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E5E8E", space: 1 } },
          children: [new TextRun({ text: "\u6D4B\u8BD5\u6570\u636E\u5206\u6790\u8868", size: 28, color: "2E5E8E" })],
        }),

        // ── Table 1 ──
        boldPara("\u88681\uFF1A\u6837\u672C\u6570\u636E\u603B\u89C8"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W1, rows: R1 }),
        para(""),

        // ── Table 2 ──
        boldPara("\u88682\uFF1AAST / \u7ED3\u6784\u5206\u6790\u5F15\u64CE\u6027\u80FD\u5BF9\u6BD4"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W2, rows: R2 }),
        para(""),

        // ── Table 3 ──
        boldPara("\u88683\uFF1A\u5DF2\u6709\u6CE8\u91CA\u8986\u76D6\u7387"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W3, rows: R3 }),
        para(""),

        // ── Table 4 ──
        boldPara("\u88684\uFF1A\u6D4B\u8BD5\u6837\u672C\u8986\u76D6\u8303\u56F4"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W4, rows: R4 }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── Table 5 ──
        boldPara("\u88685\uFF1APython \u6587\u4EF6\u8BE6\u7EC6\u5206\u6790\u6570\u636E\uFF08\u524D10\u4E2A\uFF09"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W5, rows: R5 }),
        para(""),
        para("\u6CE8\uFF1A\u5171 50 \u4EFD Python \u6837\u672C\uFF0C\u68C0\u6D4B\u5230 8 \u4E2A\u6587\u4EF6\u5305\u542B\u9012\u5F52\u8C03\u7528\u3002"),
        para(""),

        // ── Table 6 ──
        boldPara("\u88686\uFF1AC++ \u6587\u4EF6\u8BE6\u7EC6\u5206\u6790\u6570\u636E\uFF08\u524D10\u4E2A\uFF09"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W6, rows: R6 }),
        para(""),
        para("\u6CE8\uFF1A\u5171 50 \u4EFD C++ \u6837\u672C\uFF0C\u5176\u4E2D 1 \u4E2A\u6587\u4EF6\u5305\u542B try-catch \u5F02\u5E38\u5904\u7406\u3002C++ \u89E3\u6790\u5668\u4F9D\u8D56\u6B63\u5219\u8868\u8FBE\u5F0F\uFF0C\u8986\u76D6\u7387\u7EA6 60%~70%\u3002"),

        // ── Summary ──
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          children: [new TextRun({ text: "\u5173\u952E\u7ED3\u8BBA", size: 32, bold: true, color: "1A3C6E" })],
        }),

        para("\u00B7  AST \u5206\u6790\u5F15\u64CE (Python): \u6210\u529F\u89E3\u6790\u5168\u90E8 50 \u4E2A\u6587\u4EF6\uFF0C\u5171 173 \u4E2A\u51FD\u6570\u3001 24 \u4E2A\u7C7B\u3001 111 \u4E2A\u5206\u652F\u3001 98 \u4E2A\u5FAA\u73AF\u3002\u5E73\u5747\u8017\u65F6 0.55ms\u3002"),
        para("\u00B7  C++ \u7ED3\u6784\u89E3\u6790\u5668: \u6210\u529F\u89E3\u6790\u5168\u90E8 50 \u4E2A\u6587\u4EF6\uFF0C\u5171 190 \u4E2A\u51FD\u6570\u3001 39 \u4E2A\u7C7B\u3001 76 \u4E2A\u5206\u652F\u3001 88 \u4E2A\u5FAA\u73AF\u3002\u5E73\u5747\u8017\u65F6 0.24ms\u3002"),
        para("\u00B7  \u53CC\u5F15\u64CE\u4E92\u8865: AST/\u89E3\u6790\u5668\u63D0\u4F9B\u6BEB\u79D2\u7EA7\u7ED3\u6784\u5206\u6790\uFF0C LLM \u63D0\u4F9B\u8BED\u4E49\u7EA7\u6CE8\u91CA\u751F\u6210\u3002"),
        para("\u00B7  \u9879\u76EE\u89C4\u6A21: 100 \u4E2A\u6837\u672C\u5171 4,097 \u884C\u4EE3\u7801\uFF0C\u8986\u76D6\u57FA\u7840\u8BED\u6CD5\u5230\u9AD8\u7EA7\u7279\u6027\u3002"),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT, buffer);
  console.log("Data analysis tables generated at:", OUTPUT);
}

main().catch(console.error);
