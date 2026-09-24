import type { ReactNode } from "react";

export type ContentView =
  | "overview"
  | "unit"
  | "section"
  | "topic"
  | "bank"
  | "question"
  | "bulk-create"
  | "import";
export type ContentLayout = "grid" | "list";
export type ContentTone =
  | "mint"
  | "violet"
  | "blue"
  | "orange"
  | "teal"
  | "pink";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ContentDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_IN_BLANK"
  | "TYPE_ANSWER";
export type TrueFalseAnswer = "TRUE" | "FALSE";
export type QuestionMediaKind = "image" | "audio";

export interface QuestionOptionDraft {
  id: string;
  text: string;
}

export interface QuestionMediaDraft {
  id: string;
  name: string;
  kind: QuestionMediaKind;
  sizeLabel?: string;
}

export interface DraftQuestion {
  draftId: string;
  type: QuestionType;
  difficulty: ContentDifficulty;
  text: string;
  options: QuestionOptionDraft[];
  correctOptionIds: string[];
  trueFalseAnswer: TrueFalseAnswer;
  acceptedAnswers: string[];
  media: QuestionMediaDraft[];
  explanation: string;
}

export const questionTypeOptions: { value: QuestionType; label: string }[] = [
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_IN_BLANK", label: "Fill in the Blank" },
  { value: "TYPE_ANSWER", label: "Type Answer" },
];

export const questionDifficultyOptions: {
  value: ContentDifficulty;
  label: string;
}[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export interface ContentUnit {
  id: number;
  gradeId: number;
  code: string;
  name: string;
  description?: string;
  coverUrl?: string;
  displayOrder: number;
  totalSection: number;
  totalTopic: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
export interface ContentSection {
  id: number;
  unitId: number;
  name: string;
  description?: string;
  displayOrder: number;
  totalTopic: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
export interface ContentTopic {
  id: number;
  sectionId: number;
  name: string;
  description?: string;
  displayOrder: number;
  totalQuestionBank: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
export interface ContentQuestionBank {
  name: string;
  type: string;
  questions: number;
  difficulty: "Easy" | "Medium" | "Hard";
}
export interface ContentQuestion {
  text: string;
  type: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface CreateUnitRequest {
  gradeId: number;
  code: string;
  name: string;
  description?: string;
  coverMediaId?: number;
  displayOrder?: number;
}
export interface UpdateUnitRequest {
  code: string;
  name: string;
  description?: string;
  coverMediaId?: number;
}
export interface CreateSectionRequest {
  unitId: number;
  name: string;
  description?: string;
}
export interface UpdateSectionRequest {
  name: string;
  description?: string;
}
export interface CreateTopicRequest {
  sectionId: number;
  name: string;
  description?: string;
}
export interface UpdateTopicRequest {
  name: string;
  description?: string;
}
export interface UpdateStatusRequest {
  status: ContentStatus;
}
export interface ReorderItem {
  id: number;
  displayOrder: number;
}
export interface ReorderRequest {
  items: ReorderItem[];
}

export interface ContentToolbarProps {
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
  children?: ReactNode;
}
