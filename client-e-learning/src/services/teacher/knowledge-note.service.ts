import { request } from "@/services/api.service";
import type { PageResponse } from "@/types/content";
import type {
  CreateKnowledgeNoteRequest,
  KnowledgeNote,
  KnowledgeNoteContent,
  SaveKnowledgeNoteContentRequest,
  TeacherKnowledgeNoteListFilters,
  TopicKnowledgeNoteLink,
  KnowledgeNoteTopicUsage,
} from "@/types/knowledge-note";

const ROOT = "/v1/teacher/knowledge-notes";

/** Metadata and Phase 02.3 persisted content transport. */
export const teacherKnowledgeNoteService = {
  create: (payload: CreateKnowledgeNoteRequest) =>
    request<KnowledgeNote>(ROOT, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  list: (filters: TeacherKnowledgeNoteListFilters = {}) => {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") q.set(key, String(value));
    }
    return request<PageResponse<KnowledgeNote>>(`${ROOT}${q.size ? `?${q.toString()}` : ""}`);
  },
  get: (id: number) => request<KnowledgeNote>(`${ROOT}/${id}`),
  publish: (id: number) => request<KnowledgeNote>(`${ROOT}/${id}/publish`, { method: "POST" }),
  unpublish: (id: number) => request<KnowledgeNote>(`${ROOT}/${id}/unpublish`, { method: "POST" }),
  archive: (id: number) => request<KnowledgeNote>(`${ROOT}/${id}/archive`, { method: "PATCH" }),
  listTopicLinks: (topicId: number) =>
    request<TopicKnowledgeNoteLink[]>(`${ROOT}/topics/${topicId}/links`),
  linkTopicNote: (topicId: number, noteId: number, primary: boolean) =>
    request<TopicKnowledgeNoteLink[]>(`${ROOT}/topics/${topicId}/links`, {
      method: "POST",
      body: JSON.stringify({ noteId, primary }),
    }),
  unlinkTopicNote: (topicId: number, noteId: number) =>
    request<TopicKnowledgeNoteLink[]>(`${ROOT}/topics/${topicId}/links/${noteId}`, {
      method: "DELETE",
    }),
  reorderTopicSupplementary: (topicId: number, noteIds: number[]) =>
    request<TopicKnowledgeNoteLink[]>(`${ROOT}/topics/${topicId}/supplementary-order`, {
      method: "PUT",
      body: JSON.stringify({ noteIds }),
    }),
  listLinkedTopics: (noteId: number) =>
    request<KnowledgeNoteTopicUsage[]>(`${ROOT}/${noteId}/topics`),
  getContent: (id: number) =>
    request<KnowledgeNoteContent>(`${ROOT}/${id}/content`),
  saveContent: (id: number, payload: SaveKnowledgeNoteContentRequest) =>
    request<KnowledgeNoteContent>(`${ROOT}/${id}/content`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
