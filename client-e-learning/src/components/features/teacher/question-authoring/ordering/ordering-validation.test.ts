import { describe, expect, it } from "vitest";
import type { OrderingDraftDefinition } from "@/types/question";
import {
  gradeOrderingDraft,
  isOrderingDefinitionComplete,
  makeOrderingPreviewOrder,
} from "./ordering-validation";
import { synchronizeOrderingDefinition } from "./ordering-draft";

function definition(
  contents: string[],
  acceptedOrders: string[][] = [["item-1", "item-2", "item-3"]],
): OrderingDraftDefinition {
  return {
    schemaVersion: 1,
    subtype: "PHRASE",
    items: contents.map((content, index) => ({
      key: `item-${index + 1}`,
      content,
    })),
    acceptedOrders,
  };
}

describe("Ordering authoring validation", () => {
  it("accepts a complete definition and grades alternate accepted orders", () => {
    const draft = definition(
      ["Today", "we learn", "English"],
      [
        ["item-1", "item-2", "item-3"],
        ["item-1", "item-3", "item-2"],
      ],
    );

    expect(isOrderingDefinitionComplete(draft)).toBe(true);
    expect(gradeOrderingDraft(draft, ["item-1", "item-3", "item-2"])).toBe(true);
    expect(gradeOrderingDraft(draft, ["item-2", "item-1", "item-3"])).toBe(false);
  });

  it("treats duplicate visible items as interchangeable", () => {
    const draft = definition(["very", "very", "good"]);
    expect(gradeOrderingDraft(draft, ["item-2", "item-1", "item-3"])).toBe(true);
  });

  it("rejects definitions whose shuffle cannot produce an incorrect order", () => {
    expect(isOrderingDefinitionComplete(definition(["same", "same", "same"]))).toBe(false);
  });

  it("enforces subtype content limits", () => {
    const draft = definition(["a".repeat(61), "second", "third"]);
    draft.subtype = "WORD";
    expect(isOrderingDefinitionComplete(draft)).toBe(false);
  });

  it("builds preview shuffles that are not accepted visible orders", () => {
    const draft = definition(
      ["Today", "we learn", "English"],
      [
        ["item-1", "item-2", "item-3"],
        ["item-1", "item-3", "item-2"],
      ],
    );
    expect(gradeOrderingDraft(draft, makeOrderingPreviewOrder(draft))).toBe(false);
  });

  it("keeps alternatives invalid for explicit review after an item changes", () => {
    const draft = definition(
      ["one", "two", "three"],
      [
        ["item-1", "item-2", "item-3"],
        ["item-3", "item-2", "item-1"],
      ],
    );
    const changed = synchronizeOrderingDefinition(draft, [
      ...draft.items,
      { key: "item-4", content: "four" },
    ]);

    expect(changed.acceptedOrders[1]).toEqual(["item-3", "item-2", "item-1"]);
    expect(isOrderingDefinitionComplete(changed)).toBe(false);
  });
});
