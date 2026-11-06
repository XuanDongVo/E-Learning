export type XpSourceType =
  | "PRACTICE"
  | "STREAK_BONUS"
  | "LEVEL_UP_BONUS"
  | "MANUAL"
  | "OTHER";

export type LeaderboardTab = "xp" | "time" | "streak" | "share";

export interface StudentGamificationOverview {
  lifetimeXp: number;
  currentLevel: number;
  currentLevelStartXp: number;
  nextLevelRequiredXp: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
  qualifiedToday: boolean;
}

export interface StudentStreakOverview {
  currentStreak: number;
  longestStreak: number;
  qualifiedToday: boolean;
  runStartDate: string | null;
  lastQualifiedDate: string | null;
  timezone: string;
  milestones: { days: number; xp: number; awarded: boolean }[];
  todayDate: string;
  weekStartDate: string;
  qualifiedDates: string[];
}

export interface StudentGamificationProfile {
  id: string;
  studentId: string;
  lifetimeXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
  activeAvatarKey: string | null;
  activeMascotKey: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  fullName: string;
  avatarKey: string;
  /** Value shown in the active tab (streak days / xp / time) */
  value: number;
  valueLabel: string;
  isCurrentUser: boolean;
}

export interface HallOfFameItem {
  title: string;
  studentName: string;
  valueLabel: string;
  avatarKey: string;
  icon: "trophy" | "fire" | "megaphone";
}

export interface RecentActivityItem {
  id: string;
  actorName: string;
  message: string;
  badgeLabel?: string;
  minutesAgo: number;
  kind: "level" | "streak" | "xp" | "quiz";
}

export type LeaderboardMetric = "XP" | "STREAK";
export type LeaderboardPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL";

export interface LeaderboardRanking {
  studentId: number;
  fullName: string;
  rank: number;
  value: number;
  level: number;
  currentStudent: boolean;
}

export interface LiveLeaderboard {
  metric: LeaderboardMetric;
  period: LeaderboardPeriod;
  top: LeaderboardRanking[];
  currentStudent: LeaderboardRanking | null;
  currentStudentInTop: boolean;
  totalStudents: number;
}

export interface LeaderboardHonors {
  xpChampion: LeaderboardRanking | null;
  streakChampion: LeaderboardRanking | null;
}

export interface LiveLearningActivity {
  sessionId: number;
  studentId: number;
  fullName: string;
  activityName: string;
  status: "COMPLETED" | "GAME_OVER";
  completedAt: string;
  earnedXp: number | null;
}
export interface LearningActivityFeed {
  items: LiveLearningActivity[];
}
