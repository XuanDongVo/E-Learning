import type { Class, CreateClassRequest } from "@/types/class";
import { request } from "@/services/api.service";

export const classService = {
  list: () => request<Class[]>("/v1/classes"),
  create: (payload: CreateClassRequest) => request<Class>("/v1/classes", { method: "POST", body: JSON.stringify(payload) }),
};