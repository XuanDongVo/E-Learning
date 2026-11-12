import { request } from "@/services/api.service";
import type { VocabularyProgressDashboard } from "@/types/student-vocabulary-progress";

/**
 * Transport only for the read-only Vocabulary Progress endpoint.
 * The server derives student identity from JWT; no studentId parameter.
 *
 * NOT wired into the page yet: the page intentionally renders mock data until
 * StudentVocabularyProgressService#getDashboard is implemented on the server.
 */
export const studentVocabularyProgressService = {
  getDashboard: () =>
    request<VocabularyProgressDashboard>("/v1/student/vocabulary/progress"),
};
