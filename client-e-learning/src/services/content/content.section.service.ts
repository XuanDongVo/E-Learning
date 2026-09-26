import { request } from "@/services/api.service";
import type {
    ContentSection,
    CreateSectionRequest,
    ReorderRequest,
    UpdateSectionRequest,
    UpdateStatusRequest,
} from "@/types/content";

export const sectionService = {
    list: (unitId: number) => request<ContentSection[]>(`/v1/content/sections?unitId=${unitId}`),
    get: (id: number) => request<ContentSection>(`/v1/content/sections/${id}`),
    create: (payload: CreateSectionRequest) =>
        request<ContentSection>("/v1/content/sections", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: UpdateSectionRequest) =>
        request<ContentSection>(`/v1/content/sections/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    archive: (id: number) => request<ContentSection>(`/v1/content/sections/${id}/archive`, { method: "PATCH" }),
    updateStatus: (id: number, payload: UpdateStatusRequest) =>
        request<ContentSection>(`/v1/content/sections/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
    reorder: (unitId: number, payload: ReorderRequest) =>
        request<void>(`/v1/content/sections/order?unitId=${unitId}`, { method: "PUT", body: JSON.stringify(payload) }),
};