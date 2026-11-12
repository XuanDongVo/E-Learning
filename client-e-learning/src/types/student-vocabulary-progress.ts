/**
 * Mirrors VocabularyProgressDashboardResponse.java for GET /v1/student/vocabulary/progress.
 * The transport lives in student-vocabulary-progress.service.ts.
 * The UI continues using vocabulary-progress.mock.ts until backend aggregation is ready.
 */
export type MemoryTreeMilestone = 0 | 3 | 7 | 14 | 30;

export interface VocabularyProgressDashboard {
  asOfDate: string; // YYYY-MM-DD, student's time zone
  timeZone: string; // e.g. Asia/Ho_Chi_Minh
  today: {
    completedDistinctWords: number;
    dailyTarget: number;
    qualifiedToday: boolean;
    dueNow: number;
  };
  overview: {
    totalWords: number;
    learnedWords: number; // FSRS card exists; not necessarily mastered
    newWords: number;
  };
  tree: {
    currentStreak: number;
    longestStreak: number;
    totalQualifiedDays: number;
    highestUnlockedMilestone: MemoryTreeMilestone;
    nextMilestone: 3 | 7 | 14 | 30 | null;
  };
  upcomingReviews: Array<{
    date: string;
    dueCount: number;
  }>;
  activityDays: Array<{
    date: string;
    qualifiedWordCount: number | null; // null = future date
    qualifiedDay: boolean;
  }>;
  units: Array<{
    unitId: number;
    code: string;
    name: string;
    totalCount: number;
    learnedCount: number;
    newCount: number;
    dueCount: number;
  }>;
  attentionWords: Array<{
    wordId: number;
    word: string;
    meaningVi: string;
    unitId: number;
    unitName: string;
    againCount: number;
    hardCount: number;
    dueAt: string | null;
  }>;
}
