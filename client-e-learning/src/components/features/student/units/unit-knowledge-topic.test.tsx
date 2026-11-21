import { describe, expect, it } from "vitest";
import { getDefaultKnowledgeTopicId } from "./unit-knowledge-topic";
import type { StudentSection } from "@/types/student-unit";

const section = (id: number, name: string, topicIds: number[]): StudentSection => ({
  id, name, topics: topicIds.map(topicId => ({ id: topicId, name: `Topic ${topicId}` })),
});

describe("Unit Knowledge entry", () => {
  it("exposes an authored Grammar Topic on the Unit overview without requiring activity filters", () => {
    expect(getDefaultKnowledgeTopicId([
      section(1, "Vocabulary", [11]), section(2, "Grammar and Usage", [22, 23]),
    ])).toBe(22);
  });
  it("falls back to the first Topic when Grammar has none", () => {
    expect(getDefaultKnowledgeTopicId([
      section(1, "Vocabulary", [11]), section(2, "Grammar and Usage", []),
    ])).toBe(11);
  });
  it("supports Units without Topics", () => {
    expect(getDefaultKnowledgeTopicId([section(1, "Grammar and Usage", [])])).toBeNull();
  });
});
