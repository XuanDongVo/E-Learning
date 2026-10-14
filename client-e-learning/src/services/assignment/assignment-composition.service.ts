import { request } from "@/services/api.service";
import { getAssignment, updateAssignment } from "@/services/assignment.service";
import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import type { Assignment as ApiAssignment, AssignmentQuestion } from "@/types/assignment";
import type { Assignment as BuilderAssignment, BlockItem, Item, QuestionItem, Section } from "@/components/features/teacher/assignments/builder/types";

type ApiItem = {
  id: number;
  position: number;
  itemType: string;
  questionId: number | null;
  possiblePoints: number;
  required: boolean;
  example: boolean;
  blockPayload: Record<string, unknown> | null;
  children: ApiItem[];
};
type ApiSection = { id: number; position: number; title: string | null; instructions: string | null; items: ApiItem[] };
type ApiComposition = {
  assignmentId: number;
  schemaVersion: number;
  provenance: string;
  showScoreAfterSubmit: boolean;
  sections: ApiSection[];
};
type WriteItem = {
  id: number | null;
  position: number;
  itemType: string;
  questionId: number | null;
  possiblePoints: number;
  required: boolean;
  example: boolean;
  blockPayload: Record<string, unknown> | null;
  children: WriteItem[];
};
type WriteSection = { id: number | null; position: number; title: string; instructions: string; items: WriteItem[] };

const asId = (prefix: string, id: number | string) => `${prefix}-${id}`;
const numberId = (id: string | undefined, prefix: string) => {
  if (!id?.startsWith(`${prefix}-`)) return null;
  const n = Number(id.slice(prefix.length + 1));
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

function parseAnswers(question: AssignmentQuestion["question"]) {
  return (question.answers ?? []).map((answer) => answer.rawValue).filter(Boolean);
}

function mapQuestion(row: AssignmentQuestion, item: ApiItem | undefined): QuestionItem {
  const q = row.question;
  const prompt = q.content ?? "";
  const options = (q.options ?? []).map((o) => ({
    id: String(o.id),
    text: o.content,
    isCorrect: Boolean((o as unknown as { correct?: boolean; isCorrect?: boolean }).correct ?? o.isCorrect),
  }));
  const answers = parseAnswers(q);
  const common = { prompt, explanation: q.explanation ?? "", hint: q.hint ?? "", blankRef: null as number | null };
  let content: QuestionItem["content"];
  switch (q.type) {
    case "SINGLE_CHOICE":
      content = { ...common, type: "SINGLE_CHOICE", options, display: "list" };
      break;
    case "MULTIPLE_CHOICE":
      content = { ...common, type: "MULTIPLE_CHOICE", options };
      break;
    case "TRUE_FALSE": {
      const answer = answers[0]?.toUpperCase();
      content = { ...common, type: "SINGLE_CHOICE", options: [
        { id: `tf-true-${row.questionId}`, text: "True", isCorrect: answer === "TRUE" },
        { id: `tf-false-${row.questionId}`, text: "False", isCorrect: answer === "FALSE" },
      ], display: "list" };
      break;
    }
    case "TYPE_ANSWER":
    case "FILL_IN_BLANK":
      content = { ...common, type: "TEXT_INPUT", acceptedAnswers: answers, caseSensitive: q.matchingMode === "CASE_SENSITIVE_TRIM", prefix: "", cue: "" };
      break;
    case "CLOZE": {
      const blankCount = (prompt.match(/\{\{\s*\d+\s*\}\}/g) ?? []).length;
      content = { ...common, type: "MULTI_TEXT_INPUT", blanks: Array.from({ length: blankCount }, (_, i) => ({ id: `blank-${row.questionId}-${i + 1}`, acceptedAnswers: answers[i] ? [answers[i]] : [] })), caseSensitive: q.matchingMode === "CASE_SENSITIVE_TRIM" };
      break;
    }
    case "MATCHING":
      // The current AssignmentQuestion API does not expose matching pairs or an answer-pool relation.
      // Preserve the item and make the unsupported legacy representation explicit instead of inventing answers.
      content = { ...common, type: "MATCHING", poolId: null, correctEntryId: null };
      break;
    default:
      content = { ...common, type: "TEXT_INPUT", acceptedAnswers: answers, caseSensitive: false };
  }
  return {
    id: asId("q", row.questionId),
    kind: "question",
    content,
    config: {
      points: item?.possiblePoints ?? 1,
      required: item?.required ?? true,
      gradingMode: "AUTO",
      isExample: item?.example ?? false,
      groupId: null,
    },
  } as QuestionItem;
}

function blockFromApi(item: ApiItem): BlockItem {
  const p = item.blockPayload ?? {};
  let block: BlockItem["block"];
  if (item.itemType === "PASSAGE") block = { type: "PASSAGE", title: String(p.title ?? ""), text: String(p.text ?? "") };
  else if (item.itemType === "MEDIA") block = { type: "MEDIA", url: String(p.assetId ?? ""), alt: String(p.altText ?? ""), caption: String(p.caption ?? "") };
  else if (item.itemType === "POOL") {
    const entries = Array.isArray(p.entries) ? p.entries as Array<Record<string, unknown>> : [];
    block = { type: "POOL", title: String(p.title ?? ""), entries: entries.map((e, i) => ({ id: String(e.id ?? `entry-${item.id}-${i + 1}`), text: String(e.text ?? "") })) };
  } else block = { type: "INSTRUCTIONS", text: String(p.text ?? "") };
  return { id: asId("b", item.id), kind: "block", block, memberIds: (item.children ?? []).map((child) => asId("q", child.questionId ?? child.id)) };
}

function mapAssignment(api: ApiAssignment, composition: ApiComposition, questions: AssignmentQuestion[]): BuilderAssignment {
  const questionById = new Map(questions.map((q) => [q.questionId, q]));
  const items: Record<string, Item> = {};
  const sections: Section[] = composition.sections.map((s) => {
    const rootIds: string[] = [];
    for (const item of [...(s.items ?? [])].sort((a, b) => a.position - b.position)) {
      if (item.itemType === "QUESTION" && item.questionId != null) {
        const row = questionById.get(item.questionId);
        if (!row) continue;
        const q = mapQuestion(row, item);
        items[q.id] = q;
        rootIds.push(q.id);
      } else {
        const block = blockFromApi(item);
        items[block.id] = block;
        rootIds.push(block.id);
        for (const child of [...(item.children ?? [])].sort((a, b) => a.position - b.position)) {
          if (child.questionId == null) continue;
          const row = questionById.get(child.questionId);
          if (!row) continue;
          const q = mapQuestion(row, child);
          q.config.groupId = block.id;
          if (block.block.type === "POOL" && q.content.type === "MATCHING") q.content.poolId = block.id;
          items[q.id] = q;
        }
        if (block.block.type === "POOL") {
          for (const memberId of block.memberIds) {
            const q = items[memberId];
            if (q?.kind === "question" && q.content.type === "MATCHING") q.content.poolId = block.id;
          }
        }
      }
    }
    const title = s.title ?? "Section";
    return { id: asId("s", s.id), titleEn: title, titleVi: title, instructionsEn: s.instructions ?? "", instructionsVi: "", itemIds: rootIds };
  });

  // Keep legacy-owned questions visible even if older Composition data was incomplete.
  for (const row of questions) {
    const id = asId("q", row.questionId);
    if (!items[id]) {
      items[id] = mapQuestion(row, undefined);
      if (!sections.length) sections.push({ id: "s-local-1", titleEn: "Section 1", titleVi: "Section 1", instructionsEn: "", instructionsVi: "", itemIds: [] });
      sections[0].itemIds.push(id);
    }
  }

  const settings = {
    timeLimitMin: api.timeLimitSeconds ? Math.ceil(api.timeLimitSeconds / 60) : null,
    startAt: api.startAt ?? "",
    dueAt: api.dueAt ?? "",
    classIds: api.targets.filter((t) => t.type === "CLASS" && t.classId != null).map((t) => String(t.classId)),
    showAnswers: api.showAnswersAfterSubmit ? "after_submission" as const : "off" as const,
    showPoints: composition.showScoreAfterSubmit,
    shuffle: false,
  };
  return {
    id: String(api.id),
    title: api.name,
    grade: Math.min(8, Math.max(6, api.gradeLevel)) as 6 | 7 | 8,
    instructions: api.description ?? "",
    settings,
    sections,
    items,
    updatedAt: new Date().toISOString(),
  };
}

function serializeBlock(block: BlockItem["block"]): { itemType: string; blockPayload: Record<string, unknown> } {
  switch (block.type) {
    case "INSTRUCTIONS": return { itemType: "INSTRUCTIONS", blockPayload: { text: block.text } };
    case "PASSAGE": return { itemType: "PASSAGE", blockPayload: { title: block.title, text: block.text } };
    case "MEDIA": return { itemType: "MEDIA", blockPayload: { assetId: block.url, altText: block.alt, caption: block.caption } };
    case "POOL": return { itemType: "POOL", blockPayload: { title: block.title, entries: block.entries.map((e) => ({ id: e.id, text: e.text })) } };
  }
}

function serializeQuestion(q: QuestionItem, position: number, id: number | null): WriteItem {
  return {
    id, position, itemType: "QUESTION", questionId: numberId(q.id, "q"),
    possiblePoints: q.config.isExample ? 0 : q.config.points,
    required: q.config.required, example: q.config.isExample, blockPayload: null, children: [],
  };
}

function serializeItem(item: Item, position: number, sectionId: string, allItems: Record<string, Item>): WriteItem {
  if (item.kind === "question") return serializeQuestion(item, position, numberId(item.id, "item"));
  const b = serializeBlock(item.block);
  const id = numberId(item.id, "b");
  const children = item.memberIds.map((memberId, index) => allItems[memberId]).filter((x): x is QuestionItem => x?.kind === "question")
    .map((q, index) => serializeQuestion(q, index + 1, numberId(q.id, "item")));
  return {
    id, position, itemType: b.itemType, questionId: null, possiblePoints: 0, required: true, example: false,
    blockPayload: b.blockPayload, children,
  };
}

function questionPayload(q: QuestionItem) {
  const c = q.content;
  if (c.type === "MATCHING") {
    throw new Error("This question uses Matching, which the legacy question-write API cannot persist losslessly yet. Do not save until the canonical QuestionSpec write endpoint is connected.");
  }
  if (c.type === "MULTI_TEXT_INPUT") {
    throw new Error("This question uses Cloze/multiple blanks, which the legacy question-write API cannot persist losslessly yet. Do not save until the canonical QuestionSpec write endpoint is connected.");
  }
  if (c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") {
    const trueFalse = c.options.length === 2 && c.options.every((o) => ["true", "false"].includes(o.text.trim().toLowerCase())) && c.options.some((o) => o.id.startsWith("tf-"));
    return {
      type: trueFalse ? "TRUE_FALSE" : c.type,
      difficulty: "MEDIUM",
      content: c.prompt,
      explanation: c.explanation || undefined,
      hint: c.hint || undefined,
      options: trueFalse ? undefined : c.options.map((o) => ({ content: o.text, isCorrect: o.isCorrect })),
      answers: trueFalse ? [{ rawValue: c.options.find((o) => o.isCorrect)?.text.toUpperCase() }] : undefined,
      mediaIds: [],
    };
  }
  return {
    type: "TYPE_ANSWER",
    difficulty: "MEDIUM",
    content: c.prompt,
    explanation: c.explanation || undefined,
    hint: c.hint || undefined,
    answers: c.acceptedAnswers.filter((x) => x.trim()).map((rawValue) => ({ rawValue })),
    mediaIds: [],
  };
}

export async function loadBuilderAssignment(id?: string): Promise<BuilderAssignment> {
  if (!id) {
    throw new Error("Create an Assignment from the Assignments list first, then open it in the Builder.");
  }
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) throw new Error("Invalid Assignment ID.");
  const [assignment, composition, questions] = await Promise.all([
    getAssignment(numericId),
    request<ApiComposition>(`/v1/assignments/${numericId}/composition`),
    assignmentQuestionService.list(numericId),
  ]);
  if (!assignment.data || !composition.data) throw new Error("Assignment data is incomplete.");
  return mapAssignment(assignment.data, composition.data, questions.data ?? []);
}

export async function saveBuilderAssignment(a: BuilderAssignment): Promise<BuilderAssignment> {
  const id = Number(a.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Cannot save a Builder draft without a server Assignment ID.");

  const assignmentResponse = await getAssignment(id);
  const current = assignmentResponse.data;
  if (!current) throw new Error("Assignment not found.");
  const targetIds = new Set(a.settings.classIds.map(Number).filter((x) => Number.isSafeInteger(x) && x > 0));
  const dueAt = a.settings.dueAt || current.dueAt;
  const startAt = a.settings.startAt || current.startAt;
  await updateAssignment(id, {
    gradeLevel: a.grade,
    academicYear: current.academicYear,
    name: a.title.trim() || current.name,
    description: a.instructions,
    startAt: startAt || undefined,
    dueAt,
    timeLimitSeconds: a.settings.timeLimitMin == null ? undefined : Math.round(a.settings.timeLimitMin * 60),
    showAnswersAfterSubmit: a.settings.showAnswers !== "off",
    targets: current.targets.map((t) => t.type === "CLASS" ? { type: "CLASS" as const, classId: t.classId! } : { type: "GRADE" as const }),
  });

  const questionRows = (await assignmentQuestionService.list(id)).data ?? [];
  const rowById = new Map(questionRows.map((row) => [asId("q", row.questionId), row]));
  for (const item of Object.values(a.items)) {
    if (item.kind !== "question") continue;
    const row = rowById.get(item.id);
    if (!row) {
      throw new Error("New questions must be saved through the Question Engine before saving Composition.");
    }
    const payload = questionPayload(item);
    await assignmentQuestionService.update(id, row.questionId, payload as never);
  }

  const sections: WriteSection[] = a.sections.map((section, sectionIndex) => ({
    id: numberId(section.id, "s"),
    position: sectionIndex + 1,
    title: section.titleEn.trim() || `Section ${sectionIndex + 1}`,
    instructions: section.instructionsEn,
    items: section.itemIds.map((itemId, itemIndex) => {
      const item = a.items[itemId];
      if (!item) throw new Error(`Composition contains missing item ${itemId}.`);
      if (item.kind === "question") {
        const q = serializeQuestion(item, itemIndex + 1, numberId(item.id, "item"));
        q.id = numberId(item.id, "item");
        return q;
      }
      const serialized = serializeItem(item, itemIndex + 1, section.id, a.items);
      serialized.id = numberId(item.id, "b");
      serialized.children = item.memberIds.map((memberId, childIndex) => {
        const child = a.items[memberId];
        if (!child || child.kind !== "question") throw new Error("Only question items may be nested inside a shared block.");
        return serializeQuestion(child, childIndex + 1, numberId(child.id, "item"));
      });
      return serialized;
    }),
  }));
  const compositionResponse = await request<ApiComposition>(`/v1/assignments/${id}/composition`, {
    method: "PUT",
    body: JSON.stringify({ sections, showScoreAfterSubmit: a.settings.showPoints }),
  });
  if (!compositionResponse.data) throw new Error("Composition save returned no data.");
  return await loadBuilderAssignment(String(id));
}
