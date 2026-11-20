import type {
  KnowledgeDocument,
  KnowledgeDocumentNode,
  KnowledgeLearningBlockKind,
  KnowledgeNoteEditorSnapshot,
} from "@/types/knowledge-note";

export const KNOWLEDGE_NOTE_SCHEMA_VERSION = 1 as const;

export const EMPTY_KNOWLEDGE_DOCUMENT: KnowledgeDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const EMPTY_KNOWLEDGE_SUMMARY: KnowledgeDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const LEARNING_BLOCK_LABELS: Record<KnowledgeLearningBlockKind, string> = {
  formula: "Công thức",
  example: "Ví dụ",
  callout: "Lưu ý",
  comparison: "So sánh",
  commonMistake: "Lỗi thường gặp",
};

export function createEditorSnapshot(
  document: KnowledgeDocument,
  summary: KnowledgeDocument,
): KnowledgeNoteEditorSnapshot {
  return {
    schemaVersion: KNOWLEDGE_NOTE_SCHEMA_VERSION,
    document,
    summary,
  };
}

export function isDocumentEmpty(document: KnowledgeDocument) {
  return !document.content.some(nodeHasContent);
}

function nodeHasContent(node: KnowledgeDocumentNode): boolean {
  if (node.type === "learningBlock") {
    return Object.values(node.attrs ?? {}).some(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
  }
  if (node.text?.trim()) return true;
  return node.content?.some(nodeHasContent) ?? false;
}

export function normalizeSafeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}
