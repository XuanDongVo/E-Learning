import type { ActivityDifficulty } from "@/types/activity";

export type ActivitySessionMode = "LEARNING" | "TRY_HARD";
export type ActivitySessionStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "GAME_OVER"
  | "ABANDONED";
export type ActivityHistoryPeriod = "ALL" | "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS";
export type SelectionStrategy = "RANDOM" | "WEAKNESS_PRIORITY";

export type ActivitySessionOptions = {
  activityId: number;
  activityMode: "LEARNING" | "TRY_HARD" | "BOTH";
  questionDifficulty: ActivityDifficulty;
  selectionStrategies: SelectionStrategy[];
  timeLimitSeconds?: number;
  lives?: number;
};

export type ActivitySessionQuestion = {
  id: number;
  position: number;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "TYPE_ANSWER" | "ORDERING";
  content?: string | null;
  options: { key: string; content: string }[];
  // ISO-8601 timestamp with server offset; never an unzoned local time.
  deadlineAt?: string | null;
  resolved: boolean;
  resolutionReason?: "CORRECT" | "WRONG" | "TIMEOUT" | null;
  answerAttempts: number;
  firstCorrect?: boolean;
  finalCorrect?: boolean;
  hintUsed: boolean;
  hasHint: boolean;
  guided?: GuidedQuestionState | null;
  ordering?: {
    subtype: "WORD" | "PHRASE" | "SENTENCE";
    items: { key: string; content: string }[];
  } | null;
};

export type GuidedQuestionStage =
  | "STEP_ACTIVE"
  | "STEP_RETRY"
  | "FINAL_PENDING"
  | "FINAL_RETRY"
  | "QUESTION_RESOLVED";

export type GuidedQuestionState = {
  stage: GuidedQuestionStage;
  introContent?: string | null;
  currentStep?: {
    stepKey: string;
    position: number;
    totalSteps: number;
    type: "SINGLE_CHOICE" | "TRUE_FALSE" | "TYPE_ANSWER";
    prompt: string;
    options: { key: string; content: string }[];
    hintAvailable: boolean;
    hintUsed: boolean;
    attemptsUsed: number;
    attemptsAllowed: number;
  } | null;
};

export type ActivitySession = {
  id: number;
  status: ActivitySessionStatus;
  mode: ActivitySessionMode;
  selectionStrategy: SelectionStrategy;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  firstCorrectCount: number;
  finalCorrectCount: number;
  hintUsedCount: number;
  score?: number;
  lives?: number;
  questions: ActivitySessionQuestion[];
  serverNow?: string;
};

export type ActivitySessionHistoryItem = {
  sessionId: number;
  mode: ActivitySessionMode;
  status: Exclude<ActivitySessionStatus, "IN_PROGRESS">;
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  firstCorrectCount: number;
  finalCorrectCount: number;
  hintUsedCount: number;
  score?: number | null;
  earnedXp?: number | null;
};

export type ActivitySessionHistoryPage = {
  items: ActivitySessionHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
};

export type ActivitySessionAnswerFeedback = {
  session: ActivitySession;
  correct: boolean;
  retryAvailable: boolean;
  answerRevealed: boolean;
  correctAnswer?: string;
  orderingAnswer?: {
    items: { key: string; content: string }[];
  } | null;
  explanation?: string;
};

export type GuidedStepAnswerFeedback = {
  session: ActivitySession;
  correct: boolean;
  attemptNumber: number;
  retryAvailable: boolean;
  stepResolved: boolean;
  stage: GuidedQuestionStage;
};

export type ActivityXpQuestionOutcome =
  | "CORRECT_FIRST_TRY"
  | "CORRECT_RETRY"
  | "CORRECT_WITH_HINT"
  | "WRONG_EXHAUSTED"
  | "TRY_HARD_WRONG"
  | "TIMEOUT"
  | "NO_INTERACTION";

export type ActivityXpRewardReceipt = {
  sessionId: number;
  status: ActivitySessionStatus;
  questionXp: number;
  completionBonus: number;
  committedXp: number;
  levelBefore: number;
  lifetimeXpAfter: number;
  levelAfter: number;
  finalizedAt: string;
};

export type ActivityXpQuestionReceipt = {
  sessionQuestionId: number;
  outcome: ActivityXpQuestionOutcome;
  baseXp: number;
  finalXp: number;
};

export type ActivitySessionResult = Omit<
  ActivitySession,
  "questions" | "startedAt" | "completedAt" | "serverNow"
> & {
  xpReward: ActivityXpRewardReceipt | null;
  xpQuestions: ActivityXpQuestionReceipt[];
};

export type ActivityReviewHistoryState =
  | "AVAILABLE"
  | "NOT_ANSWERED"
  | "LEGACY_UNAVAILABLE";

export type ActivityReviewAttempt = {
  attemptNumber: number;
  submittedAnswer: unknown;
  correct: boolean;
  retryAvailable?: boolean | null;
  resolved?: boolean | null;
  submittedAt: string;
  hintUsedBeforeAttempt: boolean;
};

export type ActivityReviewOption = { key: string; content: string };

export type ActivityReviewStep = {
  stepKey: string;
  position: number;
  type: ActivitySessionQuestion["type"];
  prompt: string;
  options: ActivityReviewOption[];
  hintUsed: boolean;
  hintUsedAt?: string | null;
  finalCorrect?: boolean | null;
  attempts: ActivityReviewAttempt[];
  correctAnswers: string[];
  explanation?: string | null;
};

export type ActivityReviewQuestion = {
  sessionQuestionId: number;
  position: number;
  deliveryType: "CLASSIC" | "GUIDED_REASONING";
  resolved: boolean;
  resolutionReason?: "CORRECT" | "WRONG" | "TIMEOUT" | null;
  firstCorrect?: boolean | null;
  finalCorrect?: boolean | null;
  finalHintUsed: boolean;
  snapshotAvailable: boolean;
  type?: ActivitySessionQuestion["type"] | null;
  prompt?: string | null;
  options: ActivityReviewOption[];
  ordering?: ActivitySessionQuestion["ordering"];
  guided?: {
    stage: GuidedQuestionStage;
    introContent?: string | null;
    steps: ActivityReviewStep[];
  } | null;
  finalAnswer: {
    historyState: ActivityReviewHistoryState;
    attempts: ActivityReviewAttempt[];
    correctAnswers: string[];
    orderingAnswer?: {
      items: { key: string; content: string }[];
    } | null;
    explanation?: string | null;
  };
};

export type ActivitySessionReview = {
  sessionId: number;
  status: ActivitySessionStatus;
  mode: ActivitySessionMode;
  activityId: number;
  activityName: string;
  unitId: number;
  unitLabel: string;
  startedAt: string;
  completedAt?: string | null;
  score?: number | null;
  totalQuestions: number;
  firstCorrectCount: number;
  finalCorrectCount: number;
  questions: ActivityReviewQuestion[];
};
