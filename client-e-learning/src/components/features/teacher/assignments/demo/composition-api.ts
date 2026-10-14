import { request } from "@/services/api.service";
import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import { getAssignment, updateAssignment } from "@/services/assignment.service";
import type {
  Assignment as ApiAssignment,
  AssignmentQuestion,
  CreateAssignmentQuestionRequest,
} from "@/types/assignment";
import type { Assignment, BlockItem, Item, QuestionItem, Section } from "./types";

type CompositionItemDto = {
  id: number; position: number; itemType: string; questionId: number | null;
  possiblePoints: number; required: boolean; example: boolean;
  blockPayload: Record<string, unknown> | null; children: CompositionItemDto[];
};
type CompositionSectionDto = { id: number; position: number; title: string | null; instructions: string | null; items: CompositionItemDto[] };
type CompositionDto = { assignmentId: number; schemaVersion: number; provenance: string; showScoreAfterSubmit: boolean; sections: CompositionSectionDto[] };
type CompositionItemWrite = {
  id?: number; position: number; itemType: string; questionId?: number;
  possiblePoints: number; required: boolean; example: boolean;
  blockPayload?: Record<string, unknown>; children?: CompositionItemWrite[];
};

const qid = (id: number) => `q_server_${id}`;
const bid = (id: number) => `b_server_${id}`;
const sid = (id: number) => `s_server_${id}`;
const str = (v: unknown, fallback = "") => typeof v === "string" ? v : fallback;
const questionWriteSnapshot = (q: QuestionItem) => JSON.stringify(toQuestionWrite(q));

function toQuestionWrite(q: QuestionItem): CreateAssignmentQuestionRequest {
  const c = q.content;
  if (c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") {
    const trueFalse = c.type === "SINGLE_CHOICE" && c.options.length === 2 &&
      c.options.some((o) => o.text.toLowerCase() === "true") && c.options.some((o) => o.text.toLowerCase() === "false");
    return {
      type: trueFalse ? "TRUE_FALSE" : c.type,
      difficulty: "EASY",
      content: c.prompt.trim() || (trueFalse ? "True or false?" : "Choose the correct answer."),
      explanation: c.explanation, hint: c.hint,
      options: trueFalse ? undefined : c.options.map((o) => ({ content: o.text, isCorrect: o.isCorrect })),
      answers: trueFalse ? [{ rawValue: c.options.find((o) => o.isCorrect)?.text.toUpperCase() ?? "TRUE" }] : undefined,
    };
  }
  if (c.type === "TEXT_INPUT") return {
    type: "TYPE_ANSWER", difficulty: "EASY",
    content: c.prompt.trim() || "Type your answer.",
    explanation: c.explanation, hint: c.hint,
    answers: c.acceptedAnswers.filter((x) => x.trim()).map((rawValue) => ({ rawValue: rawValue.trim() })),
  };
  throw new Error(`Question type ${c.type} cannot be persisted by the current Question Engine API yet. No Composition changes were saved.`);
}

function mapQuestion(q: AssignmentQuestion, item: CompositionItemDto): QuestionItem {
  const source = q.question;
  const prompt = source.content ?? "";
  let content: QuestionItem["content"];
  switch (source.type) {
    case "SINGLE_CHOICE":
      content = { type: "SINGLE_CHOICE", prompt, display: "list", options: (source.options ?? []).map(o => ({ id: String(o.id), text: o.content, isCorrect: o.isCorrect })) };
      break;
    case "MULTIPLE_CHOICE":
      content = { type: "MULTIPLE_CHOICE", prompt, options: (source.options ?? []).map(o => ({ id: String(o.id), text: o.content, isCorrect: o.isCorrect })) };
      break;
    case "TRUE_FALSE":
      content = { type: "SINGLE_CHOICE", prompt, display: "list", options: [
        { id: "true", text: "True", isCorrect: (source.answers ?? []).some(a => a.rawValue.toUpperCase() === "TRUE") },
        { id: "false", text: "False", isCorrect: (source.answers ?? []).some(a => a.rawValue.toUpperCase() === "FALSE") },
      ] };
      break;
    case "FILL_IN_BLANK":
    case "TYPE_ANSWER":
      content = { type: "TEXT_INPUT", prompt, acceptedAnswers: (source.answers ?? []).map(a => a.rawValue), caseSensitive: source.matchingMode === "CASE_SENSITIVE_TRIM" };
      break;
    default:
      throw new Error(`Assignment question #${q.questionId} has type ${source.type}. The current Builder cannot safely edit this type yet; no data was changed.`);
  }
  const mapped: QuestionItem = {
    id: qid(q.questionId), kind: "question", serverQuestionId: q.questionId, compositionItemId: item.id,
    content: { ...content, explanation: source.explanation ?? undefined, hint: source.hint ?? undefined } as QuestionItem["content"],
    config: { points: Number(item.possiblePoints ?? 1), required: item.required, gradingMode: "AUTO", isExample: item.example, groupId: null },
  };
  mapped.serverQuestionSnapshot = questionWriteSnapshot(mapped);
  return mapped;
}

function mapBlock(dto: CompositionItemDto): BlockItem {
  const p = dto.blockPayload ?? {};
  let block: BlockItem["block"];
  switch (dto.itemType) {
    case "INSTRUCTIONS": block = { type: "INSTRUCTIONS", text: str(p.text) }; break;
    case "PASSAGE": block = { type: "PASSAGE", title: str(p.title), text: str(p.text) }; break;
    case "MEDIA": block = { type: "MEDIA", url: str(p.url), alt: str(p.altText), caption: str(p.caption) }; break;
    case "POOL": block = { type: "POOL", title: str(p.title), entries: (Array.isArray(p.entries) ? p.entries : []).map((raw, i) => {
      const e = raw as Record<string, unknown>; return { id: str(e.id, `entry_${i}`), text: str(e.text) };
    }) }; break;
    default: throw new Error(`Unsupported Composition block type: ${dto.itemType}`);
  }
  return { id: bid(dto.id), kind: "block", compositionItemId: dto.id, block, memberIds: [] };
}

function mapAssignment(api: ApiAssignment, composition: CompositionDto, questions: AssignmentQuestion[]): Assignment {
  const qById = new Map(questions.map(q => [q.questionId, q]));
  const items: Record<string, Item> = {};
  const sections: Section[] = composition.sections.map(s => ({
    id: sid(s.id), serverId: s.id, titleEn: s.title ?? `Section ${s.position}`, titleVi: "",
    instructionsEn: s.instructions ?? "", instructionsVi: "", itemIds: [],
  }));
  const mapItem = (dto: CompositionItemDto, section: Section, parent?: BlockItem): void => {
    if (dto.itemType === "QUESTION") {
      if (dto.questionId == null) throw new Error("Composition question item is missing questionId.");
      const source = qById.get(dto.questionId);
      if (!source) throw new Error(`Composition refers to missing question #${dto.questionId}.`);
      const question = mapQuestion(source, dto);
      items[question.id] = question;
      if (parent) { parent.memberIds.push(question.id); question.config.groupId = parent.id; }
      else section.itemIds.push(question.id);
      return;
    }
    if (parent) throw new Error("Nested blocks are not supported in Composition v1.");
    const block = mapBlock(dto);
    items[block.id] = block;
    section.itemIds.push(block.id);
    for (const child of dto.children ?? []) mapItem(child, section, block);
  };
  composition.sections.forEach((s, i) => (s.items ?? []).forEach(item => mapItem(item, sections[i])));
  return {
    id: String(api.id), serverId: api.id, academicYear: api.academicYear, status: api.status,
    title: api.name, grade: api.gradeLevel === 7 ? 7 : api.gradeLevel === 8 ? 8 : 6,
    instructions: api.description ?? "",
    settings: {
      timeLimitMin: api.timeLimitSeconds ? Math.ceil(api.timeLimitSeconds / 60) : null,
      startAt: api.startAt?.slice(0, 16) ?? "", dueAt: api.dueAt?.slice(0, 16) ?? "",
      classIds: (api.targets ?? []).filter(t => t.type === "CLASS" && t.classId != null).map(t => String(t.classId)),
      showAnswers: api.showAnswersAfterSubmit ? "after_submission" : "off",
      showPoints: composition.showScoreAfterSubmit, shuffle: false,
    },
    sections, items, updatedAt: api.dueAt ?? new Date().toISOString(),
  };
}

export async function loadCompositionAssignment(id: string): Promise<Assignment> {
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) throw new Error("Create or select an Assignment first; the Builder requires a saved server Assignment ID.");
  const [assignment, composition, questions] = await Promise.all([
    getAssignment(numericId),
    request<CompositionDto>(`/v1/assignments/${numericId}/composition`),
    assignmentQuestionService.list(numericId),
  ]);
  if (!assignment.data || !composition.data) throw new Error("Could not load Assignment Composition.");
  return mapAssignment(assignment.data, composition.data, questions.data ?? []);
}

function blockPayload(block: BlockItem["block"]): Record<string, unknown> {
  switch (block.type) {
    case "INSTRUCTIONS": return { text: block.text };
    case "PASSAGE": return { title: block.title, text: block.text };
    case "MEDIA":
      if (!block.url.trim() || !block.alt.trim()) throw new Error("Media blocks need both a URL and alternative text before saving.");
      return { url: block.url.trim(), altText: block.alt.trim(), caption: block.caption };
    case "POOL":
      if (!block.entries.length || block.entries.some(e => !e.text.trim())) throw new Error("Every answer-pool entry must have text.");
      return { title: block.title, entries: block.entries.map(e => ({ id: e.id, text: e.text })) };
  }
}

export async function saveCompositionAssignment(a: Assignment): Promise<Assignment> {
  if (!a.serverId) throw new Error("Assignment has no server ID. Create it from the Assignments list first.");
  const id = a.serverId;
  const original = await assignmentQuestionService.list(id);
  const originalIds = new Set((original.data ?? []).map(q => q.questionId));
  const questions = Object.values(a.items).filter((item): item is QuestionItem => item.kind === "question");
  const currentIds = new Set(questions.map(q => q.serverQuestionId).filter((v): v is number => typeof v === "number"));
  const removed = [...originalIds].filter(questionId => !currentIds.has(questionId));
  if (removed.length) await assignmentQuestionService.bulkDelete(id, { ids: removed });

  for (const q of questions) {
    const payload = toQuestionWrite(q);
    if (!q.serverQuestionId) {
      const created = await assignmentQuestionService.create(id, [payload]);
      const saved = created.data?.[0];
      if (!saved) throw new Error("The server did not return the newly created question.");
      q.serverQuestionId = saved.questionId;
      q.serverQuestionSnapshot = questionWriteSnapshot(q);
    } else if (questionWriteSnapshot(q) !== q.serverQuestionSnapshot) {
      await assignmentQuestionService.update(id, q.serverQuestionId, payload);
      q.serverQuestionSnapshot = questionWriteSnapshot(q);
    }
  }

  function writeItem(itemId: string, position: number): CompositionItemWrite {
    const item = a.items[itemId];
    if (!item) throw new Error(`Composition item ${itemId} no longer exists.`);
    if (item.kind === "question") {
      if (!item.serverQuestionId) throw new Error("Question was not assigned a server ID.");
      return { ...(item.compositionItemId ? { id: item.compositionItemId } : {}), position, itemType: "QUESTION",
        questionId: item.serverQuestionId, possiblePoints: item.config.isExample ? 0 : Math.max(0.01, item.config.points),
        required: item.config.required, example: item.config.isExample };
    }
    return { ...(item.compositionItemId ? { id: item.compositionItemId } : {}), position, itemType: item.block.type,
      possiblePoints: 0, required: true, example: false, blockPayload: blockPayload(item.block),
      children: item.memberIds.map((child, i) => writeItem(child, i + 1)) };
  }
  await updateAssignment(id, {
    gradeLevel: a.grade, academicYear: a.academicYear ?? "2026 - 2027",
    name: a.title.trim() || "Untitled assignment", description: a.instructions,
    dueAt: a.settings.dueAt ? (a.settings.dueAt.length === 16 ? `${a.settings.dueAt}:00` : a.settings.dueAt) : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 19),
    startAt: a.settings.startAt ? (a.settings.startAt.length === 16 ? `${a.settings.startAt}:00` : a.settings.startAt) : undefined,
    timeLimitSeconds: a.settings.timeLimitMin ? a.settings.timeLimitMin * 60 : undefined,
    showAnswersAfterSubmit: a.settings.showAnswers !== "off",
    targets: a.settings.classIds.length
      ? a.settings.classIds.map(classId => ({ type: "CLASS" as const, classId: Number(classId) })).filter(target => Number.isSafeInteger(target.classId) && target.classId > 0)
      : [{ type: "GRADE" as const }],
  });
  await request<CompositionDto>(`/v1/assignments/${id}/composition`, {
    method: "PUT",
    body: JSON.stringify({
      showScoreAfterSubmit: a.settings.showPoints,
      sections: a.sections.map((section, i) => ({
        ...(section.serverId ? { id: section.serverId } : {}),
        position: i + 1, title: section.titleEn.trim() || `Section ${i + 1}`,
        instructions: section.instructionsEn.trim() || undefined,
        items: section.itemIds.map((itemId, index) => writeItem(itemId, index + 1)),
      })),
    }),
  });
  return loadCompositionAssignment(String(id));
}
