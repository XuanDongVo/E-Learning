import { request } from "@/services/api.service";
import type {
  StudentVocabularyStudyCard,
  RecordVocabularyReviewRequest,
  VocabularyReviewResult,
  StudentVocabularyUnitOverview,
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
};
