"use client";

import { useQuery } from "@tanstack/react-query";
import { studentKnowledgeNoteService } from "@/services/student/student-knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import type { StudentKnowledgeNoteListFilters } from "@/types/knowledge-note";

/** Phase 04 hook shell. No draft or unpublished content may reach Student. */
export function useStudentKnowledgeNotes(filters: StudentKnowledgeNoteListFilters = {}) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.studentList(filters),
    queryFn: async () => (await studentKnowledgeNoteService.list(filters)).data,
    enabled: false,
  });
}
export function useStudentKnowledgeNote(noteId: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.studentDetail(noteId),
    queryFn: async () => (await studentKnowledgeNoteService.get(noteId)).data,
    enabled: false,
  });
}
export function useStudentTopicKnowledge(topicId: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.studentTopic(topicId),
    queryFn: async () => (await studentKnowledgeNoteService.topic(topicId)).data,
    enabled: false,
  });
}
