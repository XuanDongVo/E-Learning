import { request } from "@/services/api.service";
import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import { getAssignment, updateAssignment } from "@/services/assignment.service";
import type {
  Assignment as ApiAssignment,
  AssignmentQuestion,
  CreateAssignmentQuestionRequest,
} from "@/types/assignment";
import type { Assignment, BlockItem, Item, QuestionItem, Section } from "./types";
import { uid } from "./ops";

type CompositionItemDto = {
  id: number;
  position: number;
  itemType: string;
  questionId: number | null;
  possiblePoints: number;
  required: boolean;
  example: boolean;
  blockPayload: Record<string, unknown> | null;
  children: CompositionItemDto[];
};
type CompositionSectionDto = {
  id: number;
  position: number;
  title: string | null;
  instructions: string | null;
  items: CompositionItemDto[];
};
type CompositionDto = {
  assignmentId: number;
  schemaVersion: number;
  provenance: string;
  showScoreAfterSubmit: boolean;
  sections: CompositionSectionDto[];
};
type CompositionItemWrite = {
  id?: number;
  position: number;
  itemType: string;
  questionId?: number;
  possiblePoints: number;
  required: boolean;
  example: boolean;
  blockPayload?: Record<string, unknown>;
  children?: CompositionItemWrite[];
};

const questionLocalId = (id: number) => `q_server_${id}`;
const blockLocalId = (id: number) => `b_server_${id}`;
const sectionLocalId = (id: number) => `s_server_${id}`;

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
function answersOf(q: AssignmentQuestion) {
  return q.question.answers ?? [];
}
function optionsOf(q: AssignmentQuestion) {
  return q.question.options ?? [];
}
function mapQuestion(q: AssignmentQuestion, item: CompositionItemDto): QuestionItem {
  const source = q.question;
  const prompt = source.content ?? "";
  let content: QuestionItem["content"];
  switch (source.type) {
    case "SINGLE_CHOICE":
      content = {
        type: "SINGLE_CHOICE", prompt, display: "list",
        options: optionsOf(q).map((o) => ({ id: String(o.id), text: o.content, isCorrect: o.isCorrect })),
      };
      break;
    case "MULTIPLE_CHOICE":
      content = {
        type: "MULTIPLE_CHOICE", prompt,
        options: optionsOf(q).map((o) => ({ id: String(o.id), text: o.content, isCorrect: o.isCorrect })),
      };
      break;
    case "TRUE_FALSE":
      content = {
        type: "SINGLE_CHOICE", prompt, display: "list",
        options: [{ id: "true", text: "True", isCorrect: answersOf(q).some((a) => a.rawValue.toUpperCase() === "TRUE") },
                  { id: "false", text: "False", isCorrect: answersOf(q).some((a) => a.rawValue.toUpperCase() === "FALSE") }],
      };
      break;
    case "FILL_IN_BLANK":
    case "TYPE_ANSWER":
      content = {
        type: "TEXT_INPUT", prompt,
        acceptedAnswers: answersOf(q).map((a) => a.rawValue),
        caseSensitive: source.matchingMode === "CASE_SENSITIVE_TRIM",
      };
      break;
    default:
      throw new Error(`Question #${q.questionId} uses ${source.type}, which the current Assignment Builder adapter cannot safely edit yet. No data was changed. Please migrate this question type before saving this Assignment.`);
  }
  return {
    id: questionLocalId(q.questionId),
    kind: "question",
    serverQuestionId: q.questionId,
    compositionItemId: item.id,
    serverQuestionSnapshot: JSON.stringify({ type: source.type, content: source.content, options: source.options, answers: source.answers, matchingMode: source.matchingMode, explanation: source.explanation, hint: source.hint }),
    content: { ...content, explanation: source.explanation ?? undefined, hint: source.hint ?? undefined } as QuestionItem["content"],
    config: {
      points: Number(item.possiblePoints ?? 1),
      required: item.required,
      gradingMode: "AUTO",
      isExample: item.example,
      groupId: null,
    },
  };
}

function mapBlock(item: CompositionItemDto): BlockItem {
  const p = item.blockPayload ?? {};
  let block: BlockItem["block"];
  switch (item.itemType) {
    case "INSTRUCTIONS": block = { type: "INSTRUCTIONS", text: text(p.text) }; break;
    case "PASSAGE": block = { type: "PASSAGE", title: text(p.title), text: text(p.text) }; break;
    case "MEDIA": block = { type: "MEDIA", url: text(p.url), alt: text(p.altText), caption: text(p.caption) }; break;
    case "POOL": block = {
      type: "POOL", title: text(p.title),
      entries: (Array.isArray(p.entries) ? p.entries : []).map((entry, i) => {
        const e = entry as Record<string, unknown>;
        return { id: text(e.id, `entry_${i}`), text: text(e.text) };
      }),
    }; break;
    default: throw new Error(`Unsupported Composition block type: ${item.itemType}`);
  }
  return { id: blockLocalId(item.id), kind: "block", compositionItemId: item.id, block, memberIds: [] };
}

function mapApiAssignment(api: ApiAssignment, composition: CompositionDto, questions: AssignmentQuestion[]): Assignment {
  const questionById = new Map(questions.map((q) => [q.questionId, q]));
  const items: Record<string, Item> = {};
  const sections: Section[] = composition.sections.map((s) => ({
    id: sectionLocalId(s.id),
    serverId: s.id,
    titleEn: s.title ?? `Section ${s.position}`,
    titleVi: "",
    instructionsEn: s.instructions ?? "",
    instructionsVi: "",
    itemIds: [],
  }));

  const mapItem = (dto: CompositionItemDto, section: Section, parent?: BlockItem): string => {
    if (dto.itemType === "QUESTION") {
      if (dto.questionId == null) throw new Error("Composition question item is missing questionId.");
      const q = questionById.get(dto.questionId);
      if (!q) throw new Error(`Composition refers to missing Assignment question #${dto.questionId}.`);
      const mapped = mapQuestion(q, dto);
      items[mapped.id] = mapped;
      if (parent) {
        parent.memberIds.push(mapped.id);
        mapped.config.groupId = parent.id;
      } else {
        section.itemIds.push(mapped.id);
      }
      return mapped.id;
    }
    const block = mapBlock(dto);
    items[block.id] = block;
    if (parent) throw new Error("Nested blocks are not supported in Composition v1.");
    section.itemIds.push(block.id);
    for (const child of dto.children ?? []) mapItem(child, section, block);
    return block.id;
  };

  composition.sections.forEach((s, i) => {
    const section = sections[i];
    for (const item of s.items ?? []) mapItem(item, section);
  });

  const targetIds = (api.targets ?? []).filter((t) => t.type === "CLASS" && t.classId != null).map((t) => String(t.classId));
  return {
    id: String(api.id),
    serverId: api.id,
    academicYear: api.academicYear,
    status: api.status,
    title: api.name,
    grade: (api.gradeLevel === 7 ? 7 : api.gradeLevel === 8 ? 8 : 6),
    instructions: api.description ?? "",
    settings: {
      timeLimitMin: api.timeLimitSeconds ? Math.ceil(api.timeLimitSeconds / 60) : null,
      startAt: api.startAt ?? "",
      dueAt: api.dueAt ?? "",
      classIds: targetIds,
      showAnswers: api.showAnswersAfterSubmit ? "after_submission" : "off",
      showPoints: composition.showScoreAfterSubmit,
      shuffle: false,
    },
    sections,
    items,
    updatedAt: new Date().toISOString(),
  };
}

export async function loadCompositionAssignment(id: string): Promise<Assignment> {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) throw new Error("Open the Builder from a saved Assignment so it has a valid server ID.");
  const [assignment, composition, questions] = await Promise.all([
    getAssignment(numericId),
    request<CompositionDto>(`/v1/assignments/${numericId}/composition`),
    assignmentQuestionService.list(numericId),
  ]);
  if (!assignment.data || !composition.data) throw new Error("Could not load Assignment Composition.");
  return mapApiAssignment(assignment.data, composition.data, questions.data ?? []);
}

function toQuestionWrite(q: QuestionItem): CreateAssignmentQuestionRequest {
  const c = q.content;
  if (c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") {
    const trueFalse = c.type === "SINGLE_CHOICE" && c.options.length === 2 &&
      c.options.some((o) => o.text === "True") && c.options.some((o) => o.text === "False");
    return {
      type: trueFalse ? "TRUE_FALSE" : c.type,
      difficulty: "EASY",
      content: c.prompt.trim() || "Choose the correct answer.",
      explanation: c.explanation,
      hint: c.hint,
      options: trueFalse ? undefined : c.options.map((o) => ({ content: o.text, isCorrect: o.isCorrect })),
      answers: trueFalse ? [{ rawValue: c.options.find((o) => o.isCorrect)?.text.toUpperCase() ?? "TRUE" }] : undefined,
    };
  }
  if (c.type === "TEXT_INPUT") return {
    type: "TYPE_ANSWER",
    difficulty: "EASY",
    content: c.prompt.trim() || "Type your answer.",
    explanation: c.explanation,
    hint: c.hint,
    answers: c.acceptedAnswers.filter((a) => a.trim()).map((rawValue) => ({ rawValue: rawValue.trim() })),
  };
  throw new Error(`Saving question type ${c.type} is not supported by the current server Question Engine adapter yet.`);
}

function questionSnapshotFromUi(q: QuestionItem) {
  return JSON.stringify(toQuestionWrite(q));
}

function blockPayload(block: BlockItem["block"]): Record<string, unknown> {
  switch (block.type) {
    case "INSTRUCTIONS": return { text: block.text };
    case "PASSAGE": return { title: block.title, text: block.text };
    case "MEDIA":
      if (!block.url.trim()) throw new Error("Media block needs a URL before saving.");
      if (!block.alt.trim()) throw new Error("Media block needs alt text before saving.");
      return { url: block.url.trim(), altText: block.alt.trim(), caption: block.caption };
    case "POOL": return { title: block.title, entries: block.entries.map((e) => ({ id: e.id, text: e.text })) };
  }
}

export async function saveCompositionAssignment(a: Assignment): Promise<Assignment> {
  if (!a.serverId) throw new Error("Assignment has no server ID. Create it from the Assignments list first.");
  const id = a.serverId;

  const originalQuestions = await assignmentQuestionService.list(id);
  const originalIds = new Set((originalQuestions.data ?? []).map((q) => q.questionId));
  const currentQuestions = Object.values(a.items).filter((item): item is QuestionItem => item.kind === "question");
  const currentServerIds = new Set(currentQuestions.map((q) => q.serverQuestionId).filter((v): v is number => typeof v === "number"));
  const removedIds = [...originalIds].filter((questionId) => !currentServerIds.has(questionId));
  if (removedIds.length) {
    await assignmentQuestionService.bulkDelete(id, { ids: removedIds });
  }

  for (const q of currentQuestions) {
    const payload = toQuestionWrite(q);
    if (!q.serverQuestionId) {
      const created = await assignmentQuestionService.create(id, [payload]);
      const saved = created.data?.[0];
      if (!saved) throw new Error("The server did not return the newly created question.");
      q.serverQuestionId = saved.questionId;
      q.serverQuestionSnapshot = JSON.stringify({
        type: saved.question.type, content: saved.question.content, options: saved.question.options,
        answers: saved.question.answers, matchingMode: saved.question.matchingMode,
        explanation: saved.question.explanation, hint: saved.question.hint,
      });
    } else {
      const snapshot = questionSnapshotFromUi(q);
      if (snapshot !== q.serverQuestionSnapshot) {
        const updated = await assignmentQuestionService.update(id, q.serverQuestionId, payload);
        q.serverQuestionSnapshot = JSON.stringify({
          type: updated.data.question.type, content: updated.data.question.content, options: updated.data.question.options,
          answers: updated.data.question.answers, matchingMode: updated.data.question.matchingMode,
          explanation: updated.data.question.explanation, hint: updated.data.question.hint,
        });
      }
    }
  }

  const sections: CompositionSectionDto[] = [];
  const toWrite = (itemId: string, position: number): CompositionItemWrite => {
    const item = a.items[itemId];
    if (!item) throw new Error(`Composition item ${itemId} no longer exists.`);
    if (item.kind === "question") {
      if (!item.serverQuestionId) throw new Error("Question was not assigned a server ID.");
      return {
        ...(item.compositionItemId ? { id: item.compositionItemId } : {}),
        position, itemType: "QUESTION", questionId: item.serverQuestionId,
        possiblePoints: item.config.isExample ? 0 : Math.max(0.01, item.config.points),
        required: item.config.required, example: item.config.isExample,
      };
    }
    const loc = a.sections.find((s) => s.itemIds.includes(itemId));
    const parent = loc ? itemId : itemId;
    return {
      ...(item.compositionItemId ? { id: item.compositionItemId } : {}),
      position,
      itemType: item.block.type,
      possiblePoints: 0, required: true, example: false,
      blockPayload: blockPayload(item.block),
      children: item.memberIds.map((memberId, i) => toWrite(memberId, i + 1)),
    };
  };
  const toWrite = (itemId: string, position: number): CompositionItemWrite => {
    const item = a.items[itemId];
    if (!item) throw new Error(`Composition item ${itemId} no longer exists.`);
    if (item.kind === "question") {
      if (!item.serverQuestionId) throw new Error("Question was not assigned a server ID.");
      return {
        ...(item.compositionItemId ? { id: item.compositionItemId } : {}),
        position, itemType: "QUESTION", questionId: item.serverQuestionId,
        possiblePoints: item.config.isExample ? 0 : Math.max(0.01, item.config.points),
        required: item.config.required, example: item.config.isExample,
      };
    }
    return {
      ...(item.compositionItemId ? { id: item.compositionItemId } : {}),
      position, itemType: item.block.type, possiblePoints: 0, required: true, example: false,
      blockPayload: blockPayload(item.block),
      children: item.memberIds.map((memberId, i) => toWrite(memberId, i + 1)),
    };
  };
  const payload = {
    showScoreAfterSubmit: a.settings.showPoints,
    sections: a.sections.map((s, i) => ({
      ...(s.serverId ? { id: s.serverId } : {}),
      position: i + 1,
      title: s.titleEn.trim() || `Section ${i + 1}`,
      instructions: s.instructionsEn.trim() || undefined,
      items: s.itemIds.map((itemId, index) => toWrite(itemId, index + 1)),
    })),
  };

  await updateAssignment(id, {
    gradeLevel: a.grade,
    academicYear: a.academicYear ?? "2026 - 2027",
    name: a.title.trim() || "Untitled assignment",
    description: a.instructions,
    dueAt: a.settings.dueAt || new Date(Date.now() + 7 * 86400000).toISOString(),
    startAt: a.settings.startAt || undefined,
    timeLimitSeconds: a.settings.timeLimitMin ? a.settings.timeLimitMin * 60 : undefined,
    showAnswersAfterSubmit: a.settings.showAnswers !== "off",
    targets: a.settings.classIds.length
      ? a.settings.classIds.map((classId) => ({ type: "CLASS" as const, classId: Number(classId) })).filter((target) => Number.isSafeInteger(target.classId) && target.classId > 0)
      : [{ type: "GRADE" as const }],
  });

  await request<CompositionDto>(`/v1/assignments/${id}/composition`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const reloaded = await loadCompositionAssignment(String(id));
  return reloaded;
}
