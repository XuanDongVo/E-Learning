import { request } from "@/services/api.service";
import type {
    ContentQuestionBank,
    GlobalQuestionBankFilters,
    GlobalQuestionBank,
    CreateQuestionBankRequest,
    UpdateQuestionBankRequest,
    UpdateStatusRequest,
    PageResponse,
} from "@/types/content";

export const questionBankService = {
    browse: (filters: GlobalQuestionBankFilters) => {
        const query = new URLSearchParams();
        if (filters.gradeId) query.set("gradeId", String(filters.gradeId));
        if (filters.unitId) query.set("unitId", String(filters.unitId));
        if (filters.sectionId) query.set("sectionId", String(filters.sectionId));
        if (filters.topicId) query.set("topicId", String(filters.topicId));
        if (filters.search?.trim()) query.set("search", filters.search.trim());
        if (filters.includeArchived) query.set("includeArchived", "true");
        query.set("page", String(filters.page ?? 1));
        query.set("size", String(filters.size ?? 20));
        return request<PageResponse<GlobalQuestionBank>>(`/v1/content/question-banks/browse?${query.toString()}`);
    },
    list: (topicId: number, includeArchived = false) => {
        const query = new URLSearchParams({ topicId: String(topicId) });
        if (includeArchived) query.set("includeArchived", "true");
        return request<ContentQuestionBank[]>(`/v1/content/question-banks?${query.toString()}`);
    },
    get: (id: number) => request<ContentQuestionBank>(`/v1/content/question-banks/${id}`),
    create: (payload: CreateQuestionBankRequest) =>
        request<ContentQuestionBank>("/v1/content/question-banks", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: UpdateQuestionBankRequest) =>
        request<ContentQuestionBank>(`/v1/content/question-banks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    archive: (id: number) =>
        request<ContentQuestionBank>(`/v1/content/question-banks/${id}/archive`, { method: "PATCH" }),
    updateStatus: (id: number, payload: UpdateStatusRequest) =>
        request<ContentQuestionBank>(`/v1/content/question-banks/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
};