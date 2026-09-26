import { request } from "@/services/api.service";
import type { PageResponse, QuestionResponse } from "@/types/content";

export interface ListQuestionsParams {
    bankId: number;
    search?: string;
    type?: string;
    difficulty?: string;
    isComplete?: boolean;
    page?: number;
    size?: number;
}

export const questionService = {
    list: (params: ListQuestionsParams) => {
        const query = new URLSearchParams();
        query.set("bankId", String(params.bankId));
        if (params.search) query.set("search", params.search);
        if (params.type) query.set("type", params.type);
        if (params.difficulty) query.set("difficulty", params.difficulty);
        if (params.isComplete !== undefined) query.set("isComplete", String(params.isComplete));
        query.set("page", String(params.page ?? 1));
        query.set("size", String(params.size ?? 10));
        return request<PageResponse<QuestionResponse>>(`/v1/content/questions?${query.toString()}`);
    },
    get: (id: number) => request<QuestionResponse>(`/v1/content/questions/${id}`),
};