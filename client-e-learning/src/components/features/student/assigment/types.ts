export type AssignmentStatus = "TODO" | "IN_PROGRESS" | "SUBMITTED";

export type AssignmentFilter = AssignmentStatus;

export interface StudentAssignmentItem {
  id: number | string;
  title: string;
  dueInDays: number;
  dueAt: string | null;
  questionCount: number;
  timeLimitMinutes: number | null;
  status: AssignmentStatus;
  late: boolean;
  description?: string;
}
