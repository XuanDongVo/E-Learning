import { request } from "@/services/api.service";
import type { StudentGamificationOverview, StudentStreakOverview, LiveLeaderboard, LeaderboardMetric, LeaderboardPeriod, LeaderboardHonors, LearningActivityFeed } from "@/types/gamification";

export const studentGamificationService = {
  profile: () => request<StudentGamificationOverview>("/v1/student/gamification/profile"),
  streak: () => request<StudentStreakOverview>("/v1/student/gamification/streak"),
  leaderboard: (metric: LeaderboardMetric, period: LeaderboardPeriod) =>
    request<LiveLeaderboard>(`/v1/student/gamification/leaderboard?metric=${metric}&period=${period}`),
  honors: () => request<LeaderboardHonors>("/v1/student/gamification/leaderboard/honors"),
  recentActivity: () => request<LearningActivityFeed>("/v1/student/gamification/leaderboard/recent-activity?limit=8"),
};
