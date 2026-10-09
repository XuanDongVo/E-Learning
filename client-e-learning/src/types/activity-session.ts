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
  selectionStrategies: SelectionStrategy[];
  timeLimitSeconds?: number;
  lives?: number;
};

export type ActivitySessionQuestion = {
  id: number;
  position: number;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "TYPE_ANSWER";
  content: string;
  options: { key: string; content: string }[];
  deadlineAt?: string;
  resolved: boolean;
  answerAttempts: number;
  firstCorrect?: boolean;
  finalCorrect?: boolean;
  hintUsed: boolean;
  hasHint: boolean;
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
};

export type ActivitySessionAnswerFeedback = {
  session: ActivitySession;
  correct: boolean;
  retryAvailable: boolean;
  answerRevealed: boolean;
  correctAnswer?: string;
  explanation?: string;
};

export type ActivitySessionResult = Omit<
  ActivitySession,
  "questions" | "startedAt" | "completedAt"
>;
