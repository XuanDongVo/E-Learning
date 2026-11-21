import { describe, expect, it } from "vitest";
import { chooseKnowledgeLibraryRole, KNOWLEDGE_LIBRARY_ROLES, KNOWLEDGE_ROLE_LABELS } from "./knowledge-library-roles";

describe("Knowledge Library role filter", () => {
  it("clears incompatible Unit and Topic filters for free-reading Notes", () => {
    expect(chooseKnowledgeLibraryRole("UNLINKED", "3", "12"))
      .toEqual({ role: "UNLINKED", unitId: "", topicId: "" });
  });
  it("preserves source filters when choosing Primary or Supplementary", () => {
    expect(chooseKnowledgeLibraryRole("PRIMARY", "3", "12"))
      .toEqual({ role: "PRIMARY", unitId: "3", topicId: "12" });
    expect(chooseKnowledgeLibraryRole("SUPPLEMENTARY", "3", ""))
      .toEqual({ role: "SUPPLEMENTARY", unitId: "3", topicId: "" });
  });
  it("offers all backend-supported roles without invented learning statuses", () => {
    expect(KNOWLEDGE_LIBRARY_ROLES.map(item => item.value))
      .toEqual(["ALL", "PRIMARY", "SUPPLEMENTARY", "UNLINKED"]);
    expect(KNOWLEDGE_ROLE_LABELS.PRIMARY).toBe("Bài chính");
  });
});
