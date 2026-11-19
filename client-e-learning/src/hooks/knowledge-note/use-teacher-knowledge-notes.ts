"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherKnowledgeNoteService } from "@/services/teacher/content/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";

/** Phase 03 hook shell. Queries remain disabled until server business logic is ready. */
export function useTeacherKnowledgeNotes(filters: TeacherKnowledgeNoteListFilters = {}) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherList(filters),
    queryFn: async () => (await teacherKnowledgeNoteService.list(filters)).data,
    enabled: false,
  });
}
export function useTeacherKnowledgeNoteDraft(noteId: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherDraft(noteId),
    queryFn: async () => (await teacherKnowledgeNoteService.getDraft(noteId)).data,
    enabled: false,
  });
}
