import { assignmentQuestionService } from "./assignment.question.service";
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
      definition: {
        textInput: {
          prefix: content.prefix?.trim() || "",
          cue: content.cue?.trim() || "",
        },
      },
    };
  }
  if (content.type === "MATCHING") {
    const answerById = new Map(content.answers.map((answer) => [answer.id, answer.text.trim()]));
    return {
      ...common,
      type: "MATCHING",
      definition: {
        matching: {
          items: content.items.map((match) => ({ key: match.key, prompt: match.prompt.trim() })),
          answerPool: content.answers.map((answer) => answer.text.trim()),
          expectedPairs: Object.fromEntries(
            content.items
              .filter((match) => match.correctAnswerId && answerById.has(match.correctAnswerId))
              .map((match) => [match.key, answerById.get(match.correctAnswerId!)!]),
          ),
          shuffleAnswers: content.shuffleAnswers,
        },
      },
    };
  }
  if (content.type === "CLOZE") {
    return {
      ...common,
      type: "CLOZE",
      definition: {
        cloze: {
          segments: content.segments.map((segment) => ({ text: segment.text })),
          blanks: content.blanks.map((blank) => ({
            key: blank.key,
            acceptedAnswers: blank.acceptedAnswers.map((answer) => answer.trim()).filter(Boolean),
          })),
          caseSensitive: content.caseSensitive,
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
