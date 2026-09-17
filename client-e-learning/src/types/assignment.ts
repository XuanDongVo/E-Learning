import { SkillType } from "./unit";

export type AssignmentStatus = "todo" | "completed" | "late";

export interface AssignmentOverview {
  id: string;
  title: string;
  unitTitle: string;
  skill: SkillType;
  dueDate: string; // e.g., "Sep 20"
  dueRemainingText: string; // e.g., "2 days left"
  status: AssignmentStatus;
  totalQuestions: number;
  timeLimitMinutes?: number; // e.g., 30 mins
  allowedAttempts: number; // 1 attempt
  teacherName: string;
  teacherAvatarUrl: string;
  allowLateSubmission: boolean;
  scoreEarned?: number;
  xpEarned?: number;
  completedAt?: string;
}

export interface QuestionOption {
  id: string;
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuestionItem {
  id: string;
  questionNumber: number;
  prompt: string;
  instruction?: string;
  options: QuestionOption[];
  correctOptionKey: "A" | "B" | "C" | "D";
  explanation?: string;
}

export interface QuizSubmissionPayload {
  assignmentId: string;
  answers: Record<string, "A" | "B" | "C" | "D" | undefined>;
  timeSpentSeconds: number;
}

export interface RecentResult {
  id: string;
  title: string;
  score: string; // e.g. "8/10", "16/20"
  xpEarnedText: string; // e.g. "+10 XP"
  timestampText: string; // e.g. "Today", "Yesterday", "Sep 13"
  skill: SkillType;
}
