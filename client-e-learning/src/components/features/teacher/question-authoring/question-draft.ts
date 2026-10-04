"use client";

import type { DraftQuestion } from "@/types/question";

export type DraftOption = DraftQuestion["options"][number];

export function makeOptions(count: number): DraftOption[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String.fromCharCode(65 + index),
    text: "",
  }));
}

export function makeDraftQuestion(
  overrides?: Partial<DraftQuestion>,
): DraftQuestion {
  const options = overrides?.options ?? makeOptions(4);

  return {
    draftId: `draft-${Math.random().toString(36).slice(2, 9)}`,
    type: "SINGLE_CHOICE",
    difficulty: "EASY",
    text: "",
    options,
    correctOptionIds: options[0]?.id ? [options[0].id] : [],
    trueFalseAnswer: "TRUE",
    acceptedAnswers: [""],
    media: [],
    explanation: "",
    ...overrides,
  };
}
