import { request } from "@/services/api.service";
import type {
    ContentQuestionBank,
    CreateQuestionBankRequest,
    UpdateQuestionBankRequest,
    UpdateStatusRequest,
} from "@/types/content";

export const questionBankService = {
    list: (topicId: number) => request<ContentQuestionBank[]>(`/v1/content/question-banks?topicId=${topicId}`),
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