import type { VocabularyLibraryStatus } from "@/types/student-vocabulary-library";

export const studentVocabularyQueryKeys = {
  root: ["student", "vocabulary"] as const,
  overview: ["student", "vocabulary", "overview"] as const,
  progress: ["student", "vocabulary", "progress"] as const,
  libraryRoot: ["student", "vocabulary", "library"] as const,
  summary: ["student", "vocabulary", "library", "summary"] as const,
  list: (
    status: VocabularyLibraryStatus,
    page: number,
    size: number,
    search: string,
  ) => ["student", "vocabulary", "library", status, { page, size, search }] as const,
  reviewQueue: ["student", "vocabulary", "review-queue"] as const,
  reviewPreview: (wordId: number) =>
    ["student", "vocabulary", "review-preview", wordId] as const,
};
