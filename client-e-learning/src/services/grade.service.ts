import { request } from "@/services/api.service";
import type { CreateGradeRequest, Grade } from "@/types/grade";

export const gradeService = {
  list: () => request<Grade[]>("/v1/grades"),
  listAll: () => request<Grade[]>("/v1/grades/all"),
  create: (payload: CreateGradeRequest) =>
    request<Grade>("/v1/grades", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: CreateGradeRequest) =>
    request<Grade>(`/v1/grades/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deactivate: (id: number) =>
    request<Grade>(`/v1/grades/${id}/inactive`, {
      method: "PATCH",
    }),
  activate: (id: number) =>
    request<Grade>(`/v1/grades/${id}/activate`, {
      method: "PATCH",
    }),
  delete: (id: number) =>
    request<void>(`/v1/grades/${id}`, {
      method: "DELETE",
    }),
};