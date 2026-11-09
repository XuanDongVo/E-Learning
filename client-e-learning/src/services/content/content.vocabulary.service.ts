import { request } from "@/services/api.service";
import type { PageResponse } from "@/types/content";
import type {
  VocabularyWord,
  CreateVocabularyWordRequest,
  UpdateVocabularyWordRequest,
  BulkCreateVocabularyWordsRequest,
  ReorderVocabularyRequest,
} from "@/types/vocabulary";

export const vocabularyService = {
  list: (
    unitId: number,
    params?: {
      status?: string;
      search?: string;
      page?: number;
      size?: number;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.size) searchParams.set("size", String(params.size));
    const qs = searchParams.toString();
    return request<PageResponse<VocabularyWord>>(
      `/v1/content/units/${unitId}/vocabulary${qs ? `?${qs}` : ""}`
    );
  },

  get: (id: number) =>
    request<VocabularyWord>(`/v1/content/vocabulary/${id}`),

  create: (unitId: number, payload: CreateVocabularyWordRequest) =>
    request<VocabularyWord>(`/v1/content/units/${unitId}/vocabulary`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  bulkCreate: (unitId: number, payload: BulkCreateVocabularyWordsRequest) =>
    request<VocabularyWord[]>(`/v1/content/units/${unitId}/vocabulary/bulk`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UpdateVocabularyWordRequest) =>
    request<VocabularyWord>(`/v1/content/vocabulary/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: number, status: "ACTIVE" | "INACTIVE") =>
    request<VocabularyWord>(`/v1/content/vocabulary/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id: number) =>
    request<void>(`/v1/content/vocabulary/${id}`, {
      method: "DELETE",
    }),

  reorder: (unitId: number, payload: ReorderVocabularyRequest) =>
    request<void>(`/v1/content/units/${unitId}/vocabulary/order`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

