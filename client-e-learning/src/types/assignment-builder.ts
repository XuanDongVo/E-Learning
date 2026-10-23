import type { QuestionDifficulty, QuestionType } from "@/types/question";
export type ID = string;
/** Canonical engine types plus temporary UI aliases retained until editor migration is complete. */
export type InteractionType = QuestionType | "TEXT_INPUT" | "MULTI_TEXT_INPUT";
export interface ChoiceOption {
  id: ID;
  text: string;
  isCorrect: boolean;
}
interface BaseQuestion {
  prompt: string;
  explanation?: string;
  hint?: string;
  blankRef?: number | null;
}
export interface SingleChoiceContent extends BaseQuestion {
  type: "SINGLE_CHOICE";
  options: ChoiceOption[];
  display: "list" | "dropdown";
}
export interface MultipleChoiceContent extends BaseQuestion {
  type: "MULTIPLE_CHOICE";
  options: ChoiceOption[];
}
export interface TrueFalseContent extends BaseQuestion {
  type: "TRUE_FALSE";
  answer: "TRUE" | "FALSE" | null;
}
export interface TextInputContent extends BaseQuestion {
  type: "TEXT_INPUT";
  acceptedAnswers: string[];
  caseSensitive: boolean;
  prefix?: string;
  cue?: string;
}
export interface ClozeBlank {
  id: ID;
  key: string;
  acceptedAnswers: string[];
}
export interface ClozeContent extends BaseQuestion {
  type: "CLOZE";
  segments: { id: ID; text: string }[];
  blanks: ClozeBlank[];
  caseSensitive: boolean;
}
export interface MatchingItem {
  id: ID;
  key: string;
  prompt: string;
  correctAnswerId: ID | null;
}

export interface MatchingAnswer {
  id: ID;
  key: string;
  text: string;
}

export interface MatchingContent extends BaseQuestion {
  type: "MATCHING";
  poolId: ID | null;
  correctEntryId: ID | null;
}

/** @deprecated Use ClozeContent. */
export interface MultiTextContent extends BaseQuestion {
  type: "MULTI_TEXT_INPUT";
  blanks: { id: ID; acceptedAnswers: string[] }[];
  caseSensitive: boolean;
}
export type QuestionContent =
  | SingleChoiceContent
  | MultipleChoiceContent
  | TrueFalseContent
  | TextInputContent
  | ClozeContent
  | MatchingContent
  | MultiTextContent;
export interface ItemConfig {
  points: number;
  gradingMode: "AUTO";
  isExample: boolean;
  groupId: ID | null;
}
export interface QuestionItem {
  id: ID;
  kind: "question";
  serverQuestionId?: number;
  serverType?: QuestionType;
  serverDifficulty?: QuestionDifficulty;
  serverMediaIds?: number[];
  serverMedia?: { mediaId: number; mediaType: string; url: string }[];
  compositionItemId?: number;
  serverQuestionSnapshot?: string;
  content: QuestionContent;
  config: ItemConfig;
}
export type PoolEntry = { id: ID; text: string };
export type BlockContent =
  | { type: "INSTRUCTIONS"; text: string }
  | { type: "PASSAGE"; title: string; text: string }
  | {
      type: "MEDIA";
      assetId?: string;
      url: string;
      alt: string;
      caption: string;
    }
  | { type: "POOL"; title: string; entries: PoolEntry[] };
export type BlockType = BlockContent["type"];
export interface BlockItem {
  id: ID;
  kind: "block";
  compositionItemId?: number;
  block: BlockContent;
  memberIds: ID[];
}
export type Item = QuestionItem | BlockItem;
export interface Section {
  id: ID;
  serverId?: number;
  title: string;
  titleVi: string;
  instructions: string;
  instructionsVi: string;
  itemIds: ID[];
}
export type ShowAnswers = "off" | "after_submission" | "after_due";
export interface AssignmentSettings {
  timeLimitMinutes: number;
  startAt: string;
  dueAt: string;
  classIds: string[];
  showAnswers: ShowAnswers;
  showScoreAfterSubmit: boolean;
  showPoints: boolean;
  shuffle: boolean;
}
export interface Assignment {
  id: ID;
  serverId?: number;
  academicYear?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  title: string;
  grade: 6 | 7 | 8;
  instructions: string;
  settings: AssignmentSettings;
  sections: Section[];
  items: Record<ID, Item>;
  updatedAt: string;
}
export type ToolKey =
  | "SINGLE_CHOICE"
  | "TRUE_FALSE"
  | "MULTIPLE_CHOICE"
  | "TEXT_INPUT"
  | "MULTI_BLANKS"
  | "MATCHING"
  | "SECTION"
  | "INSTRUCTIONS"
  | "PASSAGE"
  | "MEDIA"
  | "POOL";
export type Selection = { kind: "item" | "section"; id: ID } | null;
export type InsertTarget = { sectionId: ID; groupId: ID | null; index: number };
