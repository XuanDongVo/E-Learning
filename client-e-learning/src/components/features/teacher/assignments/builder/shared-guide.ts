import type {
  Assignment,
  BlockItem,
  BlockType,
  ID,
  Item,
  QuestionItem,
  ToolKey,
} from "@/types/assignment-builder";
import * as ops from "./ops";
import { validate } from "./validation";

export type GuideScenario = "cloze" | "pool" | "media" | "instructions" | "groups";
export const GUIDE_BLOCK: Record<GuideScenario, BlockType> = {
  cloze: "PASSAGE",
  pool: "POOL",
  media: "MEDIA",
  instructions: "INSTRUCTIONS",
  groups: "PASSAGE",
};
export const GUIDE_SECTION_A = "guide-section-a";
export const GUIDE_SECTION_B = "guide-section-b";

/** A self-contained editor document: never read or write the real Builder store. */
export function createPractice(): Assignment {
  const a = ops.createEmptyAssignment();
  return {
    ...a,
    id: "guide-local-only",
    title: "Bài thực hành Shared Content (không lưu)",
    grade: 7,
    sections: [
      { id: GUIDE_SECTION_A, title: "Section I · Thực hành", titleVi: "Phần I", instructions: "", instructionsVi: "", itemIds: [] },
      { id: GUIDE_SECTION_B, title: "Section II · Đích di chuyển", titleVi: "Phần II", instructions: "", instructionsVi: "", itemIds: [] },
    ],
  };
}

export function addPracticeItem(a: Assignment, tool: ToolKey, sectionId: ID, groupId: ID | null = null): ID {
  if (tool === "SECTION") throw new Error("Guide sections are already created");
  const section = ops.getSection(a, sectionId);
  if (!section) throw new Error("Unknown guide section");
  const group = groupId ? a.items[groupId] : null;
  if (groupId && (!group || group.kind !== "block" || !ops.locate(a, groupId)))
    throw new Error("The chosen shared block no longer exists");
  const item = ops.createItem(tool);
  a.items[item.id] = item;
  const target = groupId ? { sectionId, groupId, index: group!.kind === "block" ? group!.memberIds.length : 0 }
    : { sectionId, groupId: null, index: section.itemIds.length };
  ops.place(a, item.id, target);
  return item.id;
}

export function firstPracticeBlock(a: Assignment): BlockItem | null {
  for (const section of a.sections) {
    for (const id of section.itemIds) {
      const item = a.items[id];
      if (item?.kind === "block") return item;
    }
  }
  return null;
}

/** Add only missing blank questions; preserve existing IDs, edits and answers. */
export function generatePracticeBlanks(a: Assignment, blockId: ID): ID[] {
  const block = a.items[blockId];
  if (block?.kind !== "block" || block.block.type !== "PASSAGE") return [];
  const placement = ops.locate(a, blockId);
  if (!placement) return [];
  const numbers = [...new Set(ops.blankNumbers(block.block.text))];
  const existing = new Set(block.memberIds
    .map((id) => a.items[id])
    .filter((it): it is QuestionItem => it?.kind === "question")
    .map((q) => q.content.blankRef));
  const created: ID[] = [];
  for (const n of numbers) {
    if (existing.has(n)) continue;
    const id = addPracticeItem(a, "TEXT_INPUT", placement.sectionId, blockId);
    const q = a.items[id] as QuestionItem;
    if (q.content.type === "TEXT_INPUT") {
      q.content.prompt = ""; // The passage already provides the surrounding text.
      q.content.blankRef = n;
      q.content.acceptedAnswers = [""];
    }
    created.push(id);
  }
  block.memberIds.sort((left, right) => {
    const l = a.items[left], r = a.items[right];
    return (l?.kind === "question" ? l.content.blankRef ?? 999 : 999)
      - (r?.kind === "question" ? r.content.blankRef ?? 999 : 999);
  });
  return created;
}

export function practiceBlanksLinked(a: Assignment, block: BlockItem): boolean {
  if (block.block.type !== "PASSAGE") return false;
  const numbers = [...new Set(ops.blankNumbers(block.block.text))];
  if (!numbers.length) return false;
  return numbers.every((n) => block.memberIds.some((id) => {
    const q = a.items[id];
    return q?.kind === "question" && q.content.blankRef === n;
  }));
}

export function practiceQuestionReady(item: Item, assignment: Assignment): boolean {
  if (item.kind !== "question") return false;
  return !validate(assignment).some((issue) => issue.level === "error" && issue.target.id === item.id);
}

export function fillPracticeBlock(block: BlockItem, scenario: GuideScenario): void {
  if (block.block.type === "PASSAGE") {
    block.block.title = "A day at school";
    block.block.text = scenario === "cloze"
      ? "There are many {{1}} in our school. Our {{2}} is very helpful."
      : "Our school has a library and a large playground. Students read there every afternoon.";
  } else if (block.block.type === "POOL") {
    block.block.title = "Fruit vocabulary";
    block.block.entries = ["apple", "banana", "grape"].map((text, i) => ({
      id: block.block.type === "POOL" ? block.block.entries[i]?.id ?? ops.uid("e") : ops.uid("e"), text,
    }));
  } else if (block.block.type === "MEDIA") {
    block.block.url = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80";
    block.block.alt = "A classroom with student desks";
    block.block.caption = "Classroom photo (external demo URL)";
  } else {
    block.block.text = "Read the shared context carefully and answer the questions below.";
  }
}

export function fillPracticeQuestion(q: QuestionItem, a: Assignment, index = 0): void {
  const c = q.content;
  if (c.type === "MATCHING") {
    const loc = ops.locate(a, q.id);
    const group = loc?.groupId ? a.items[loc.groupId] : undefined;
    const pool = group?.kind === "block" && group.block.type === "POOL" ? group
      : a.sections.find((s) => s.id === loc?.sectionId)?.itemIds
        .map((id) => a.items[id]).find((item): item is BlockItem => item?.kind === "block" && item.block.type === "POOL");
    if (!pool || pool.block.type !== "POOL") return;
    c.poolId = pool.id;
    c.correctEntryId = pool.block.entries[index % pool.block.entries.length]?.id ?? null;
    c.prompt = ["A red fruit", "A long yellow fruit", "A small fruit growing in bunches"][index % 3];
  } else if (c.type === "SINGLE_CHOICE") {
    c.prompt = "What can you see in the picture?";
    c.options.forEach((o, i) => {
      o.text = ["A classroom", "A swimming pool", "A supermarket", "A football stadium"][i] ?? `Option ${i + 1}`;
      o.isCorrect = i === 0;
    });
  } else if (c.type === "TEXT_INPUT") {
    c.prompt = c.blankRef == null ? "Where do students read books?" : "";
    c.acceptedAnswers = [c.blankRef === 1 ? "students" : c.blankRef === 2 ? "teacher" : "library"];
  }
}

/** Shared Content groups move as one unit. A detached Matching question still needs its Pool. */
export function detachPracticeQuestion(a: Assignment, questionId: ID): void {
  const loc = ops.locate(a, questionId);
  if (!loc?.groupId) return;
  const section = ops.getSection(a, loc.sectionId)!;
  ops.moveTo(a, questionId, { sectionId: loc.sectionId, groupId: null, index: section.itemIds.length });
}

export function removePracticeBlock(a: Assignment, blockId: ID, keepQuestions: boolean): void {
  const block = a.items[blockId];
  if (block?.kind !== "block") return;
  if (keepQuestions && block.block.type === "POOL") {
    for (const id of block.memberIds) {
      const q = a.items[id];
      if (q?.kind === "question" && q.content.type === "MATCHING" && q.content.poolId === blockId) {
        q.content.poolId = null;
        q.content.correctEntryId = null;
      }
    }
  }
  ops.removeItem(a, blockId, !keepQuestions);
}
