import { request } from "@/services/api.service";
import type { PageResponse } from "@/types/content";
import type {
  CreateKnowledgeNoteRequest,
  KnowledgeNote,
  TeacherKnowledgeNoteListFilters,
} from "@/types/knowledge-note";

const ROOT = "/v1/teacher/knowledge-notes";

/** Phase 01 approved transport only. Content/Publish/Topic/Student APIs are deferred. */
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
};
