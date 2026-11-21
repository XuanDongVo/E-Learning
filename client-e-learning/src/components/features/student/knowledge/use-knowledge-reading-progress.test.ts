import { describe, expect, it } from "vitest";
import { calculateReadingPercent } from "./use-knowledge-reading-progress";

describe("session-only Knowledge Note reading progress", () => {
  it("clamps progress for unseen, partially read and fully read content", () => {
    expect(calculateReadingPercent(100, 1100, 0)).toBe(0);
    expect(calculateReadingPercent(100, 1100, 600)).toBe(50);
    expect(calculateReadingPercent(100, 1100, 2000)).toBe(100);
  });
  it("ignores invalid scroll bounds", () => {
    expect(calculateReadingPercent(0, 0, 100)).toBe(0);
    expect(calculateReadingPercent(NaN, 100, 50)).toBe(0);
  });
});
