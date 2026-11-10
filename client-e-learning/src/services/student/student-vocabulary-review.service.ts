import { request } from "@/services/api.service";
import type {
  StudentVocabularyStudyCard,
  RecordVocabularyReviewRequest,
  VocabularyReviewResult,
} from "@/types/student-vocabulary-review";

/** Typed transport only. Phase 03 will connect this to Learn / Review screens. */
export const studentVocabularyReviewService = {
  listUnitCards: (unitId: number) =>
    request<StudentVocabularyStudyCard[]>(`/v1/student/vocabulary/units/${unitId}/cards`),

  recordReview: (wordId: number, payload: RecordVocabularyReviewRequest) =>
    request<VocabularyReviewResult>(`/v1/student/vocabulary/words/${wordId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
