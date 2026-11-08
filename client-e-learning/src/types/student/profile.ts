import type {
  StudentProfile as SharedStudentProfile,
  UpdateStudentProfileRequest as SharedUpdateStudentProfileRequest,
} from "@/types/student";

export type StudentProfile = SharedStudentProfile;
export type UpdateStudentProfileRequest = SharedUpdateStudentProfileRequest;

export interface StudentRecentSession {
  id: number;
  name: string;
  unit: string;
  mode: string;
  status: "IN_PROGRESS" | "COMPLETED" | "GAME_OVER" | "ABANDONED";
  correct: number;
  total: number;
  date: string;
  xp: number | null;
}
export interface StudentLearningOverview {
  sessionTotal: number;
  sessionsCompleted: number;
  activities: StudentRecentSession[];
}
