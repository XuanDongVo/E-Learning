import { request } from "@/services/api.service";
import type {
  StudentKnowledgeFilters, StudentKnowledgeNoteDetail, StudentKnowledgePage, StudentTopicKnowledgeResponse,
} from "@/types/student-knowledge-note";

const ROOT = "/v1/student/knowledge-notes";

export const studentKnowledgeNoteService = {
  list: (filters: StudentKnowledgeFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search?.trim()) params.set("search", filters.search.trim());
    if (filters.unitId != null) params.set("unitId", String(filters.unitId));
    if (filters.topicId != null) params.set("topicId", String(filters.topicId));
    if (filters.role && filters.role !== "ALL") params.set("role", filters.role);
    params.set("page", String(filters.page ?? 1));
    params.set("size", String(filters.size ?? 12));
    return request<StudentKnowledgePage>(`${ROOT}?${params.toString()}`);
  },
  forTopic: (topicId: number) =>
    request<StudentTopicKnowledgeResponse>(`${ROOT}/topics/${topicId}`),
  get: (noteId: number) => request<StudentKnowledgeNoteDetail>(`${ROOT}/${noteId}`),
};
