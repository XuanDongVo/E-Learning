export const QUERY_KEYS = {
  currentUser: ["currentUser"] as const,
  dashboardStats: ["dashboardStats"] as const,
  assignments: ["assignments"] as const,
  studentAssignments: (status: string) =>
    ["student", "assignments", status] as const,
  studentAssignmentIntro: (assignmentId: number) =>
    ["student", "assignments", assignmentId, "attempt", "intro"] as const,
  assignmentDetail: (id: string) => ["assignmentDetail", id] as const,
  teacherAssignmentAnalysisOverview: (assignmentId: number) =>
    ["teacher", "assignments", assignmentId, "analytics", "overview"] as const,
  teacherAssignmentAnalysisStudents: (
    assignmentId: number,
    filters: Record<string, unknown>,
  ) =>
    ["teacher", "assignments", assignmentId, "analytics", "students", filters] as const,
  teacherAssignmentAnalysisQuestions: (assignmentId: number) =>
    ["teacher", "assignments", assignmentId, "analytics", "questions"] as const,
  teacherAssignmentAttemptReview: (assignmentId: number, studentId: number) =>
    ["teacher", "assignments", assignmentId, "students", studentId, "attempt"] as const,
  units: ["units"] as const,
  unitDetail: (id: string) => ["unitDetail", id] as const,
  contentUnits: (gradeId: number) => ["content", "units", gradeId] as const,
  contentUnit: (id: number) => ["content", "unit", id] as const,
  contentSections: (unitId: number) => ["content", "sections", unitId] as const,
  contentSection: (id: number) => ["content", "section", id] as const,
  contentTopics: (sectionId: number) =>
    ["content", "topics", sectionId] as const,
  contentTopic: (id: number) => ["content", "topic", id] as const,
  contentQuestionBanks: (topicId: number) =>
    ["content", "questionBanks", topicId] as const,
  globalQuestionBanks: (filters: Record<string, unknown>) =>
    ["content", "globalQuestionBanks", filters] as const,
  contentQuestionBank: (id: number) => ["content", "questionBank", id] as const,
  contentQuestions: (params: Record<string, unknown>) =>
    ["content", "questions", params] as const,
  contentQuestion: (id: number) => ["content", "question", id] as const,
  activities: (unitId: number, includeArchived = false) =>
    ["activities", unitId, { includeArchived }] as const,
  activity: (id: number) => ["activity", id] as const,
  activitySources: (unitId: number) => ["activitySources", unitId] as const,
  leaderboard: ["leaderboard"] as const,
  studentGamificationProfile: ["student", "gamification", "profile"] as const,
  studentStreak: ["student", "gamification", "streak"] as const,
  recentResults: ["recentResults"] as const,
  gameGrades: ["student", "game", "grades"] as const,
  gameUnits: (gradeId: number) => ["student", "game", "units", gradeId] as const,
};
