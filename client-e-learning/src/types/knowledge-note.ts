export type KnowledgeNoteStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

export interface KnowledgeNote {
  id: number;
  gradeId: number;
  title: string;
  description: string | null;
  status: KnowledgeNoteStatus;
  linkedTopicCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateKnowledgeNoteRequest {
  gradeId: number;
  title: string;
  description?: string | null;
}

export interface TeacherKnowledgeNoteListFilters {
  gradeId?: number;
  status?: KnowledgeNoteStatus;
  search?: string;
  linked?: boolean;
  page?: number;
  size?: number;
}

export type KnowledgeLearningBlockKind =
  | "formula"
  | "example"
  | "callout"
  | "comparison"
  | "commonMistake";

export interface KnowledgeDocumentMark {
  type: "bold" | "italic" | "link";
  attrs?: { href?: string; target?: string; rel?: string };
}

export interface KnowledgeDocumentNode {
  type: string;
  text?: string;
  marks?: KnowledgeDocumentMark[];
  content?: KnowledgeDocumentNode[];
  attrs?: Record<string, string | number | boolean | null>;
}
export interface KnowledgeDocument {
  type: "doc";
  content: KnowledgeDocumentNode[];
}

export type KnowledgeNoteEditorState =
  | "clean"
  | "unsaved"
  | "saving"
  | "saveError"
  | "readOnly";

export interface KnowledgeNoteEditorSnapshot {
  schemaVersion: 1;
  document: KnowledgeDocument;
  summary: KnowledgeDocument;
}
