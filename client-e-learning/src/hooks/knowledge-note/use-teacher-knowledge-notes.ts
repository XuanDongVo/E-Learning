"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";
import type { CreateKnowledgeNoteRequest } from "@/types/knowledge-note";

export function useTeacherKnowledgeNotes(filters: TeacherKnowledgeNoteListFilters = {}) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherList(filters),
<<<<<<< HEAD
    queryFn: async () => (await teacherKnowledgeNoteService.list(filters)).data,
=======
    queryFn: async () => {
      const response = await teacherKnowledgeNoteService.list(filters);
      if (!response.data || !Array.isArray(response.data.items)) throw new Error("Không thể tải danh sách Knowledge Note.");
      return response.data;
    },
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
  });
}

export function useTeacherKnowledgeNote(id: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherDetail(id),
<<<<<<< HEAD
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
=======
    queryFn: async () => {
      const response = await teacherKnowledgeNoteService.get(id);
      if (!response.data) throw new Error("Không thể tải chi tiết Knowledge Note.");
      return response.data;
    },
    enabled: Number.isSafeInteger(id) && id > 0,
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
  });
}
