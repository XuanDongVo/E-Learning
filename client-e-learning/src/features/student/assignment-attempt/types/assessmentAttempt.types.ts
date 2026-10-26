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

export interface AttemptRuntimeQuestion {
  id: number;
  assignmentItemId: number | null;
  questionId: number | null;
  sectionKey: string;
  sectionTitle: string;
  position: number;
  questionSnapshot: Record<string, unknown>;
  possiblePoints: number;
  required: boolean;
  example: boolean;
  answer: AttemptAnswerPayload | null;
  answerRevision: number;
}

export interface AttemptRuntimeSnapshot {
  attempt: AttemptSummaryResponse;
  assignmentTitle: string;
  timeLimitSeconds: number;
  serverNow: string;
  deadlineAt: string;
  snapshotVersion: number;
  settings: {
    showScoreAfterSubmit: boolean;
    showAnswersAfterSubmit: boolean;
    showPointsPerQuestion: boolean;
  };
  document: Record<string, unknown>;
  questions: AttemptRuntimeQuestion[];
  activeSessionId: string | null;
}

export interface OpenAttemptResponse {
  runtime: AttemptRuntimeSnapshot;
}

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

export interface SubmitAttemptRequest {
  activeSessionId: string;
  requestId: string;
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

export interface AttemptResultQuestion {
  attemptQuestionId: number;
  position: number;
  possiblePoints: number;
  earnedPoints: number | null;
  status: "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT" | "UNANSWERED" | null;
  answer: AttemptAnswerPayload | null;
  answerKey: unknown | null;
}

export interface CreateAttemptEventRequest {
  eventType: AssessmentAttemptEventType;
  activeSessionId: string;
}

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
