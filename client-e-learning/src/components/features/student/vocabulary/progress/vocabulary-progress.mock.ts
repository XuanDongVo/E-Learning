import type { VocabularyProgressDashboard } from "@/types/student-vocabulary-progress";

const AS_OF = "2026-11-12";
const DAY_MS = 86_400_000;

function dayOffset(offset: number): string {
  const day = new Date(AS_OF + "T12:00:00Z");
  return new Date(day.getTime() + offset * DAY_MS).toISOString().slice(0, 10);
}

/** Deterministic UI fixtures. Nothing here reflects a real student's progress. */
export const vocabularyProgressMock: VocabularyProgressDashboard = {
  asOfDate: AS_OF,
  timeZone: "Asia/Ho_Chi_Minh",
  today: {
    completedDistinctWords: 3,
    dailyTarget: 5,
    qualifiedToday: false,
    dueNow: 12,
  },
  overview: {
    totalWords: 120,
    learnedWords: 68,
    newWords: 52,
  },
  tree: {
    currentStreak: 2,
    longestStreak: 14,
    totalQualifiedDays: 27,
    highestUnlockedMilestone: 14,
    nextMilestone: 30,
  },
  upcomingReviews: [
    { date: dayOffset(0), dueCount: 12 },
    { date: dayOffset(1), dueCount: 8 },
    { date: dayOffset(2), dueCount: 5 },
    { date: dayOffset(3), dueCount: 10 },
    { date: dayOffset(4), dueCount: 3 },
    { date: dayOffset(5), dueCount: 7 },
    { date: dayOffset(6), dueCount: 4 },
  ],
  activityDays: Array.from({ length: 84 }, (_, index) => {
    const offset = index - 83;
    const count = offset === 0 ? 3 : (index * 7 + Math.floor(index / 5) * 3) % 13;
    return {
      date: dayOffset(offset),
      qualifiedWordCount: count,
      qualifiedDay: count >= 5,
    };
  }),
  units: [
    { unitId: 1, code: "U01", name: "Unit 1 · My Hobbies", totalCount: 20, learnedCount: 18, newCount: 2, dueCount: 4 },
    { unitId: 2, code: "U02", name: "Unit 2 · Healthy Living", totalCount: 20, learnedCount: 16, newCount: 4, dueCount: 3 },
    { unitId: 3, code: "U03", name: "Unit 3 · Community Service", totalCount: 20, learnedCount: 14, newCount: 6, dueCount: 2 },
    { unitId: 4, code: "U04", name: "Unit 4 · Music and Arts", totalCount: 20, learnedCount: 10, newCount: 10, dueCount: 2 },
    { unitId: 5, code: "U05", name: "Unit 5 · Food and Drink", totalCount: 20, learnedCount: 7, newCount: 13, dueCount: 1 },
    { unitId: 6, code: "U06", name: "Unit 6 · A Visit to a School", totalCount: 20, learnedCount: 3, newCount: 17, dueCount: 0 },
  ],
  attentionWords: [
    { wordId: 1, word: "remember", meaningVi: "ghi nhớ", unitId: 1, unitName: "Unit 1", againCount: 3, hardCount: 2, dueAt: dayOffset(0) + "T02:00:00Z" },
    { wordId: 2, word: "describe", meaningVi: "mô tả", unitId: 2, unitName: "Unit 2", againCount: 2, hardCount: 3, dueAt: dayOffset(0) + "T06:00:00Z" },
    { wordId: 3, word: "compare", meaningVi: "so sánh", unitId: 3, unitName: "Unit 3", againCount: 2, hardCount: 1, dueAt: dayOffset(1) + "T02:00:00Z" },
  ],
};
