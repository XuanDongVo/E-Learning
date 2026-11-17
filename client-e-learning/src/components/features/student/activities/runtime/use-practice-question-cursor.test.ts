import { describe, expect, it } from "vitest";
import { resolvePracticeQuestionId } from "./use-practice-question-cursor";

const session = {
  questions: [
    { id: 11, resolved: false },
    { id: 12, resolved: false },
    { id: 13, resolved: true },
  ],
};

describe("resolvePracticeQuestionId", () => {
  it("honors a selected question instead of forcing the first unresolved one", () => {
    expect(resolvePracticeQuestionId(session, 12)).toBe(12);
  });

  it("keeps an explicitly selected resolved question available", () => {
    expect(resolvePracticeQuestionId(session, 13)).toBe(13);
  });

  it("falls back safely when the selected question is not in the session", () => {
    expect(resolvePracticeQuestionId(session, 99)).toBe(11);
  });
});
