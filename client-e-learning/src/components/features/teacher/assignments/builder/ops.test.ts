import { describe, expect, it } from "vitest";
import {
  createEmptyAssignment,
  createItem,
  locate,
  moveTo,
  newSection,
  place,
  removeItem,
} from "./ops";

describe("Assignment Builder composition operations", () => {
  it("keeps placement and ordering in Composition rather than question ownership", () => {
    const assignment = createEmptyAssignment();
    const section = newSection();
    assignment.sections.push(section);

    const first = createItem("SINGLE_CHOICE");
    const second = createItem("MULTIPLE_CHOICE");
    assignment.items[first.id] = first;
    assignment.items[second.id] = second;
    place(assignment, first.id, { sectionId: section.id, groupId: null, index: 0 });
    place(assignment, second.id, { sectionId: section.id, groupId: null, index: 1 });

    moveTo(assignment, second.id, { sectionId: section.id, groupId: null, index: 0 });

    expect(section.itemIds).toEqual([second.id, first.id]);
    expect(locate(assignment, second.id)?.index).toBe(0);
    expect(locate(assignment, first.id)?.index).toBe(1);
  });

  it("removes an Assignment item from the local Composition without issuing Question deletion", () => {
    const assignment = createEmptyAssignment();
    const section = newSection();
    assignment.sections.push(section);

    const created = createItem("SINGLE_CHOICE");
    if (created.kind !== "question") throw new Error("Expected a question item.");
    const question = { ...created, serverQuestionId: 42 };
    assignment.items[question.id] = question;
    place(assignment, question.id, { sectionId: section.id, groupId: null, index: 0 });

    removeItem(assignment, question.id);

    expect(section.itemIds).toEqual([]);
    expect(assignment.items[question.id]).toBeUndefined();
    expect(locate(assignment, question.id)).toBeNull();
  });
});
