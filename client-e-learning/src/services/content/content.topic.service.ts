import { request } from "@/services/api.service";
import type {
    ContentTopic,
    CreateTopicRequest,
    ReorderRequest,
    UpdateStatusRequest,
    UpdateTopicRequest,
} from "@/types/content";

export const topicService = {
    list: (sectionId: number) => request<ContentTopic[]>(`/v1/content/topics?sectionId=${sectionId}`),
    get: (id: number) => request<ContentTopic>(`/v1/content/topics/${id}`),
    create: (payload: CreateTopicRequest) =>
        request<ContentTopic>("/v1/content/topics", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: UpdateTopicRequest) =>
        request<ContentTopic>(`/v1/content/topics/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    archive: (id: number) => request<ContentTopic>(`/v1/content/topics/${id}/archive`, { method: "PATCH" }),
    updateStatus: (id: number, payload: UpdateStatusRequest) =>
        request<ContentTopic>(`/v1/content/topics/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
    reorder: (sectionId: number, payload: ReorderRequest) =>
        request<void>(`/v1/content/topics/order?sectionId=${sectionId}`, { method: "PUT", body: JSON.stringify(payload) }),
};