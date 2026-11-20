"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";
import type { CreateKnowledgeNoteRequest } from "@/types/knowledge-note";

export function useTeacherKnowledgeNotes(filters: TeacherKnowledgeNoteListFilters = {}) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherList(filters),
    queryFn: async () => (await teacherKnowledgeNoteService.list(filters)).data,
  });
}

export function useTeacherKnowledgeNote(id: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherDetail(id),
    queryFn: async () => (await teacherKnowledgeNoteService.get(id)).data,
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateTeacherKnowledgeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateKnowledgeNoteRequest) =>
      (await teacherKnowledgeNoteService.create(payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: KNOWLEDGE_NOTE_KEYS.teacherRoot,
      });
    },
  });
}
