import { request } from "@/services/api.service";
import type {
  GuidedCapabilities,
  GuidedDefinition,
  GuidedDefinitionDraft,
  GuidedDefinitionValidation,
} from "@/types/guided-reasoning";

export const guidedDefinitionService = {
  get: (questionId: number) =>
    request<GuidedDefinition>(`/v1/content/questions/${questionId}/guided`),
  saveDraft: (questionId: number, payload: GuidedDefinitionDraft) =>
    request<GuidedDefinition>(`/v1/content/questions/${questionId}/guided`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  validate: (questionId: number, expectedVersion: number) =>
    request<GuidedDefinitionValidation>(
      `/v1/content/questions/${questionId}/guided/validate`,
      { method: "POST", body: JSON.stringify({ expectedVersion }) },
    ),
  remove: (questionId: number) =>
    request<void>(`/v1/content/questions/${questionId}/guided`, { method: "DELETE" }),
  capabilities: () => request<GuidedCapabilities>("/v1/content/guided/capabilities"),
};
