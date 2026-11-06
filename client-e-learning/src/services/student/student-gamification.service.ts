import { request } from "@/services/api.service";
import type { StudentGamificationOverview, StudentStreakOverview } from "@/types/gamification";

export const studentGamificationService = {
  profile: () => request<StudentGamificationOverview>("/v1/student/gamification/profile"),
  streak: () => request<StudentStreakOverview>("/v1/student/gamification/streak"),
};
