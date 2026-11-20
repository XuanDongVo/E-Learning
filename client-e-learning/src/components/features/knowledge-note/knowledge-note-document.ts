import type {
  KnowledgeDocument, KnowledgeDocumentNode, KnowledgeLearningBlockKind,
  KnowledgeNoteEditorSnapshot, KnowledgeNoteBlockSnapshot,
  KnowledgeLearningSectionRole,
} from "@/types/knowledge-note";

export const KNOWLEDGE_NOTE_SCHEMA_VERSION = 2 as const;
export const KNOWLEDGE_NOTE_FORMAT = "e-learning-knowledge-note" as const;
export const EMPTY_KNOWLEDGE_DOCUMENT: KnowledgeDocument = {
  type: "doc", content: [{ type: "paragraph" }],
};
export const EMPTY_KNOWLEDGE_SUMMARY: KnowledgeDocument = {
  type: "doc", content: [{ type: "paragraph" }],
};
export const LEARNING_BLOCK_LABELS: Record<KnowledgeLearningBlockKind, string> = {
  formula: "Công thức",
  example: "Ví dụ",
  callout: "Ghi chú",
  commonMistake: "Lỗi thường gặp",
};
export const LEARNING_SECTION_LABELS: Record<KnowledgeLearningSectionRole, string> = {
  expression: "Cấu trúc",
  explanation: "Giải thích",
  condition: "Điều kiện",
  example: "Ví dụ",
  translation: "Bản dịch",
  body: "Nội dung",
  incorrect: "Cách dùng sai",
  correct: "Cách dùng đúng",
};
const blockRoles: Record<KnowledgeLearningBlockKind, KnowledgeLearningSectionRole[]> = {
  formula: ["expression", "explanation", "condition"],
  example: ["example", "explanation", "translation"],
  callout: ["body", "explanation"],
  commonMistake: ["incorrect", "correct", "explanation"],
};
const kinds = Object.keys(blockRoles);
export function isLearningKind(value: unknown): value is KnowledgeLearningBlockKind {
  return typeof value === "string" && kinds.includes(value);
}
export function createLearningSection(role: KnowledgeLearningSectionRole, paragraphs?: KnowledgeDocumentNode[]): KnowledgeDocumentNode {
  return { type: "learningSection", attrs: { role }, content: paragraphs?.length ? paragraphs : [{ type: "paragraph" }] };
}
export function createLearningBlock(kind: KnowledgeLearningBlockKind, variant = "note"): KnowledgeDocumentNode {
  return {
    type: "learningBlock",
    attrs: { kind, title: LEARNING_BLOCK_LABELS[kind], variant: kind === "callout" ? variant : "default" },
    content: blockRoles[kind].map(role => createLearningSection(role)),
  };
}
export function createTable(purpose: "general" | "comparison", columns = 3, rows = 3): KnowledgeDocumentNode {
  const cols = Math.max(2, Math.min(12, Math.floor(columns)));
  const count = Math.max(2, Math.min(100, Math.floor(rows)));
  return {
    type: "table",
    attrs: { purpose },
    content: Array.from({ length: count }, (_, row) => ({
      type: "tableRow",
      content: Array.from({ length: cols }, (_, col) => ({
        type: row === 0 ? "tableHeader" : "tableCell",
        attrs: { colspan: 1, rowspan: 1, colwidth: null },
        content: [{
          type: "paragraph",
          ...(purpose === "comparison" && row === 0 && col === 0
            ? { content: [{ type: "text", text: "Tiêu chí" }] } : {}),
        }],
      })),
    })),
  };
}
export function createEditorSnapshot(document: KnowledgeDocument, summary: KnowledgeDocument): KnowledgeNoteEditorSnapshot {
  return { format: KNOWLEDGE_NOTE_FORMAT, schemaVersion: 2, document, summary };
}
export function createBlockSnapshot(content: KnowledgeDocumentNode[]): KnowledgeNoteBlockSnapshot {
  return { format: "e-learning-knowledge-note-blocks", schemaVersion: 2, content };
}
export function normalizeSafeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? trimmed : null;
    } catch { return null; }
  }
  if (/^[\w.-]+\.[a-z]{2,}(?:\/[^\s]*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}
export function isDocumentEmpty(document: KnowledgeDocument): boolean {
  return !document.content.some(nodeHasContent);
}
function nodeHasContent(node: KnowledgeDocumentNode): boolean {
  if (node.type === "text") return Boolean(node.text?.trim());
  return node.content?.some(nodeHasContent) ?? false;
}
function paragraph(value: string): KnowledgeDocumentNode {
  return value ? { type: "paragraph", content: [{ type: "text", text: value }] } : { type: "paragraph" };
}
function paragraphs(value: unknown): KnowledgeDocumentNode[] {
  return typeof value === "string" ? value.split("\n").map(paragraph) : [paragraph("")];
}
function legacyNode(node: KnowledgeDocumentNode): KnowledgeDocumentNode[] {
  if (node.type === "learningBlock") {
    const attrs = node.attrs ?? {};
    const validAttrs = ["kind","title","body","secondary","leftTitle","rightTitle"];
    if (Object.keys(attrs).some(key => !validAttrs.includes(key))) {
      throw new Error("Khối v1 có attribute không hỗ trợ; từ chối để tránh mất dữ liệu.");
    }
    const kind = attrs.kind;
    if (kind !== "comparison" &&
      [attrs.leftTitle, attrs.rightTitle].some(value => typeof value === "string" && value.trim())) {
      throw new Error("Khối v1 chứa dữ liệu cột so sánh chưa có mapping.");
    }
    if (kind === "comparison") {
      const a = String(attrs.leftTitle ?? "");
      const b = String(attrs.rightTitle ?? "");
      const table: KnowledgeDocumentNode = {
        type: "table", attrs: { purpose: "comparison" },
        content: [
          { type: "tableRow", content: [a,b].map(t => ({
            type: "tableHeader", attrs: { colspan: 1, rowspan: 1, colwidth: null }, content: paragraphs(t),
          })) },
          { type: "tableRow", content: [attrs.body,attrs.secondary].map(t => ({
            type: "tableCell", attrs: { colspan: 1, rowspan: 1, colwidth: null }, content: paragraphs(t),
          })) },
        ],
      };
      const title = typeof attrs.title === "string" && attrs.title.trim() ? attrs.title.trim() : "";
      return title ? [{ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: title }] }, table] : [table];
    }
    if (!isLearningKind(kind)) throw new Error("Khối v1 không được hỗ trợ: " + String(kind));
    const block = createLearningBlock(kind);
    block.attrs = { ...block.attrs, title: typeof attrs.title === "string" ? attrs.title : LEARNING_BLOCK_LABELS[kind] };
    const roleContents: Partial<Record<KnowledgeLearningSectionRole, unknown>> = {
      [kind === "formula" ? "expression" : kind === "example" ? "example" : kind === "commonMistake" ? "incorrect" : "body"]: attrs.body,
      [kind === "commonMistake" ? "correct" : "explanation"]: attrs.secondary,
    };
    block.content = (block.content ?? []).map(section => ({
      ...section, content: paragraphs(roleContents[section.attrs?.role as KnowledgeLearningSectionRole]),
    }));
    return [block];
  }
  return [{ ...node, ...(node.content ? { content: node.content.flatMap(legacyNode) } : {}) }];
}
export function migrateV1Document(document: KnowledgeDocument): KnowledgeDocument {
  return { type: "doc", content: document.content.flatMap(legacyNode) };
}

/** Validate the portable JSON strictly: never silently drop unsupported nodes/fields. */
const docNodes = new Set(["paragraph", "heading", "bulletList", "orderedList", "listItem",
  "horizontalRule", "hardBreak", "text", "table", "tableRow", "tableCell", "tableHeader",
  "learningBlock", "learningSection"]);
const summaryNodes = new Set(["paragraph", "bulletList", "orderedList", "listItem", "hardBreak", "text"]);
const marks = new Set(["bold", "italic", "link"]);
const has = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v);
function fail(path: string, message: string): never { throw new Error(`${path}: ${message}`); }
function nodeTextContent(node: KnowledgeDocumentNode) { return node.content ?? []; }
function checkNode(value: unknown, path: string, summary: boolean, depth: number): void {
  if (depth > 24) fail(path, "Tài liệu lồng nhau quá sâu.");
  if (!has(value) || typeof value.type !== "string") fail(path, "Node không hợp lệ.");
  const node = value as unknown as KnowledgeDocumentNode;
  const allowed = summary ? summaryNodes : docNodes;
  if (!allowed.has(node.type)) fail(path, `Loại node ${node.type} chưa được hỗ trợ.`);
  for (const k of Object.keys(node)) if (!["type", "text", "marks", "attrs", "content"].includes(k)) fail(path, `Trường không hỗ trợ: ${k}`);
  const allowedAttrs: Record<string, string[]> = {
    heading: ["level"], learningBlock: ["kind","title","variant"], learningSection: ["role"],
    table: ["purpose"], tableCell: ["colspan","rowspan","colwidth","align"], tableHeader: ["colspan","rowspan","colwidth","align"],
    orderedList: ["start","type"], bulletList: ["type"],
  };
  if (node.attrs !== undefined) {
    if (!has(node.attrs)) fail(path, "Attributes không hợp lệ.");
    for (const k of Object.keys(node.attrs)) if (!(allowedAttrs[node.type] ?? []).includes(k)) fail(path, `Attribute không hỗ trợ: ${k}`);
  }
  if (node.type === "text") {
    if (typeof node.text !== "string") fail(path, "Text phải là chuỗi.");
    if (node.content) fail(path, "Text không được chứa node con.");
    if (node.text.length > 100000) fail(path, "Đoạn văn quá dài.");
  } else if (node.text !== undefined) fail(path, "Chỉ text node có trường text.");
  if (node.type === "heading" && ![2,3].includes(Number(node.attrs?.level))) fail(path, "Heading chỉ hỗ trợ H2/H3.");
  const validChildren: Record<string, string[]> = {
    paragraph: ["text","hardBreak"],
    heading: ["text","hardBreak"],
    bulletList: ["listItem"],
    orderedList: ["listItem"],
    listItem: ["paragraph","bulletList","orderedList"],
    learningBlock: ["learningSection"],
    learningSection: ["paragraph","bulletList","orderedList"],
    table: ["tableRow"],
    tableRow: ["tableCell","tableHeader"],
    tableCell: ["paragraph","bulletList","orderedList"],
    tableHeader: ["paragraph","bulletList","orderedList"],
  };
  const children = nodeTextContent(node);
  if (validChildren[node.type] && children.some(n => !validChildren[node.type].includes(n.type))) {
    fail(path, "Cấu trúc node con không hợp lệ.");
  }
  if (["bulletList","orderedList","listItem","tableCell","tableHeader"].includes(node.type)
      && children.length === 0) fail(path, "Node này phải có nội dung con.");
  if (node.type === "learningBlock") {
    if (!isLearningKind(node.attrs?.kind)) fail(path, "Learning Block kind không hợp lệ.");
    if (typeof node.attrs?.title !== "string" || node.attrs.title.length > 200) fail(path, "Tiêu đề khối không hợp lệ.");
    if (typeof node.attrs?.variant !== "string" || !["default","note","tip","warning","important"].includes(node.attrs.variant)) fail(path, "Variant không hợp lệ.");
    if (nodeTextContent(node).length < 1 || nodeTextContent(node).some(n => n.type !== "learningSection")) fail(path, "Learning Block cần các section hợp lệ.");
    const expected = blockRoles[node.attrs.kind];
    const roles = nodeTextContent(node).map(n => n.attrs?.role);
    if (roles.length !== expected.length || roles.some((role,i) => role !== expected[i])) fail(path, "Section của khối không đúng loại hoặc thứ tự.");
  }
  if (node.type === "learningSection") {
    if (!Object.hasOwn(LEARNING_SECTION_LABELS, String(node.attrs?.role))) fail(path, "Vai trò section không hợp lệ.");
    if (nodeTextContent(node).length < 1 || nodeTextContent(node).some(n => !["paragraph","bulletList","orderedList"].includes(n.type))) fail(path, "Section chỉ chứa đoạn văn hoặc danh sách.");
  }
  if (node.type === "table") {
    if (!["general","comparison"].includes(String(node.attrs?.purpose))) fail(path, "Loại bảng không hợp lệ.");
    const rows = nodeTextContent(node);
    if (rows.length < 1 || rows.length > 100 || rows.some(r => r.type !== "tableRow")) fail(path, "Số hàng không hợp lệ.");
    // A merged cell can cover several columns AND future rows.
    // Validate occupied grid positions rather than summing cells in each row.
    const occupied: boolean[][] = rows.map(() => Array<boolean>(12).fill(false));
    rows.forEach((row, rowIndex) => {
      let column = 0;
      for (const cell of row.content ?? []) {
        while (column < 12 && occupied[rowIndex][column]) column++;
        const colspan = Number(cell.attrs?.colspan ?? 1);
        const rowspan = Number(cell.attrs?.rowspan ?? 1);
        if (!Number.isInteger(colspan) || colspan < 1 || colspan > 12 ||
            !Number.isInteger(rowspan) || rowspan < 1 ||
            column + colspan > 12 || rowIndex + rowspan > rows.length) {
          fail(path, "Ô bảng vượt quá giới hạn hàng hoặc cột.");
        }
        for (let r = rowIndex; r < rowIndex + rowspan; r++) {
          for (let c = column; c < column + colspan; c++) {
            if (occupied[r][c]) fail(path, "Các ô trong bảng bị chồng lên nhau.");
            occupied[r][c] = true;
          }
        }
        column += colspan;
      }
    });
    const widths = occupied.map(row => row.lastIndexOf(true) + 1);
    const width = widths[0];
    if (width < 2 || width > 12 ||
        widths.some((rowWidth, i) => rowWidth !== width ||
          occupied[i].slice(0, width).some(filled => !filled))) {
      fail(path, "Bảng có hàng/cột không đồng đều.");
    }
  }
  if (["tableCell","tableHeader"].includes(node.type)) {
    const colspan = node.attrs?.colspan ?? 1, rowspan = node.attrs?.rowspan ?? 1;
    if (!Number.isInteger(colspan) || Number(colspan) < 1 || Number(colspan) > 12 ||
        !Number.isInteger(rowspan) || Number(rowspan) < 1 || Number(rowspan) > 100)
      fail(path,"Kích thước ô không hợp lệ.");
    if (node.attrs?.align != null && !["left","center","right"].includes(String(node.attrs.align)))
      fail(path, "Căn lề ô không hợp lệ.");
    const colwidth = node.attrs?.colwidth;
    if (colwidth !== undefined && colwidth !== null &&
      (!Array.isArray(colwidth) || colwidth.length !== Number(colspan) ||
        colwidth.some(v=>!Number.isInteger(v) || v <= 0 || v > 4000))) fail(path,"Độ rộng cột không hợp lệ.");
  }
  if (node.marks !== undefined) {
    if (node.type !== "text" || !Array.isArray(node.marks)) fail(path, "Mark chỉ áp dụng cho text.");
    for (const mark of node.marks) {
      if (!has(mark) || !marks.has(String(mark.type))) fail(path, "Mark không hợp lệ.");
      if (Object.keys(mark).some(key => !["type","attrs"].includes(key))) fail(path, "Trường mark không hỗ trợ.");
      if (mark.type === "link") {
        if (!has(mark.attrs) || typeof mark.attrs.href !== "string" ||
            !normalizeSafeHref(mark.attrs.href)) fail(path, "Link không an toàn.");
        if (Object.keys(mark.attrs).some(k => !["href","target","rel","class"].includes(k))) {
          fail(path, "Thuộc tính link không được hỗ trợ.");
        }
        if (mark.attrs.target != null && !["_blank","_self"].includes(String(mark.attrs.target))) {
          fail(path, "Target của link không hợp lệ.");
        }
      } else if (mark.attrs && Object.keys(mark.attrs).length) {
        fail(path, "Mark không hỗ trợ attributes.");
      }
    }
  }
  if (node.content !== undefined) {
    if (!Array.isArray(node.content) || node.content.length > 3000) fail(path, "Danh sách node con không hợp lệ.");
    node.content.forEach((child, i) => checkNode(child, path + ".content[" + i + "]", summary, depth+1));
  }
}
export function validateKnowledgeDocument(document: unknown, summary = false): asserts document is KnowledgeDocument {
  if (!has(document) || document.type !== "doc" || !Array.isArray(document.content)) {
    throw new Error("Document root phải là doc và chứa content array.");
  }
  if (Object.keys(document).some(k => !["type","content"].includes(k))) {
    throw new Error("Document root chứa trường không hỗ trợ.");
  }
  if (document.content.length > 3000) throw new Error("Quá nhiều node trong tài liệu.");
  document.content.forEach((node, i) => checkNode(node,"content["+i+"]",summary,0));
  if (document.content.some((node: KnowledgeDocumentNode) =>
    !summary && !["paragraph","heading","bulletList","orderedList","horizontalRule","table","learningBlock"].includes(node.type)
  )) throw new Error("Root chứa node không hợp lệ.");
  if (summary && document.content.some((node: KnowledgeDocumentNode) =>
    !["paragraph","bulletList","orderedList"].includes(node.type)
  )) throw new Error("Quick Summary chứa node không được hỗ trợ.");
}
export function parseKnowledgeImport(raw: string): KnowledgeNoteEditorSnapshot | KnowledgeNoteBlockSnapshot {
  if (new TextEncoder().encode(raw).length > 512 * 1024) throw new Error("JSON vượt quá giới hạn 512 KB.");
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error("JSON không hợp lệ."); }
  if (!has(value)) throw new Error("JSON phải là object.");
  if (value.schemaVersion === 2) {
    const allowedEnvelope = value.format === "e-learning-knowledge-note-blocks"
      ? ["format","schemaVersion","content"]
      : ["format","schemaVersion","document","summary"];
    if (Object.keys(value).some(k => !allowedEnvelope.includes(k))) {
      throw new Error("File JSON chứa metadata hoặc trường chưa được hỗ trợ.");
    }
    if (value.format === "e-learning-knowledge-note-blocks") {
      if (!Array.isArray(value.content)) throw new Error("Block content phải là danh sách.");
      validateKnowledgeDocument({ type: "doc", content: value.content });
      return { format: "e-learning-knowledge-note-blocks", schemaVersion: 2, content: value.content as KnowledgeDocumentNode[] };
    }
    if (value.format !== KNOWLEDGE_NOTE_FORMAT) throw new Error("Định dạng file v2 không được hỗ trợ.");
    validateKnowledgeDocument(value.document);
    validateKnowledgeDocument(value.summary,true);
    return createEditorSnapshot(value.document, value.summary);
  }
  if (value.schemaVersion === 1) {
    if (!has(value.document) || value.document.type !== "doc" || !Array.isArray(value.document.content) ||
        !has(value.summary) || value.summary.type !== "doc" || !Array.isArray(value.summary.content)) {
      throw new Error("Tài liệu v1 không có document/summary hợp lệ.");
    }
    const doc = migrateV1Document(value.document as unknown as KnowledgeDocument);
    const summary = migrateV1Document(value.summary as unknown as KnowledgeDocument);
    validateKnowledgeDocument(doc);
    validateKnowledgeDocument(summary,true);
    return createEditorSnapshot(doc,summary);
  }
  throw new Error("schemaVersion không được hỗ trợ. Chỉ nhận v1 hoặc v2.");
}
