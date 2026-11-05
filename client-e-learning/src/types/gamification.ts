export type XpSourceType =
  | "PRACTICE"
  | "STREAK_BONUS"
  | "LEVEL_UP_BONUS"
  | "MANUAL"
  | "OTHER";

export type LeaderboardTab = "xp" | "time" | "streak" | "share";

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
