"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";

/** Client-first flow: Teacher screens are not connected during contract review. */
export function useTeacherKnowledgeNotes(filters: TeacherKnowledgeNoteListFilters = {}) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherList(filters),
    queryFn: async () => (await teacherKnowledgeNoteService.list(filters)).data,
    enabled: false,
  });
}

export function useTeacherKnowledgeNote(id: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherDetail(id),
    queryFn: async () => (await teacherKnowledgeNoteService.get(id)).data,
    enabled: false,
  });
}
