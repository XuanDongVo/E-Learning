import type { StudentSection } from "@/types/student-unit";

/** Prefer teacher-authored Grammar topics for the default Unit overview reader. */
export function getDefaultKnowledgeTopicId(sections: StudentSection[]): number | null {
  const preferred = sections.find(section =>
    section.name.toLowerCase().includes("grammar") && section.topics.length > 0);
  return preferred?.topics[0]?.id
    ?? sections.find(section => section.topics.length > 0)?.topics[0]?.id
    ?? null;
}
