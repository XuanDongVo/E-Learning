import type { QuestionResponse } from "@/types/content";
import type {
  DraftQuestion,
  QuestionMediaDraft,
  QuestionOptionDraft,
} from "@/types/question";
import { makeDraftQuestion } from "./question-draft";

export function questionResponseToDraft(question: QuestionResponse): DraftQuestion {
  const options: QuestionOptionDraft[] = question.options?.length
    ? question.options.map((option, index) => ({
        id: String.fromCharCode(65 + index),
        text: option.content,
      }))
    : ["A", "B", "C", "D"].map((id) => ({ id, text: "" }));
  const media: QuestionMediaDraft[] = question.media?.map((item) => ({
    id: String(item.mediaId || item.id),
    name: `Media #${item.mediaId || item.id}`,
    kind: item.mediaType?.toLowerCase().includes("audio") ? "audio" : "image",
    url: item.url,
  })) ?? [];

  return makeDraftQuestion({
    draftId: String(question.id),
    type: question.type,
    difficulty: question.difficulty,
    text: question.content,
    options,
    correctOptionIds: question.options?.length
      ? question.options.flatMap((option, index) =>
          option.isCorrect ? [String.fromCharCode(65 + index)] : [],
        )
      : ["A"],
    trueFalseAnswer: question.answers?.[0]?.rawValue === "FALSE" ? "FALSE" : "TRUE",
    acceptedAnswers: question.answers?.length
      ? question.answers.map((answer) => answer.rawValue)
      : [""],
    media,
    explanation: question.explanation ?? "",
    hint: question.hint ?? "",
    orderingDefinition:
      question.type === "ORDERING" && question.definition?.ordering
        ? question.definition.ordering
        : undefined,
  });
}
