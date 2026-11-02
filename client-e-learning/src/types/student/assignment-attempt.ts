export type AssessmentAttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";
export type AssessmentAttemptPlayerState =
  | "LOADING"
  | "INTRO"
  | "STARTING"
  | "ACTIVE"
  | "SAVING"
  | "SESSION_CONFLICT"
  | "SUBMITTING"
  | "FINALIZING"
  | "TIME_UP"
  | "RESULT"
  | "ERROR";
export type AssessmentAttemptSaveState = "SAVED" | "SAVING" | "PENDING" | "FAILED";
export type AssessmentAttemptEventType = "TAB_HIDDEN" | "FULLSCREEN_EXIT";
export type AttemptAnswerPayload = Record<string, unknown>;
export type JsonRecord = Record<string, unknown>;

/** Matches Java AttemptRuntimeQuestionResponse. Never includes answer keys. */
export interface AttemptRuntimeQuestionResponse {
  attemptQuestionId: number | string;
  assignmentItemId?: number | string | null;
  questionId?: number | string | null;
  sectionKey?: string | null;
  sectionTitle?: string | null;
  position: number;
  questionSnapshot: JsonRecord;
  possiblePoints?: number;
  required?: boolean;
  example?: boolean;
  answerPayload?: AttemptAnswerPayload | null;
  answerRevision?: number;
}

/** Matches the flat Java AttemptRuntimeResponse record. */
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
  gradeName: string | null;
  questionCount: number;
  timeLimitMinutes: number | null;
  dueAt: string ;
  startAt: string | null;
  attemptStatus: AssessmentAttemptStatus | null;
  late: boolean;
  showScoreAfterSubmit?: boolean;
  showAnswersAfterSubmit?: boolean;
}

export interface StartOrResumeAttemptRequest {
  activeSessionId: string;
}

export interface SaveAttemptAnswerRequest {
  activeSessionId: string;
  requestId: string;
  expectedRevision: number;
  answerPayload: AttemptAnswerPayload | null;
}

export interface SaveAttemptAnswerResponse {
  attemptQuestionId: number;
  revision: number;
  savedAt: string;
}

export interface SubmitAttemptRequest {
  activeSessionId: string;
  requestId: string;
}

/** Matches Java AttemptResultQuestionResponse. */
export type AttemptResultQuestionStatus =
  | "CORRECT"
  | "PARTIALLY_CORRECT"
  | "INCORRECT"
  | "UNANSWERED";

export interface AttemptResultAnswerKey {
  options?: Array<{ key?: string; text?: string; correct?: boolean }>;
  answers?: Array<{ rawValue?: string; normalizedValue?: string }>;
  [key: string]: unknown;
}

export interface AttemptResultQuestionResponse {
  attemptQuestionId: number;
  assignmentItemId: number | null;
  sourceQuestionId: number | null;
  position: number;
  sectionKey: string | null;
  sectionTitle: string | null;
  sectionTitleVi: string | null;
  possiblePoints: number | null;
  earnedPoints: number | null;
  status: AttemptResultQuestionStatus;
  isExample: boolean;
  questionSnapshot: JsonRecord;
  answerPayload: AttemptAnswerPayload | null;
  answerKey: AttemptResultAnswerKey | null;
  explanation: string | null;
}

/** Matches Java AttemptResultResponse. */
export interface AttemptResultResponse {
  attemptId: number;
  assignmentId: number;
  assignmentTitle: string;
  status: AssessmentAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  timedOutAt: string | null;
  finishedAt: string | null;
  deadlineAt: string | null;
  timeLimitMinutes: number | null;
  late: boolean;
  classIdAtStart: number | null;
  classNameAtStart: string | null;
  totalPossiblePoints: number | null;
  totalEarnedPoints: number | null;
  percentageScore: number | null;
  scoreVisible: boolean;
  answersVisible: boolean;
  document: JsonRecord | null;
  questions: AttemptResultQuestionResponse[];
}

export interface CreateAttemptEventRequest {
  eventType: AssessmentAttemptEventType;
  activeSessionId: string;
}

export interface CreateAttemptEventResponse {
  eventId: number;
  eventType: AssessmentAttemptEventType;
  occurredAt: string;
  leaveEventCount: number;
}

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
