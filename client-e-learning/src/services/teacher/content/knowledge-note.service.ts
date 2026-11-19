import { request } from "@/services/api.service";
import type {
  AttachKnowledgeNoteRequest, CreateKnowledgeNoteRequest, KnowledgeNote,
  KnowledgeNoteContent, KnowledgeNotePage, KnowledgeNoteTopicLink,
  ReorderKnowledgeNoteLinksRequest, SaveKnowledgeNoteContentRequest,
  TeacherKnowledgeNoteListFilters, UpdateKnowledgeNoteMetadataRequest,
} from "@/types/knowledge-note";

function listQuery(params: TeacherKnowledgeNoteListFilters) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.set(key, String(value));
  }
  return q.size ? `?${q.toString()}` : "";
}

/** Typed transport only; backend still returns 501 until Phase 01. */
export const teacherKnowledgeNoteService = {
  list: (filters: TeacherKnowledgeNoteListFilters = {}) =>
    request<KnowledgeNotePage<KnowledgeNote>>(`/v1/content/knowledge-notes${listQuery(filters)}`),
  create: (payload: CreateKnowledgeNoteRequest) =>
    request<KnowledgeNote>("/v1/content/knowledge-notes", { method: "POST", body: JSON.stringify(payload) }),
  get: (id: number) => request<KnowledgeNote>(`/v1/content/knowledge-notes/${id}`),
  updateMetadata: (id: number, payload: UpdateKnowledgeNoteMetadataRequest) =>
    request<KnowledgeNote>(`/v1/content/knowledge-notes/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  getContent: (id: number) => request<KnowledgeNoteContent>(`/v1/content/knowledge-notes/${id}/content`),
  saveContent: (id: number, payload: SaveKnowledgeNoteContentRequest) =>
    request<KnowledgeNoteContent>(`/v1/content/knowledge-notes/${id}/content`, { method: "PUT", body: JSON.stringify(payload) }),
  publish: (id: number) =>
    request<KnowledgeNote>(`/v1/content/knowledge-notes/${id}/publish`, { method: "POST" }),
  unpublish: (id: number) =>
    request<KnowledgeNote>(`/v1/content/knowledge-notes/${id}/unpublish`, { method: "POST" }),
  archive: (id: number) =>
    request<KnowledgeNote>(`/v1/content/knowledge-notes/${id}/archive`, { method: "PATCH" }),
  noteLinks: (id: number) => request<KnowledgeNoteTopicLink[]>(`/v1/content/knowledge-notes/${id}/topic-links`),
  topicLinks: (topicId: number) => request<KnowledgeNoteTopicLink[]>(`/v1/content/topics/${topicId}/knowledge-notes`),
  attachToTopic: (topicId: number, payload: AttachKnowledgeNoteRequest) =>
    request<KnowledgeNoteTopicLink>(`/v1/content/topics/${topicId}/knowledge-notes`, { method: "POST", body: JSON.stringify(payload) }),
  detachFromTopic: (topicId: number, noteId: number) =>
    request<null>(`/v1/content/topics/${topicId}/knowledge-notes/${noteId}`, { method: "DELETE" }),
  setTopicPrimary: (topicId: number, knowledgeNoteId: number | null) =>
    request<null>(`/v1/content/topics/${topicId}/knowledge-notes/primary`, {
      method: "PUT", body: JSON.stringify({ knowledgeNoteId }),
    }),
  reorderTopicNotes: (topicId: number, payload: ReorderKnowledgeNoteLinksRequest) =>
    request<null>(`/v1/content/topics/${topicId}/knowledge-notes/order`, { method: "PUT", body: JSON.stringify(payload) }),
};
