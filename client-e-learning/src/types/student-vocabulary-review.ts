import type { VocabularyPartOfSpeech, VocabularyRelatedTerms } from "@/types/vocabulary";

export type VocabularyFsrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY";
export type VocabularyFsrsState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

export interface StudentVocabularyUnitOverview {
  unitId: number;
  code: string;
  name: string;
  coverUrl: string | null;
  displayOrder: number;
  totalCount: number;
  newCount: number;
  dueCount: number;
  learnedCount: number;
}

export interface StudentVocabularyStudyCard {
  wordId: number;
  word: string;
  meaningVi: string;
  pronunciationUk: string | null;
  pronunciationUs: string | null;
  partOfSpeech: VocabularyPartOfSpeech | null;
  imageUrl: string | null;
  exampleSentence: string | null;
  exampleMeaningVi: string | null;
  relatedTerms: VocabularyRelatedTerms;
  state: VocabularyFsrsState;
  dueAt: string | null;
  reviewCount: number;
  due: boolean;
}

export interface RecordVocabularyReviewRequest {
  /** New UUID for each *logical* rating; reuse the same value only when retrying. */
  requestId: string;
  rating: VocabularyFsrsRating;
}

export interface VocabularyReviewResult {
  wordId: number;
  requestId: string;
  rating: VocabularyFsrsRating;
  state: Exclude<VocabularyFsrsState, "NEW">;
  reviewedAt: string;
  dueAt: string;
  reviewCount: number;
}

export interface VocabularyReviewPreview {
  wordId: number;
  dueAtByRating: Partial<Record<VocabularyFsrsRating, string>>;
}
