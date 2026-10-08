export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";
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
  url?: string;
}

export interface DraftQuestion {
  draftId: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  text: string;
  options: QuestionOptionDraft[];
  correctOptionIds: string[];
  trueFalseAnswer: TrueFalseAnswer;
  acceptedAnswers: string[];
  media: QuestionMediaDraft[];
  explanation: string;
  hint?: string;
}

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_IN_BLANK"
  | "TYPE_ANSWER";

export const questionTypeOptions: {
  value: QuestionType;
  label: string;
}[] = [
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_IN_BLANK", label: "Fill in the Blank" },
  { value: "TYPE_ANSWER", label: "Type Answer" },
];

export const questionDifficultyOptions: {
  value: QuestionDifficulty;
  label: string;
}[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];
