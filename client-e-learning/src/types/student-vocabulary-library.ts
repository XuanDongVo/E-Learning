import type { VocabularyPartOfSpeech } from "@/types/vocabulary";
import type {
  StudentVocabularyStudyCard,
  VocabularyFsrsState,
} from "@/types/student-vocabulary-review";

export type VocabularyLibraryStatus = "learned" | "due" | "waiting";
export type VocabularyScheduleStatus = "DUE" | "WAITING";
export type VocabularyOriginType = "UNIT";

export interface StudentVocabularyOrigin {
  type: VocabularyOriginType;
  id: number;
  code: string;
  name: string;
}

export interface StudentVocabularyLibrarySummary {
  learnedCount: number;
  dueCount: number;
  waitingCount: number;
  asOf: string;
}

export interface StudentVocabularyLibraryWord {
  wordId: number;
  origin: StudentVocabularyOrigin;
  word: string;
  meaningVi: string;
  partOfSpeech: VocabularyPartOfSpeech | null;
  pronunciationUk: string | null;
  pronunciationUs: string | null;
  fsrsState: Exclude<VocabularyFsrsState, "NEW">;
  scheduleStatus: VocabularyScheduleStatus;
  dueAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
}

export interface VocabularyLibraryPage<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface StudentVocabularyReviewQueue {
  asOf: string;
  totalDue: number;
  items: StudentVocabularyStudyCard[];
}
