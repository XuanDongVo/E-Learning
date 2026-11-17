import { request } from "@/services/api.service";
import type {
  StudentVocabularyStudyCard,
  RecordVocabularyReviewRequest,
  VocabularyReviewResult,
  StudentVocabularyUnitOverview,
  VocabularyReviewPreview,
} from "@/types/student-vocabulary-review";

/** Student-only Vocabulary Library, Unit cards and FSRS transport. */
export const studentVocabularyReviewService = {
  listOverview: () =>
    request<StudentVocabularyUnitOverview[]>("/v1/student/vocabulary/overview"),
  listUnitCards: (unitId: number) =>
    request<StudentVocabularyStudyCard[]>(`/v1/student/vocabulary/units/${unitId}/cards`),

  recordReview: (wordId: number, payload: RecordVocabularyReviewRequest) =>
    request<VocabularyReviewResult>(`/v1/student/vocabulary/words/${wordId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  markKnown: (wordId: number, requestId: string) =>
    request<VocabularyReviewResult>(`/v1/student/vocabulary/words/${wordId}/mark`, {
      method: "POST", body: JSON.stringify({ requestId }),
    }),
  unmarkKnown: (wordId: number) =>
    request<void>(`/v1/student/vocabulary/words/${wordId}/mark`, { method: "DELETE" }),
  previewReview: (wordId: number) =>
    request<VocabularyReviewPreview>(`/v1/student/vocabulary/words/${wordId}/review-preview`),
};
