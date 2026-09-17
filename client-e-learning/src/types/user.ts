export type Role = "student" | "teacher";

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  role: Role;
  grade: string;
  className: string;
  streakDays: number;
  xp: number;
  nextLevelXp: number;
  classRank: number;
  totalStudentsInClass: number;
}

export interface LeaderboardMember {
  id: string;
  name: string;
  avatarUrl: string;
  rank: number;
  xp: number;
  isCurrentUser?: boolean;
}
