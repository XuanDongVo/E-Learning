import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";

/** Phase 01 only. Extend keys after Teacher/Student UI contract review. */
export const KNOWLEDGE_NOTE_KEYS = {
  teacherRoot: ["teacher", "knowledge-notes"] as const,
  teacherList: (filters: TeacherKnowledgeNoteListFilters) =>
    ["teacher", "knowledge-notes", "list", filters] as const,
  teacherDetail: (id: number) => ["teacher", "knowledge-notes", id] as const,
};
