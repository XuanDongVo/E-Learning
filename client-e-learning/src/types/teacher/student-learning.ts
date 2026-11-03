/** Teacher student hub — learning rows (real API). */

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

export const ASSIGNMENT_STATUS_LABEL: Record<StudentAssignmentStatus, string> = {
  NOT_STARTED: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  SUBMITTED: "Đã nộp",
  LATE: "Nộp muộn",
  TIMED_OUT: "Hết giờ",
};

export const SESSION_STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
  GAME_OVER: "Hết mạng sống",
  ABANDONED: "Bỏ dở",
};

export const SESSION_MODE_LABEL: Record<string, string> = {
  LEARNING: "Learning",
  TRY_HARD: "Try Hard",
};

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return value;
  }
}

export function formatScorePercent(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 10) / 10}%`;
}
