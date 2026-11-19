/** Knowledge Note simple MVP: one current document, no Draft/Revision entities. */
export type KnowledgeNoteStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
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
  linkedTopicCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
export interface KnowledgeNoteContent {
  knowledgeNoteId: number;
  document: KnowledgeDocument;
  summary: KnowledgeDocument | null;
  schemaVersion: number;
  editVersion: number;
  updatedAt: string;
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
export interface SaveKnowledgeNoteContentRequest {
  baseVersion: number;
  document: KnowledgeDocument;
  summary: KnowledgeDocument | null;
  schemaVersion: number;
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
  publishedAt: string;
}
export interface StudentTopicKnowledgeNotes {
  topicId: number;
  primary: { id: number; title: string; summary: KnowledgeDocument } | null;
  supplementary: { id: number; title: string }[];
}
