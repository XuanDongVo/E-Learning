import type {
  Class,
  CreateClassRequest,
  UpdateClassRequest,
  ClassLeaderboardParams,
  ClassLeaderboardResponse,
} from "@/types/class";
import { request } from "@/services/api.service";

export const classService = {
  list: () => request<Class[]>("/v1/classes"),
  getById: (classId: number) => request<Class>(`/v1/classes/${classId}`),
  create: (payload: CreateClassRequest) =>
    request<Class>("/v1/classes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (classId: number, payload: UpdateClassRequest) =>
    request<Class>(`/v1/classes/${classId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  archive: (classId: number) =>
    request<Class>(`/v1/classes/${classId}/archive`, { method: "PATCH" }),
  restore: (classId: number) =>
    request<Class>(`/v1/classes/${classId}/restore`, { method: "PATCH" }),
  getLeaderboard: (classId: number, params?: ClassLeaderboardParams) => {
    const sp = new URLSearchParams();
    if (params?.metric) sp.set("metric", params.metric);
    if (params?.metric !== "STREAK" && params?.period) sp.set("period", params.period);
    if (params?.search && params.search.trim()) sp.set("search", params.search.trim());
    if (params?.page) sp.set("page", String(params.page));
    if (params?.size) sp.set("size", String(params.size));
    const qs = sp.toString();
    return request<ClassLeaderboardResponse>(
      `/v1/classes/${classId}/leaderboard${qs ? `?${qs}` : ""}`
    );
  },
};
