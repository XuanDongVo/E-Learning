/** Teacher student hub — learning row types (API codes only, labels via i18n). */

export type StudentAssignmentStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "LATE"
  | "TIMED_OUT";

export interface StudentAssignmentItem {
  assignmentId: number;
  title: string;
  dueAt: string;
  status: StudentAssignmentStatus;
  attemptId?: number | null;
  submittedAt?: string | null;
  scorePercent?: number | null;
  late: boolean;
}

export type ActivitySessionStatusApi = "IN_PROGRESS" | "COMPLETED" | "GAME_OVER" | "ABANDONED";

export interface StudentActivitySessionItem {
  sessionId: number;
  activityId: number;
  activityName: string;
  unitLabel: string;
  mode: string;
  status: ActivitySessionStatusApi | string;
  totalQuestions: number;
  firstCorrectCount: number;
  finalCorrectCount: number;
  hintUsedCount: number;
  startedAt: string;
  completedAt?: string | null;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}
