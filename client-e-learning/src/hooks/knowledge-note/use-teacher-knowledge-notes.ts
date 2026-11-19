"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherKnowledgeNoteService } from "@/services/teacher/knowledge-note.service";
import { KNOWLEDGE_NOTE_KEYS } from "@/services/knowledge-note-query-keys";
import type { TeacherKnowledgeNoteListFilters } from "@/types/knowledge-note";

export function useTeacherKnowledgeNotes(filters: TeacherKnowledgeNoteListFilters = {}) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherList(filters),
    queryFn: async () => {
      const response = await teacherKnowledgeNoteService.list(filters);
      if (!response.data || !Array.isArray(response.data.items)) throw new Error("Không thể tải danh sách Knowledge Note.");
      return response.data;
    },
  });
}

export function useTeacherKnowledgeNote(id: number) {
  return useQuery({
    queryKey: KNOWLEDGE_NOTE_KEYS.teacherDetail(id),
    queryFn: async () => {
      const response = await teacherKnowledgeNoteService.get(id);
      if (!response.data) throw new Error("Không thể tải chi tiết Knowledge Note.");
      return response.data;
    },
    enabled: Number.isSafeInteger(id) && id > 0,
  });
}
