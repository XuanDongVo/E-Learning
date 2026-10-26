export type AssessmentAttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";
export type AssessmentAttemptPlayerState = "LOADING" | "INTRO" | "STARTING" | "ACTIVE" | "SAVING" | "SESSION_CONFLICT" | "SUBMITTING" | "FINALIZING" | "TIME_UP" | "RESULT" | "ERROR";
export type AssessmentAttemptSaveState = "SAVED" | "SAVING" | "PENDING" | "FAILED";
export type AssessmentAttemptEventType = "TAB_HIDDEN" | "FULLSCREEN_EXIT";
export type AttemptAnswerPayload = Record<string, unknown>;

/** Matches the flat Java AttemptRuntimeResponse record. */
export interface AttemptRuntimeResponse {
  attemptId: number;
  assignmentId: number;
  assignmentTitle: string;
  status: AssessmentAttemptStatus;
  startedAt: string;
  deadlineAt: string;
  serverNow: string;
  timeLimitSeconds: number;
  classIdAtStart: number;
  classNameAtStart: string;
  late: boolean;
  activeSessionId: string | null;
  snapshotVersion: number;
  document: Record<string, unknown>;
  settings: {
    show_score_after_submit?: boolean;
    show_answers_after_submit?: boolean;
    show_points_per_question?: boolean;
    [key: string]: unknown;
  };
  questions: AttemptRuntimeQuestion[];
}

/** Matches Java AttemptRuntimeQuestionResponse. Never includes a required flag or answer key. */
export interface AttemptRuntimeQuestion {
  attemptQuestionId: number;
  assignmentItemId: number | null;
  questionId: number | null;
  sectionKey: string | null;
  sectionTitle: string | null;
  position: number;
  questionSnapshot: Record<string, unknown>;
  possiblePoints: number;
  example: boolean;
  answerPayload: AttemptAnswerPayload | null;
  answerRevision: number;
}

export interface AttemptSummaryResponse {
  id: number;
  assignmentId: number;
  status: AssessmentAttemptStatus;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  timedOutAt: string | null;
  late: boolean;
}

export interface OpenAttemptResponse extends AttemptRuntimeResponse {}
export interface SaveAttemptAnswerRequest {
  attemptQuestionId: number;
  answerPayload: AttemptAnswerPayload;
  expectedRevision: number;
  activeSessionId: string;
  requestId: string;
}
export interface SaveAttemptAnswerResponse {
  attemptQuestionId: number;
  revision: number;
  savedAt: string;
  serverNow: string;
}
export interface AttemptSessionResponse {
  attemptId: number;
  activeSessionId: string;
  serverNow: string;
  deadlineAt: string;
}
export interface SubmitAttemptRequest { activeSessionId: string; requestId: string; }
export interface AttemptResultQuestion {
  attemptQuestionId: number;
  position: number;
  possiblePoints: number;
  earnedPoints: number | null;
  status: "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT" | "UNANSWERED" | null;
  answer: AttemptAnswerPayload | null;
  answerKey: unknown | null;
}
export interface AttemptResultResponse {
  attempt: AttemptSummaryResponse;
  score: number | null;
  percentageScore: number | null;
  totalPossiblePoints: number | null;
  totalEarnedPoints: number | null;
  scoreVisible: boolean;
  answersVisible: boolean;
  questions: AttemptResultQuestion[];
}
export interface CreateAttemptEventRequest { eventType: AssessmentAttemptEventType; activeSessionId: string; }
export type AssessmentAttemptErrorCode =
  | "ASSESSMENT_ATTEMPT_NOT_FOUND"
  | "ASSESSMENT_ATTEMPT_ACCESS_DENIED"
  | "ASSESSMENT_ATTEMPT_SESSION_CONFLICT"
  | "ASSESSMENT_ATTEMPT_SESSION_LOST"
  | "ASSESSMENT_ATTEMPT_TIME_UP"
  | "ASSESSMENT_ATTEMPT_ALREADY_SUBMITTED"
  | "ASSESSMENT_ATTEMPT_ALREADY_TIMED_OUT"
  | "ASSESSMENT_ATTEMPT_FINALIZING"
  | "ASSESSMENT_ATTEMPT_VERSION_CONFLICT"
  | "ASSESSMENT_ATTEMPT_INVALID_ANSWER"
  | "ASSESSMENT_ATTEMPT_SAVE_FAILED"
  | "ASSESSMENT_ATTEMPT_INVALID_STATE"
  | "ASSESSMENT_ATTEMPT_REQUEST_REPLAY";
