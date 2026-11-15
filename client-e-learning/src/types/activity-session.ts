import type { ActivityDifficulty } from "@/types/activity";

export type ActivitySessionMode = "LEARNING" | "TRY_HARD";
export type ActivitySessionStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "GAME_OVER"
  | "ABANDONED";
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
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "TYPE_ANSWER";
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

export type ActivitySessionAnswerFeedback = {
  session: ActivitySession;
  correct: boolean;
  retryAvailable: boolean;
  answerRevealed: boolean;
  correctAnswer?: string;
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
