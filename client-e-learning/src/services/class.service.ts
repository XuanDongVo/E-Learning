import type { Class, CreateClassRequest, UpdateClassRequest } from "@/types/class";
import { request } from "@/services/api.service";

export const classService = {
  list: () => request<Class[]>("/v1/classes"),
  create: (payload: CreateClassRequest) => request<Class>("/v1/classes", { method: "POST", body: JSON.stringify(payload) }),
  update: (classId: number, payload: UpdateClassRequest) => request<Class>("/v1/classes/" + classId, { method: "PUT", body: JSON.stringify(payload) }),
  archive: (classId: number) => request<Class>("/v1/classes/" + classId + "/archive", { method: "PATCH" }),
};
