/** Knowledge Note API contract: Phase 01 only (three Teacher metadata operations). */
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
  /** Existing common PageResponse is 1-indexed. */
  page?: number;
  size?: number;
}

/** Editor document shape is a future UI-only contract, not a Phase 01 endpoint. */
export interface KnowledgeDocumentNode {
  type: string;
  text?: string;
  content?: KnowledgeDocumentNode[];
  attrs?: Record<string, string | number | boolean | null>;
}
export interface KnowledgeDocument {
  type: "doc";
  content: KnowledgeDocumentNode[];
}
