export type AssessmentAttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";
export type AssessmentAttemptPlayerState = "LOADING" | "INTRO" | "STARTING" | "ACTIVE" | "SAVING" | "SESSION_CONFLICT" | "SUBMITTING" | "FINALIZING" | "TIME_UP" | "RESULT" | "ERROR";
export type AssessmentAttemptSaveState = "SAVED" | "SAVING" | "PENDING" | "FAILED";
export type AssessmentAttemptEventType = "TAB_HIDDEN" | "FULLSCREEN_EXIT";
export type AttemptAnswerPayload = Record<string, unknown>;
export type JsonRecord = Record<string, unknown>;

/** Matches the flat Java AttemptRuntimeResponse record. */
export interface AttemptRuntimeQuestionResponse {
  attemptQuestionId: number | string;
  assignmentItemId: number | string | null;
  position: number;
  questionSnapshot: JsonRecord;
  possiblePoints?: number;
  required?: boolean;
  example?: boolean;
}
export interface AttemptRuntimeResponse {
  attemptId: number | string;
  assignmentId: number | string;
  assignmentTitle: string;
  status: string;
  startedAt?: string;
  deadlineAt?: string;
  serverNow?: string;
  timeLimitMinutes?: number;
  classIdAtStart?: number | string;
  classNameAtStart?: string;
  late?: boolean;
  snapshotVersion?: number;
  document: JsonRecord;
  settings?: JsonRecord;
  questions: AttemptRuntimeQuestionResponse[];
}


/** Matches Java AttemptRuntimeQuestionResponse. Never includes a required flag or answer key. */


export interface AttemptRuntimeQuestionResponse {
  attemptQuestionId: number | string;
  assignmentItemId: number | string | null;
  position: number;
  questionSnapshot: JsonRecord;
  possiblePoints?: number;
  required?: boolean;
  example?: boolean;
}

export interface AttemptRuntimeResponse {
  attemptId: number | string;
  assignmentId: number | string;
  assignmentTitle: string;
  status: string;
  startedAt?: string;
  deadlineAt?: string;
  serverNow?: string;
  timeLimitMinutes?: number;
  classIdAtStart?: number | string;
  classNameAtStart?: string;
  late?: boolean;
  snapshotVersion?: number;
  document: JsonRecord;
  settings?: JsonRecord;
  questions: AttemptRuntimeQuestionResponse[];
}

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

export interface StudentQuestionSnapshot {
  type: string;
  poolId?: string;
  prompt: string;
  choices: { key: string; text: string }[];
  media: { url: string; alt: string; kind: string }[];
  items: { key: string; text: string }[];
  answerPool: { key: string; text: string }[];
  segments: { text: string; blankKey?: string }[];
  blankKeys: string[];
}



/** Student-safe pre-start metadata; does not expose target class IDs or authoring data. */
export interface AttemptIntroResponse {
  assignmentId: number;
  assignmentTitle: string;
  gradeName: string;
  questionCount: number;
  dueAt: string;
  timeLimitMinutes: number;
  attemptStatus: AssessmentAttemptStatus | null;
  late: boolean;
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

/** Generate once and persist in IndexedDB before the first start-or-resume request. */
export interface StartOrResumeAttemptRequest { activeSessionId: string; }
export interface SaveAttemptAnswerRequest {
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



  // ============================================================================
// 1. DATA CONTRACT & TYPES (Khớp chuẩn DTO Backend Spring Boot)
// ============================================================================

export interface PoolOption {
  key: string;
  text: string;
}

export interface CompositionItemSnapshot {
  id?: number | string;
  position?: number;
  itemType?: string;
  questionId?: number | null;
  blockPayload?: JsonRecord | null;
  children?: CompositionItemSnapshot[];
}

export interface CompositionSectionSnapshot {
  id?: number | string;
  position?: number;
  title?: string;
  titleVi?: string;
  instructions?: string;
  instructionsVi?: string;
  items?: CompositionItemSnapshot[];
}

