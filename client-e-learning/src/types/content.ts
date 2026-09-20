import type { ReactNode } from "react";

export type ContentView =
  | "overview"
  | "unit"
  | "section"
  | "topic"
  | "bank"
  | "question";

export type ContentLayout = "grid" | "list";

export type ContentTone =
  | "mint"
  | "violet"
  | "blue"
  | "orange"
  | "teal"
  | "pink";

export type ContentDifficulty = "Easy" | "Medium" | "Hard";

export interface ContentUnit {
  id: number;
  name: string;
  code: string;
  grade: string;
  sections: number;
  topics: number;
  tone: ContentTone;
  progress: number;
  imageUrl?: string;
  topicNames: string[];
}

export interface ContentSection {
  name: string;
  topics: number;
  tone: ContentTone;
}

export interface ContentTopic {
  name: string;
  banks: number;
  questions: number;
  tone: ContentTone;
}

export interface ContentQuestionBank {
  name: string;
  type: string;
  questions: number;
  difficulty: ContentDifficulty;
}

export interface ContentQuestion {
  text: string;
  type: string;
  difficulty: ContentDifficulty;
}

export interface ContentToolbarProps {
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
  children?: ReactNode;
}
