import { assignmentQuestionService } from "./assignment.question.service";
import * as ops from "@/components/features/teacher/assignments/builder/ops";
import type {
  CreateAssignmentQuestionRequest,
  AssignmentQuestion,
} from "@/types/assignment";
import type {
  Assignment,
  QuestionItem,
  QuestionContent,
} from "@/types/assignment-builder";

function mediaIds(item: QuestionItem) {
  return (item.serverMediaIds ?? [])
    .filter((id) => Number.isSafeInteger(id) && id > 0);
}

function toPayload(item: QuestionItem): CreateAssignmentQuestionRequest {
  const content = item.content;
  const common = {
    difficulty: item.serverDifficulty ?? "EASY" as const,
    content: content.prompt.trim(),
    explanation: content.explanation?.trim() || undefined,
    hint: content.hint?.trim() || undefined,
    mediaIds: mediaIds(item),
  };

  if (content.type === "SINGLE_CHOICE" || content.type === "MULTIPLE_CHOICE") {
    return {
      ...common,
      type: content.type,
      options: content.options.map((option) => ({
        content: option.text.trim(),
        isCorrect: option.isCorrect,
      })),
    };
  }
  if (content.type === "TRUE_FALSE") {
    return {
      ...common,
      type: "TRUE_FALSE",
      answers: content.answer ? [{ rawValue: content.answer }] : [],
    };
  }
  if (content.type === "TEXT_INPUT") {
    const type = item.serverType === "TYPE_ANSWER" ? "TYPE_ANSWER" : "FILL_IN_BLANK";
    return {
      ...common,
      type,
      answers: content.acceptedAnswers
        .map((answer) => answer.trim())
        .filter(Boolean)
        .map((rawValue) => ({ rawValue })),
    };
  }
  if (content.type === "MATCHING") {
    return {
      ...common,
      type: "MATCHING",
      definition: {
        matching: {
          poolId: content.poolId,
          correctEntryId: content.correctEntryId,
        },
      },
    };
  }
  if (content.type === "CLOZE" || content.type === "MULTI_TEXT_INPUT") {
    const authored = {
      type: "CLOZE" as const,
      prompt: content.prompt,
      explanation: content.explanation,
      hint: content.hint,
      blankRef: content.blankRef,
      caseSensitive: content.caseSensitive,
      segments: content.type === "CLOZE" ? content.segments : [],
      blanks: content.blanks.map((blank, index) => ({
        id: blank.id,
        key: "key" in blank ? blank.key : `blank-${index + 1}`,
        acceptedAnswers: [...blank.acceptedAnswers],
      })),
    };
    const synchronized = ops.syncClozeContent(authored);
    return {
      ...common,
      content: content.prompt,
      type: "CLOZE",
      definition: {
        cloze: {
          segments: synchronized.segments.map((segment) => ({ text: segment.text })),
          blanks: synchronized.blanks.map((blank) => {
            const acceptedAnswers = blank.acceptedAnswers
              .map((answer) => answer.trim())
              .filter(Boolean);
            return { key: blank.key, acceptedAnswers: acceptedAnswers.length ? acceptedAnswers : [""] };
          }),
          caseSensitive: synchronized.caseSensitive,
        },
      },
    };
  }
  throw new Error(`Unsupported question content type: ${(content as QuestionContent).type}`);
}

function mergeResponse(item: QuestionItem, response: AssignmentQuestion): void {
  item.serverQuestionId = response.questionId;
  item.serverType = response.question.type;
  item.serverDifficulty = response.question.difficulty;
  item.serverMediaIds = response.question.media.map((media) => media.mediaId);
  item.serverMedia = response.question.media.map((media) => ({
    mediaId: media.mediaId,
    mediaType: media.mediaType,
    url: media.url,
  }));
}

export async function persistBuilderQuestions(assignment: Assignment): Promise<Assignment> {
  const draft = structuredClone(assignment);
  const questions = Object.values(draft.items).filter(
    (item): item is QuestionItem => item.kind === "question",
  );
  const assignmentId = Number(draft.id);
  if (!Number.isSafeInteger(assignmentId) || assignmentId <= 0) {
    throw new Error("Cannot save questions without a server Assignment ID.");
  }

  for (const item of questions) {
    const payload = toPayload(item);
    if (item.serverQuestionId) {
      const response = await assignmentQuestionService.update(
        assignmentId,
        item.serverQuestionId,
        payload,
      );
      if (!response.data) throw new Error(`Question ${item.id} update returned no data.`);
      mergeResponse(item, response.data);
    } else {
      const response = await assignmentQuestionService.create(
        assignmentId,
        [payload],
        `assignment:${assignmentId}:item:${item.id}`,
      );
      const saved = response.data?.[0];
      if (!saved?.questionId) throw new Error(`Question ${item.id} create returned no ID.`);
      mergeResponse(item, saved);
    }
  }
  return draft;
}
