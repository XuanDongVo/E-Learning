import { request } from "@/services/api.service";
import type { VocabularyProgressDashboard } from "@/types/student-vocabulary-progress";

/**
 * Transport only for the read-only Vocabulary Progress endpoint.
 * The server derives student identity from JWT; no studentId parameter.
 *
 */
export const studentVocabularyProgressService = {
  getDashboard: () =>
    request<VocabularyProgressDashboard>("/v1/student/vocabulary/progress"),
};
