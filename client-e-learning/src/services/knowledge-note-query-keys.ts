import type { TeacherKnowledgeNoteListFilters, StudentKnowledgeNoteListFilters } from "@/types/knowledge-note";

/** Knowledge Note query key factory; do not reuse Topic-content keys for cross-linked Notes. */
export const KNOWLEDGE_NOTE_KEYS = {
  teacherRoot: ["teacher", "knowledge-notes"] as const,
  teacherList: (filters: TeacherKnowledgeNoteListFilters) => ["teacher", "knowledge-notes", "list", filters] as const,
  teacherDetail: (id: number) => ["teacher", "knowledge-notes", id] as const,
  teacherDraft: (id: number) => ["teacher", "knowledge-notes", id, "draft"] as const,
  teacherRevisions: (id: number) => ["teacher", "knowledge-notes", id, "revisions"] as const,
  teacherTopicLinks: (topicId: number) => ["teacher", "topics", topicId, "knowledge-notes"] as const,
  studentRoot: ["student", "knowledge-notes"] as const,
  studentList: (filters: StudentKnowledgeNoteListFilters) => ["student", "knowledge-notes", "list", filters] as const,
  studentDetail: (id: number) => ["student", "knowledge-notes", id] as const,
  studentTopic: (topicId: number) => ["student", "topics", topicId, "knowledge-notes"] as const,
};
