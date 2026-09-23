import type { ReactNode } from "react";

export type ContentView = "overview" | "unit" | "section" | "topic" | "bank" | "question";
export type ContentLayout = "grid" | "list";
export type ContentTone = "mint" | "violet" | "blue" | "orange" | "teal" | "pink";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ContentDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ContentUnit { id: number; gradeId: number; code: string; name: string; description?: string; coverMediaId?: number; displayOrder: number; totalSection: number; totalTopic: number; status: ContentStatus; createdAt: string; updatedAt: string; publishedAt?: string; }
export interface ContentSection { id: number; unitId: number; name: string; description?: string; displayOrder: number; totalTopic: number; status: ContentStatus; createdAt: string; updatedAt: string; }
export interface ContentTopic { id: number; sectionId: number; name: string; description?: string; displayOrder: number; totalQuestionBank: number; status: ContentStatus; createdAt: string; updatedAt: string; }
export interface ContentQuestionBank { name: string; type: string; questions: number; difficulty: "Easy" | "Medium" | "Hard"; }
export interface ContentQuestion { text: string; type: string; difficulty: "Easy" | "Medium" | "Hard"; }

export interface CreateUnitRequest { gradeId: number; code: string; name: string; description?: string; coverMediaId?: number; }
export interface UpdateUnitRequest { code: string; name: string; description?: string; coverMediaId?: number; }
export interface CreateSectionRequest { unitId: number; name: string; description?: string; }
export interface UpdateSectionRequest { name: string; description?: string; }
export interface CreateTopicRequest { sectionId: number; name: string; description?: string; }
export interface UpdateTopicRequest { name: string; description?: string; }

export interface ContentToolbarProps { title: string; description?: string; action?: string; onAction?: () => void; children?: ReactNode; }
