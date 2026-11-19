import { request } from "@/services/api.service";
import type {
  KnowledgeNotePage, StudentKnowledgeNote, StudentKnowledgeNoteListFilters,
  StudentKnowledgeNoteListItem, StudentTopicKnowledgeNotes,
} from "@/types/knowledge-note";

/** Contract only: UI must not request data until Student Phase 04 is implemented. */
export const studentKnowledgeNoteService = {
  list: (filters: StudentKnowledgeNoteListFilters = {}) => {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") q.set(key, String(value));
    }
    const suffix = q.size ? `?${q.toString()}` : "";
    return request<KnowledgeNotePage<StudentKnowledgeNoteListItem>>(`/v1/student/knowledge-notes${suffix}`);
  },
  get: (id: number) => request<StudentKnowledgeNote>(`/v1/student/knowledge-notes/${id}`),
  topic: (topicId: number) => request<StudentTopicKnowledgeNotes>(`/v1/student/topics/${topicId}/knowledge-notes`),
};
