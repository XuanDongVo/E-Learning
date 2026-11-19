/** Knowledge Note v3.1 contracts. No category, media or Topic ownership in MVP. */
export type KnowledgeNoteStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

/** Parsed/validated on the server; client may not render arbitrary HTML. */
export interface KnowledgeDocumentNode {
  type: string;
  attrs?: Record<string, string | number | boolean | null>;
  text?: string;
  marks?: { type: string; attrs?: Record<string, string | number | boolean | null> }[];
  content?: KnowledgeDocumentNode[];
}
export interface KnowledgeDocument {
  type: "doc";
  content: KnowledgeDocumentNode[];
}
export interface KnowledgeNote {
  id: number;
  gradeId: number;
  title: string;
  description: string | null;
  status: KnowledgeNoteStatus;
  publishedRevisionId: number | null;
  linkedTopicCount: number;
  hasUnpublishedChanges: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
export interface KnowledgeNoteDraft {
  knowledgeNoteId: number;
  title: string;
  description: string | null;
  summary: KnowledgeDocument | null;
  document: KnowledgeDocument;
  schemaVersion: number;
  editVersion: number;
  updatedAt: string;
}
export interface KnowledgeNoteRevision {
  id: number;
  knowledgeNoteId: number;
  revisionNumber: number;
  title: string;
  publishedAt: string;
}
export interface KnowledgeNoteTopicLink {
  knowledgeNoteId: number;
  topicId: number;
  title: string;
  status: KnowledgeNoteStatus;
  isPrimary: boolean;
  displayOrder: number;
}
export interface CreateKnowledgeNoteRequest {
  gradeId: number;
  title: string;
  description?: string | null;
}
export type UpdateKnowledgeNoteMetadataRequest = CreateKnowledgeNoteRequest;
export interface SaveKnowledgeNoteDraftRequest {
  baseVersion: number;
  document: KnowledgeDocument;
  summary: KnowledgeDocument | null;
  schemaVersion: number;
  title?: string;
  description?: string | null;
}
export interface AttachKnowledgeNoteRequest {
  knowledgeNoteId: number;
  isPrimary?: boolean;
}
export interface ReorderKnowledgeNoteLinksRequest {
  items: { knowledgeNoteId: number; displayOrder: number }[];
}
export interface KnowledgeNotePage<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface TeacherKnowledgeNoteListFilters {
  gradeId?: number;
  status?: KnowledgeNoteStatus;
  search?: string;
  linked?: boolean;
  page?: number;
  size?: number;
}
export interface StudentKnowledgeNoteListFilters {
  gradeId?: number;
  unitId?: number;
  search?: string;
  page?: number;
  size?: number;
}
export interface StudentKnowledgeNoteListItem {
  id: number;
  gradeId: number;
  title: string;
  description: string | null;
  linkedTopicCount: number;
}
export interface StudentKnowledgeNote {
  id: number;
  gradeId: number;
  title: string;
  description: string | null;
  summary: KnowledgeDocument | null;
  document: KnowledgeDocument;
  revisionNumber: number;
  publishedAt: string;
}
export interface StudentTopicKnowledgeNotes {
  topicId: number;
  primary: { id: number; title: string; summary: KnowledgeDocument } | null;
  supplementary: { id: number; title: string }[];
}
