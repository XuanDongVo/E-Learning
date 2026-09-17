export const QUERY_KEYS = {
  currentUser: ["currentUser"] as const,
  dashboardStats: ["dashboardStats"] as const,
  assignments: ["assignments"] as const,
  assignmentDetail: (id: string) => ["assignmentDetail", id] as const,
  units: ["units"] as const,
  unitDetail: (id: string) => ["unitDetail", id] as const,
  leaderboard: ["leaderboard"] as const,
  recentResults: ["recentResults"] as const,
};
