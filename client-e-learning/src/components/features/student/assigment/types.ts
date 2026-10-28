export type AssignmentStatus = "TODO" | "IN_PROGRESS" | "SUBMITTED";

export type AssignmentFilter =  AssignmentStatus;

export interface StudentAssignmentItem {
  id: number | string;
  title: string;
  dueInDays: number;
  questionCount: number;
  timeLimitMinutes: number;
  status: AssignmentStatus;
  description?: string;
  teacherName?: string;
  dueLabel: string;
  instructions?: string[];
  samplePaper?: boolean;
}

