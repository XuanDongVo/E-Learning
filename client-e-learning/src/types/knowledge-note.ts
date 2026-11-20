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

export type KnowledgeLearningBlockKind = "formula" | "example" | "callout" | "commonMistake";
export type KnowledgeLearningSectionRole =
  | "expression" | "explanation" | "condition" | "example" | "translation"
  | "body" | "incorrect" | "correct";

export interface KnowledgeDocumentMark {
  type: "bold" | "italic" | "link";
  attrs?: { href?: string; target?: string | null; rel?: string | null; class?: string | null };
}

/** ProseMirror/Tiptap JSON. Validate before importing or rendering untrusted input. */
export interface KnowledgeDocumentNode {
  type: string;
  text?: string;
  marks?: KnowledgeDocumentMark[];
  content?: KnowledgeDocumentNode[];
  attrs?: Record<string, unknown>;
}
export interface KnowledgeDocument {
  type: "doc";
  content: KnowledgeDocumentNode[];
}

export type KnowledgeNoteEditorState =
  | "clean" | "unsaved" | "saving" | "saveError" | "readOnly";

export interface KnowledgeNoteEditorSnapshot {
  format: "e-learning-knowledge-note";
  schemaVersion: 2;
  document: KnowledgeDocument;
  summary: KnowledgeDocument;
}

export interface KnowledgeNoteBlockSnapshot {
  format: "e-learning-knowledge-note-blocks";
  schemaVersion: 2;
  content: KnowledgeDocumentNode[];
}

/** Persistent content for the Teacher Editor. */
export interface KnowledgeNoteContent {
  knowledgeNoteId: number;
  schemaVersion: number;
  document: KnowledgeDocument;
  summary: KnowledgeDocument;
  updatedAt: string;
}

export interface SaveKnowledgeNoteContentRequest {
  schemaVersion: 2;
  document: KnowledgeDocument;
  summary: KnowledgeDocument;
}
