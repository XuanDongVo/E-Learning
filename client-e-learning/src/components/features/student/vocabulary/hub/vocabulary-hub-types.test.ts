import { describe, expect, it } from "vitest";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import {
  formatVocabularyReviewDelay,
  getVocabularyDueLabel,
  isVocabularyCardDue,
  nextVocabularyDueAt,
} from "./vocabulary-hub-types";

const baseCard: StudentVocabularyStudyCard = {
  wordId: 1,
  word: "apple",
  meaningVi: "quả táo",
  pronunciationUk: null,
  pronunciationUs: null,
  partOfSpeech: null,
  imageUrl: null,
  exampleSentence: null,
  exampleMeaningVi: null,
  relatedTerms: { wordFamilies: [], synonyms: [], antonyms: [] },
  state: "NEW",
  dueAt: null,
  reviewCount: 0,
  due: false,
  canUndoBrowseMark: false,
};

describe("Vocabulary due time helpers", () => {
  const now = Date.parse("2026-11-18T10:00:00Z");

  it("does not count NEW words as due for Review", () => {
    expect(isVocabularyCardDue({ ...baseCard, due: true }, now)).toBe(false);
    expect(getVocabularyDueLabel(baseCard, now)).toBe("Từ mới");
  });

  it("recognizes a due card at its actual timestamp even with a stale API snapshot", () => {
    const card = {
      ...baseCard,
      state: "REVIEW" as const,
      dueAt: "2026-11-18T10:00:00Z",
      due: false,
    };
    expect(isVocabularyCardDue(card, now - 1)).toBe(false);
    expect(isVocabularyCardDue(card, now)).toBe(true);
    expect(getVocabularyDueLabel(card, now)).toBe("Đến hạn ôn");
  });

  it("finds the nearest pending due boundary, skipping new and already-due cards", () => {
    const later = { ...baseCard, state: "REVIEW" as const, dueAt: "2026-11-18T12:00:00Z" };
    const sooner = { ...baseCard, wordId: 2, state: "LEARNING" as const, dueAt: "2026-11-18T11:00:00Z" };
    const alreadyDue = { ...baseCard, wordId: 3, state: "REVIEW" as const, dueAt: "2026-11-18T09:00:00Z" };
    expect(nextVocabularyDueAt([later, sooner, alreadyDue, baseCard], now))
      .toBe(Date.parse("2026-11-18T11:00:00Z"));
  });

  it("formats AGAIN's short FSRS delay without hardcoding one minute", () => {
    expect(formatVocabularyReviewDelay("2026-11-18T10:00:30Z", now)).toBe("Dưới 1 phút");
    expect(formatVocabularyReviewDelay("2026-11-18T10:06:00Z", now)).toBe("6 phút");
    expect(formatVocabularyReviewDelay("2026-11-18T10:00:00Z", now)).toBe("Ngay");
  });
});
