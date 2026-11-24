export type ClassStatus = "ACTIVE" | "ARCHIVED";

export interface Class {
  id: number;
  name: string;
  grade: { id: number; code: string; name: string; displayOrder: number };
  academicYear: string;
  studentCount: number;
  status: ClassStatus;
}

export interface CreateClassRequest {
  name: string;
  gradeId: number;
  academicYear: string;
}

export interface UpdateClassRequest {
  name: string;
  gradeId: number;
  academicYear: string;
}

export interface ClassCardProps {
  classItem: Class;
  onEdit: (classItem: Class) => void;
  onArchive: (classItem: Class) => void;
}

export type ClassLeaderboardMetric = "XP" | "STREAK";
export type ClassLeaderboardPeriod = "TODAY" | "WEEK" | "MONTH" | "ALL";

export interface ClassLeaderboardItem {
  studentId: number;
  fullName: string;
  avatarKey: string | null;
  rank: number;
  xp: number;
  completedSessions: number;
  currentStreak: number;
}

export interface ClassLeaderboardResponse {
  classId: number;
  metric: ClassLeaderboardMetric;
  period: ClassLeaderboardPeriod | null;
  xpScope?: "PERIOD" | "ALL";
  completedScope?: "PERIOD" | "ALL";
  totalStudents: number;
  totalElements: number;
  page: number;
  size: number;
  items: ClassLeaderboardItem[];
}

export interface ClassLeaderboardParams {
  metric?: ClassLeaderboardMetric;
  period?: ClassLeaderboardPeriod;
  search?: string;
  page?: number;
  size?: number;
}

