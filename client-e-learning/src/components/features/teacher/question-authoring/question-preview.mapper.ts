import type { AssignmentQuestion } from "@/types/assignment";
import type { DraftQuestion } from "@/types/question";
import type { QuestionPreviewData } from "@/types/question-preview";
import { isQuestionComplete } from "./question-validator";

export function draftQuestionToPreview(
  question: DraftQuestion,
): QuestionPreviewData {
  return {
    id: question.draftId,
    type: question.type,
    difficulty: question.difficulty,
    text: question.text,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
    })),
    correctOptionIds: [...question.correctOptionIds],
    trueFalseAnswer: question.trueFalseAnswer,
    acceptedAnswers: [...question.acceptedAnswers],
    media: question.media.map((media) => ({
      id: media.id,
      name: media.name,
      kind: media.kind,
      url: media.url,
    })),
    explanation: question.explanation,
    complete: isQuestionComplete(question),
  };
}

export function assignmentQuestionToPreview(
  item: AssignmentQuestion,
): QuestionPreviewData {
  const question = item.question;

  return {
    id: String(question.id),
    type: question.type,
    difficulty: question.difficulty,
    text: question.content,
    options: question.options.map((option) => ({
      id: String(option.id),
      text: option.content,
    })),
    correctOptionIds: question.options
      .filter((option) => option.isCorrect)
      .map((option) => String(option.id)),
    trueFalseAnswer:
      question.answers.find((answer) => answer.rawValue === "FALSE")
        ? "FALSE"
        : "TRUE",
    acceptedAnswers: question.answers.map((answer) => answer.rawValue),
    media: question.media.map((media) => ({
      id: String(media.mediaId),
      name: media.mediaType,
      kind: media.mediaType.toLowerCase().includes("audio")
        ? "audio"
        : "image",
      url: media.url,
    })),
    explanation: question.explanation ?? "",
    complete: question.complete || question.is_complete === true,
  };
}
