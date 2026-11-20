import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";

/** Teacher metadata and content query keys. */
export const KNOWLEDGE_NOTE_KEYS = {
  teacherRoot: ["teacher", "knowledge-notes"] as const,
  teacherList: (filters: TeacherKnowledgeNoteListFilters) =>
    ["teacher", "knowledge-notes", "list", filters] as const,
  teacherDetail: (id: number) => ["teacher", "knowledge-notes", id] as const,
  teacherContent: (id: number) => ["teacher", "knowledge-notes", id, "content"] as const,
};
