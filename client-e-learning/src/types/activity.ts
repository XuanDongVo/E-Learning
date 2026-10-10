export type ActivityStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ActivityMode = "LEARNING" | "TRY_HARD" | "BOTH";
export type DistributionMode = "EQUAL" | "PERCENTAGE" | "FIXED_COUNT";
export type SelectionStrategy = "RANDOM" | "WEAKNESS_PRIORITY";
export type ActivityDifficulty = "EASY" | "MEDIUM" | "HARD" | "MIXED";

export interface ActivityBank {
  id: number; questionBankId: number; questionBankName: string; topicId: number;
  topicName: string; sectionName: string; displayOrder: number;
  percentage: number | null; fixedCount: number | null;
  totalQuestions: number; readyQuestions: number; allocatedQuestions: number;
}
export interface ActivityReadinessIssue {
  code: string; message: string; questionBankId: number | null;
  required: number | null; available: number | null;
}
export interface ActivityReadiness {
  ready: boolean; errors: ActivityReadinessIssue[];
  warnings: ActivityReadinessIssue[]; sources: ActivitySourceAvailability[];
}
export interface ActivitySourceAvailability {
  questionBankId: number; questionBankName: string; sectionName: string;
  topicName: string; status: ActivityStatus; totalQuestions: number;
  readyQuestions: number; requiredQuestions: number | null;
}
export interface ActivitySourceOption {
  questionBankId: number; questionBankName: string; topicId: number;
  topicName: string; sectionName: string; status: ActivityStatus;
  totalQuestions: number; readyQuestions: number;
}
export interface Activity {
  id: number; gradeId: number; gradeName: string; unitId: number;
  unitCode: string; unitName: string; name: string; description: string | null;
  displayOrder: number; status: ActivityStatus; distributionMode: DistributionMode;
  totalQuestions: number; questionDifficulty: ActivityDifficulty; availableSelectionStrategies: SelectionStrategy[];
  mode: ActivityMode; timeLimitSeconds: number | null; lives: number | null;
  banks: ActivityBank[]; readiness: ActivityReadiness; createdAt: string;
  updatedAt: string; publishedAt: string | null;
}
export interface ActivityBankRequest {
  questionBankId: number; displayOrder: number; percentage?: number; fixedCount?: number;
}
export interface CreateActivityRequest {
  unitId: number; name: string; description?: string;
  distributionMode: DistributionMode; totalQuestions: number;
  questionDifficulty: ActivityDifficulty;
  availableSelectionStrategies: SelectionStrategy[]; mode: ActivityMode;
  timeLimitSeconds?: number; lives?: number; banks: ActivityBankRequest[];
}
export interface UpdateActivityRequest {
  name: string; description?: string; distributionMode: DistributionMode;
  totalQuestions: number; questionDifficulty: ActivityDifficulty;
  availableSelectionStrategies: SelectionStrategy[];
  mode: ActivityMode; timeLimitSeconds?: number; lives?: number;
  banks: ActivityBankRequest[];
}