import { request } from "@/services/api.service";
import type {
  StudentVocabularyLibrarySummary,
  StudentVocabularyLibraryWord,
  StudentVocabularyReviewQueue,
  VocabularyLibraryPage,
  VocabularyLibraryStatus,
} from "@/types/student-vocabulary-library";

export interface VocabularyLibraryListParams {
  page: number;
  size: number;
  search?: string;
}

function listPath(
  status: VocabularyLibraryStatus,
  params: VocabularyLibraryListParams,
) {
  const query = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  return `/v1/student/vocabulary/words/${status}?${query.toString()}`;
}

export const studentVocabularyLibraryService = {
  summary: () =>
    request<StudentVocabularyLibrarySummary>(
      "/v1/student/vocabulary/words/summary",
    ),
  list: (status: VocabularyLibraryStatus, params: VocabularyLibraryListParams) =>
    request<VocabularyLibraryPage<StudentVocabularyLibraryWord>>(
      listPath(status, params),
    ),
  reviewQueue: () =>
    request<StudentVocabularyReviewQueue>(
      "/v1/student/vocabulary/review-queue",
    ),
};
