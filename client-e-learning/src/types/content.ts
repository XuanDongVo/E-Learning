import type { ReactNode } from "react";
import type { ColorTone } from "./theme";
import type { QuestionDifficulty, QuestionType } from "./question";
export type {
  DraftQuestion,
  QuestionMediaDraft,
  QuestionOptionDraft,
  QuestionType,
  TrueFalseAnswer,
  QuestionMediaKind,
  QuestionDifficulty,
} from "./question";
export { questionTypeOptions, questionDifficultyOptions } from "./question";
export type ContentDifficulty = QuestionDifficulty;

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
export type ContentTone = ColorTone;
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
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
  id: number;
  topicId: number;
  topicName?: string;
  name: string;
  description?: string;
  displayOrder: number;
  status: ContentStatus;
  totalQuestions: number;
  readyQuestions: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionOptionResponse {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface QuestionAnswerResponse {
  id: number;
  rawValue: string;
  normalizedValue: string;
}

export interface QuestionMediaResponse {
  id: number;
  mediaId: number;
  mediaType: string;
  url: string;
}

export interface QuestionResponse {
  id: number;
  questionBankId: number;
  type: QuestionType;
  difficulty: ContentDifficulty;
  content: string;
  explanation?: string;
  complete: boolean;
  is_complete?: boolean;
  matchingMode?: string;
  options: QuestionOptionResponse[];
  answers: QuestionAnswerResponse[];
  media: QuestionMediaResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface CreateQuestionBankRequest {
  topicId: number;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateQuestionBankRequest {
  name: string;
  description?: string;
}

export interface QuestionOptionRequest {
  content: string;
  isCorrect: boolean;
}

export interface QuestionAnswerRequest {
  rawValue: string;
}

export interface CreateQuestionRequest {
  questionBankId: number;
  type: QuestionType;
  difficulty?: ContentDifficulty;
  content: string;
  explanation?: string;
  options?: QuestionOptionRequest[];
  answers?: QuestionAnswerRequest[];
  mediaIds?: number[];
}

export interface UpdateQuestionRequest {
  type: QuestionType;
  difficulty?: ContentDifficulty;
  content: string;
  explanation?: string;
  options?: QuestionOptionRequest[];
  answers?: QuestionAnswerRequest[];
  mediaIds?: number[];
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
  actionHref?: string;
  children?: ReactNode;
}
export interface ListQuestionsParams {
  bankId: number;
  search?: string;
  type?: string;
  difficulty?: string;
  isComplete?: boolean;
  page?: number;
  size?: number;
}