import { request } from "@/services/api.service";
import type {
    ContentUnit,
    CreateUnitRequest,
    ReorderRequest,
    UpdateStatusRequest,
    UpdateUnitRequest,
} from "@/types/content";

export const unitService = {
    list: (gradeId: number) => request<ContentUnit[]>(`/v1/content/units?gradeId=${gradeId}`),
    get: (id: number) => request<ContentUnit>(`/v1/content/units/${id}`),
    create: (payload: CreateUnitRequest) =>
        request<ContentUnit>("/v1/content/units", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: UpdateUnitRequest) =>
        request<ContentUnit>(`/v1/content/units/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    archive: (id: number) => request<ContentUnit>(`/v1/content/units/${id}/archive`, { method: "PATCH" }),
    updateStatus: (id: number, payload: UpdateStatusRequest) =>
        request<ContentUnit>(`/v1/content/units/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
    reorder: (gradeId: number, payload: ReorderRequest) =>
        request<void>(`/v1/content/units/order?gradeId=${gradeId}`, { method: "PUT", body: JSON.stringify(payload) }),
};