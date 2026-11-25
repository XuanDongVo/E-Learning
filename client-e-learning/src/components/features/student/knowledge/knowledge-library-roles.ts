import type { StudentKnowledgeRole, StudentKnowledgeRoleFilter } from "@/types/student-knowledge-note";

export const KNOWLEDGE_LIBRARY_ROLES: ReadonlyArray<{
  value: StudentKnowledgeRoleFilter; label: string;
}> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PRIMARY", label: "Bài chính" },
  { value: "SUPPLEMENTARY", label: "Bổ sung" },
  { value: "UNLINKED", label: "Đọc tự do" },
];

export const KNOWLEDGE_ROLE_LABELS: Record<StudentKnowledgeRole, string> = {
  PRIMARY: "Bài chính",
  SUPPLEMENTARY: "Bổ sung",
  UNLINKED: "Đọc tự do",
};

/** Free-reading Notes have no *visible* Topic links, so Unit/Topic filters are incompatible. */
export function chooseKnowledgeLibraryRole(
  value: StudentKnowledgeRoleFilter,
  unitId: string,
  topicId: string,
) {
  return {
    role: value,
    unitId: value === "UNLINKED" ? "" : unitId,
    topicId: value === "UNLINKED" ? "" : topicId,
  };
}
