import { SkillType } from "./unit";
import type { QuestionDifficulty, QuestionType } from "./question";
export type AssignmentManagementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AssignmentTargetRequest = | { type: "GRADE" } | { type: "CLASS"; classId: number };
export interface AssignmentTarget { type: "GRADE" | "CLASS"; classId?: number; className?: string; }
export interface Assignment { id: number; gradeLevel: number; academicYear: string; name: string; description?: string; status: AssignmentManagementStatus; startAt?: string; dueAt: string; timeLimitSeconds?: number; showAnswersAfterSubmit: boolean; questionCount: number; targets: AssignmentTarget[]; }
export interface CreateAssignmentRequest { gradeLevel: number; academicYear: string; name: string; description?: string; startAt?: string; dueAt: string; timeLimitSeconds?: number; showAnswersAfterSubmit?: boolean; targets: AssignmentTargetRequest[]; }
export interface AssignmentQuestionOption { id: number; content: string; isCorrect: boolean; }
export interface AssignmentQuestionAnswer { id: number; rawValue: string; normalizedValue?: string; }
export interface AssignmentQuestionMedia { id: number; mediaId: number; mediaType: string; url: string; }
export interface MatchingDefinition { poolId: string | null; correctEntryId: string | null; }
export interface ClozeDefinition { segments: { text: string }[]; blanks: { key: string; acceptedAnswers: string[] }[]; caseSensitive?: boolean; }
export type AssignmentQuestionDefinition = { matching: MatchingDefinition; cloze?: never } | { cloze: ClozeDefinition; matching?: never };
export interface AssignmentQuestionContent { id: number; type: QuestionType; difficulty: QuestionDifficulty; content: string; explanation?: string; hint?: string; complete: boolean; is_complete?: boolean; matchingMode?: string; definition?: AssignmentQuestionDefinition; options: AssignmentQuestionOption[]; answers: AssignmentQuestionAnswer[]; media: AssignmentQuestionMedia[]; createdAt?: string; updatedAt?: string; }
export interface AssignmentQuestion { questionId: number; assignmentId: number; question: AssignmentQuestionContent; }
export interface CreateAssignmentQuestionOptionRequest { content: string; isCorrect: boolean; }
export interface CreateAssignmentQuestionAnswerRequest { rawValue: string; }
export interface CreateAssignmentQuestionRequest { type: QuestionType; difficulty?: QuestionDifficulty; content: string; explanation?: string; hint?: string; options?: CreateAssignmentQuestionOptionRequest[]; answers?: CreateAssignmentQuestionAnswerRequest[]; mediaIds?: number[]; definition?: AssignmentQuestionDefinition; }
export type UpdateAssignmentQuestionRequest = CreateAssignmentQuestionRequest;
export interface BulkDeleteAssignmentQuestionsRequest { ids: number[]; }
export type AssignmentStatus = "todo" | "completed" | "late";
export interface AssignmentOverview { id: string; title: string; unitTitle: string; skill: SkillType; dueDate: string; dueRemainingText: string; status: AssignmentStatus; totalQuestions: number; timeLimitMinutes?: number; allowedAttempts: number; teacherName: string; teacherAvatarUrl: string; allowLateSubmission: boolean; scoreEarned?: number; xpEarned?: number; completedAt?: string; }
export interface QuestionOption { id: string; key: "A" | "B" | "C" | "D"; text: string; }
export interface QuestionItem { id: string; questionNumber: number; content: string; instruction?: string; options: QuestionOption[]; correctOptionKey: "A" | "B" | "C" | "D"; explanation?: string; }
export interface QuizSubmissionPayload { assignmentId: string; answers: Record<string, "A" | "B" | "C" | "D" | undefined>; timeSpentSeconds: number; }
export interface RecentResult { id: string; title: string; score: string; xpEarnedText: string; timestampText: string; skill: SkillType; }
