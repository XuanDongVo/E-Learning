import type {
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from "@/types/content";
import type { DraftQuestion } from "@/types/question";

export function draftQuestionToWriteRequest(
  question: DraftQuestion,
): UpdateQuestionRequest {
  return {
    type: question.type,
    difficulty: question.difficulty,
    content: question.text.trim(),
    explanation: question.explanation?.trim() || undefined,
    hint: question.hint?.trim() || undefined,
    options:
      question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE"
        ? question.options.map((option) => ({
            content: option.text.trim(),
            isCorrect: question.correctOptionIds.includes(option.id),
          }))
        : undefined,
    answers:
      question.type === "TRUE_FALSE"
        ? [{ rawValue: question.trueFalseAnswer }]
        : question.type === "FILL_IN_BLANK" || question.type === "TYPE_ANSWER"
          ? question.acceptedAnswers.map((answer) => ({ rawValue: answer.trim() }))
          : undefined,
    mediaIds: question.media
      .map((media) => Number(media.id))
      .filter((id) => Number.isFinite(id)),
    definition:
      question.type === "ORDERING" && question.orderingDefinition
        ? { ordering: question.orderingDefinition }
        : undefined,
  };
}

export function draftQuestionToCreateRequest(
  question: DraftQuestion,
  questionBankId: number,
): CreateQuestionRequest {
  return { ...draftQuestionToWriteRequest(question), questionBankId };
}
