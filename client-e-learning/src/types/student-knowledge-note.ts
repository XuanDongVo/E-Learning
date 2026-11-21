import type { KnowledgeDocument } from "@/types/knowledge-note";

export type StudentKnowledgeUnitTag = { id: number; code: string; name: string };
export type StudentKnowledgeRole = "PRIMARY" | "SUPPLEMENTARY" | "UNLINKED";
export type StudentKnowledgeRoleFilter = "ALL" | StudentKnowledgeRole;

export interface StudentKnowledgeNoteSummary {
  roles: StudentKnowledgeRole[];
  id: number;
  title: string;
  description: string | null;
  updatedAt: string;
  units: StudentKnowledgeUnitTag[];
}
export interface StudentKnowledgeNoteDetail {
  id: number;
  title: string;
  description: string | null;
  updatedAt: string;
  document: KnowledgeDocument;
  linkedTopics: StudentKnowledgeTopicTag[];
}
export interface StudentKnowledgeTopicTag {
  topicId: number;
  topicName: string;
  unitId: number;
  unitCode: string;
  unitName: string;
  primary: boolean;
}
export interface StudentKnowledgePage {
  items: StudentKnowledgeNoteSummary[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
export type StudentKnowledgeFilters = {
  search?: string;
  unitId?: number;
  topicId?: number;
  role?: StudentKnowledgeRoleFilter;
  page?: number;
  size?: number;
};

/** S03.2 Topic read response: private draft/unpublished Notes never appear. */
export interface StudentTopicKnowledgeResponse {
  topicId: number;
  primary: {
    id: number;
    title: string;
    description: string | null;
    summaryDocument: KnowledgeDocument;
    totalKeyPoints: number;
  } | null;
  supplementary: Array<{
    id: number;
    title: string;
    description: string | null;
  }>;
}
