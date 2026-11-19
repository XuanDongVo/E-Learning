"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherKnowledgeNoteService } from "@/services/teacher/content/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";

/** Hook shells remain disabled until backend Phase 01. */
export function useTeacherKnowledgeNotes(filters: TeacherKnowledgeNoteListFilters = {}) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherList(filters),
    queryFn: async () => (await teacherKnowledgeNoteService.list(filters)).data,
    enabled: false,
  });
}
export function useTeacherKnowledgeNoteContent(noteId: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherContent(noteId),
    queryFn: async () => (await teacherKnowledgeNoteService.getContent(noteId)).data,
    enabled: false,
  });
}
