import type {
  QuestionDifficulty,
  QuestionMediaKind,
  QuestionType,
  TrueFalseAnswer,
} from "./question";

export interface QuestionPreviewOption {
  id: string;
  text: string;
}

export interface QuestionPreviewMedia {
  id: string;
  name: string;
  kind: QuestionMediaKind;
  url?: string;
}

export interface QuestionPreviewData {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  text: string;
  options: QuestionPreviewOption[];
  correctOptionIds: string[];
  trueFalseAnswer: TrueFalseAnswer;
  acceptedAnswers: string[];
  media: QuestionPreviewMedia[];
  explanation: string;
  complete: boolean;
}
