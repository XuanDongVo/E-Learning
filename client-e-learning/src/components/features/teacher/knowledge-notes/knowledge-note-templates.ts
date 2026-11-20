import type { KnowledgeDocumentNode } from "@/types/knowledge-note";
import { createLearningBlock, createTable } from "./knowledge-note-document";

export interface KnowledgeTemplate {
  id: string;
  title: string;
  description: string;
  category: "Ngữ pháp" | "So sánh" | "Ví dụ" | "Lỗi thường gặp";
  schemaVersion: 2;
  content: KnowledgeDocumentNode[];
}
function withText(node: KnowledgeDocumentNode, role: string, text: string): KnowledgeDocumentNode {
  return {
    ...node,
    content: node.content?.map(section => ({
      ...section,
      content: section.attrs?.role === role
        ? [{ type: "paragraph", content: [{ type: "text", text }] }]
        : section.content,
    })),
  };
}
function text(value: string): KnowledgeDocumentNode {
  return { type: "paragraph", content: [{ type: "text", text: value }] };
}
function heading(value: string): KnowledgeDocumentNode {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: value }] };
}
function comparison(): KnowledgeDocumentNode {
  const table = createTable("comparison", 3, 4);
  const values = [
    ["Tiêu chí", "Hiện tại đơn", "Hiện tại tiếp diễn"],
    ["Cấu trúc", "S + V(s/es)", "S + am/is/are + V-ing"],
    ["Cách dùng", "Thói quen, sự thật", "Hành động đang diễn ra"],
    ["Dấu hiệu", "often, usually", "now, at the moment"],
  ];
  table.content = table.content?.map((row,ri) => ({
    ...row, content: row.content?.map((cell,ci) => ({
      ...cell, content: [text(values[ri][ci])],
    })),
  }));
  return table;
}
/** Built-in templates are versioned static content: no server or template entity. */
export const KNOWLEDGE_TEMPLATES: KnowledgeTemplate[] = [
  {
    id: "grammar-formula",
    title: "Công thức ngữ pháp",
    description: "Cấu trúc, giải thích và điều kiện sử dụng.",
    category: "Ngữ pháp",
    schemaVersion: 2,
    content: [withText(createLearningBlock("formula"), "expression", "S + V(s/es) + O")],
  },
  {
    id: "three-column-comparison",
    title: "So sánh các thì hiện tại",
    description: "Bảng ba cột; có thể thêm hàng và cột sau khi chèn.",
    category: "So sánh",
    schemaVersion: 2,
    content: [heading("So sánh hiện tại đơn và hiện tại tiếp diễn"), comparison()],
  },
  {
    id: "example-explained",
    title: "Ví dụ có giải thích",
    description: "Ví dụ, diễn giải và bản dịch độc lập.",
    category: "Ví dụ",
    schemaVersion: 2,
    content: [withText(createLearningBlock("example"), "example", "She goes to school every day.")],
  },
  {
    id: "common-mistake",
    title: "Lỗi thường gặp",
    description: "Câu sai, câu đúng và giải thích.",
    category: "Lỗi thường gặp",
    schemaVersion: 2,
    content: [
      withText(
        withText(createLearningBlock("commonMistake"), "incorrect", "She go to school."),
        "correct", "She goes to school.",
      ),
    ],
  },
  {
    id: "grammar-lesson-outline",
    title: "Khung bài lý thuyết",
    description: "Bố cục kiến thức gồm cấu trúc, ví dụ và lỗi thường gặp.",
    category: "Ngữ pháp",
    schemaVersion: 2,
    content: [
      heading("1. Cấu trúc"), createLearningBlock("formula"),
      heading("2. Ví dụ"), createLearningBlock("example"),
      heading("3. Lỗi thường gặp"), createLearningBlock("commonMistake"),
    ],
  },
];
