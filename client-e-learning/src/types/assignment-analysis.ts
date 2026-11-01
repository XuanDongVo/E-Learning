/** Teacher Assignment Analysis — API contracts (backend is source of truth). */

export type AttemptLifecycleStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "TIMED_OUT";

export type DeadlineState = "ON_TIME" | "LATE" | "OVERDUE" | "NONE";

export type OverallBand = "HIGH" | "MID" | "LOW" | null;

export type QuestionOutcomeStatus =
  | "CORRECT"
  | "PARTIAL"
  | "INCORRECT"
  | "UNANSWERED";

export type DifficultyFlag = "HARD" | "EASY" | null;

export interface AssignmentAnalysisSummary {
  assignmentId: number;
  title: string;
  status: string;
  dueAt: string | null;
  timeLimitMinutes: number | null;
  totalPossibleScoredPoints: number;
  assignedStudentCount: number;
  classCount: number;
}

export interface ProgressCounts {
  assigned: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  timedOut: number;
  late: number;
  overdue: number;
  submissionRate: number | null;
}

export interface ScoreBucket {
  fromPercent: number;
  toPercent: number;
  count: number;
}

export interface ScoreSummary {
  gradedAttemptCount: number;
  averagePercent: number | null;
  medianPercent: number | null;
  highestPercent: number | null;
  lowestPercent: number | null;
  distribution: ScoreBucket[];
}

export interface ClassComparisonRow {
  classId: number;
  className: string;
  assignedCount: number;
  submittedCount: number;
  submissionRate: number | null;
  averagePercent: number | null;
  medianPercent: number | null;
  accuracyPercent: number | null;
  overallBand: OverallBand;
}

export interface AssignmentAnalysisOverview {
  summary: AssignmentAnalysisSummary;
  progress: ProgressCounts;
  score: ScoreSummary;
  classComparison: ClassComparisonRow[];
}

export interface StudentResultRow {
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  attemptId: number | null;
  lifecycleStatus: AttemptLifecycleStatus;
  deadlineState: DeadlineState;
  scorePercent: number | null;
  earnedPoints: number | null;
  possiblePoints: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  durationSeconds: number | null;
  blankCount?: number | null;
  deltaVsClassAvg?: number | null;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export interface AnswerDistributionItem {
  key: string;
  label: string;
  count: number;
  correct: boolean;
}

export interface BlankDistribution {
  blankKey: string;
  blankLabel: string;
  answers: AnswerDistributionItem[];
  blankCount: number;
}

export interface QuestionAnswerDistribution {
  kind: "OPTIONS" | "TEXT" | "CLOZE" | "MATCHING" | "UNKNOWN";
  options: AnswerDistributionItem[];
  textAnswers: AnswerDistributionItem[];
  blanks: BlankDistribution[];
  matchPairs: BlankDistribution[];
  unansweredCount: number;
  sampleSize: number;
}

export interface QuestionAnalysisRow {
  questionId: string;
  position: number;
  sectionId: string | null;
  sectionTitle: string | null;
  promptPreview: string;
  questionType: string;
  isExample: boolean;
  attemptCount: number;
  correctCount: number;
  partialCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracyPercent: number | null;
  scoreRatePercent: number | null;
  difficulty: DifficultyFlag;
  distribution: QuestionAnswerDistribution | null;
}

export interface QuestionAnalysisList {
  items: QuestionAnalysisRow[];
}

export interface SectionAnalysisRow {
  sectionId: string | null;
  sectionTitle: string | null;
  questionCount: number;
  sampleSlots: number;
  correctCount: number;
  partialCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracyPercent: number | null;
  scoreRatePercent: number | null;
  blankPercent: number | null;
}

export interface SectionAnalysisList {
  items: SectionAnalysisRow[];
}

export interface AttemptReviewPart {
  key: string;
  status: QuestionOutcomeStatus;
  earnedPoints: number;
  possiblePoints: number;
  normalized: string | null;
}

export interface AttemptReviewQuestion {
  questionId: number;
  position: number;
  sectionTitle: string | null;
  prompt: string;
  questionType: string;
  isExample: boolean;
  possiblePoints: number;
  earnedPoints: number;
  outcome: QuestionOutcomeStatus;
  studentAnswer: unknown;
  correctAnswer: unknown;
  parts: AttemptReviewPart[];
}

export interface AttemptReview {
  attemptId: number;
  studentId: number;
  studentName: string;
  assignmentId: number;
  assignmentTitle: string;
  classId: number;
  className: string;
  lifecycleStatus: AttemptLifecycleStatus;
  deadlineState: DeadlineState;
  startedAt: string | null;
  finishedAt: string | null;
  durationSeconds: number | null;
  earnedPoints: number;
  possiblePoints: number;
  scorePercent: number | null;
  questions: AttemptReviewQuestion[];
}

export interface StudentResultsQuery {
  page?: number;
  size?: number;
  lifecycleStatus?: AttemptLifecycleStatus | "ALL";
  deadlineState?: DeadlineState | "ALL";
  classId?: number | null;
  search?: string;
}
