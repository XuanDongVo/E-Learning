import {
  mockCurrentUser,
  mockAssignments,
  mockUnits,
  mockRecentResults,
  mockLeaderboard,
} from "@/mock/db";
import { UserProfile, AssignmentOverview, Unit, RecentResult, LeaderboardMember } from "@/types";

export interface DashboardData {
  user: UserProfile;
  assignments: AssignmentOverview[];
  continueUnits: Unit[];
  recentResults: RecentResult[];
  leaderboard: LeaderboardMember[];
}

export async function fetchDashboardData(): Promise<DashboardData> {
  // Simulate network latency if needed, or return immediately
  return {
    user: mockCurrentUser,
    assignments: mockAssignments.filter((a) => a.status === "todo"),
    continueUnits: mockUnits.filter((u) => !u.isLocked),
    recentResults: mockRecentResults,
    leaderboard: mockLeaderboard,
  };
}
