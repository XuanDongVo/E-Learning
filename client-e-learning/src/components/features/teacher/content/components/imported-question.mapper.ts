import { makeDraftQuestion } from "@/components/features/teacher/question-authoring/question-draft";
import type { CreateQuestionRequest } from "@/types/content";
import type { DraftQuestion, QuestionType } from "@/types/question";
import type { ValidImportedQuestion } from "@/types/question-import";

const CSV_TYPES: ReadonlySet<QuestionType> = new Set([
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_IN_BLANK",
  "TYPE_ANSWER",
]);

function mapOne(question: CreateQuestionRequest): DraftQuestion {
  if (!CSV_TYPES.has(question.type)) {
    throw new Error("CSV contains a question type not supported by Question Bank.");
  }
  if (typeof question.content !== "string" || !question.content.trim()) {
    throw new Error("CSV validation returned an empty question.");
  }

  const isChoice = question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE";
  const options = isChoice
    ? (question.options ?? []).map((option, index) => ({
        id: String.fromCharCode(65 + index),
        text: option.content,
      }))
    : undefined;
  const correctOptionIds = isChoice
    ? (question.options ?? []).flatMap((option, index) =>
        option.isCorrect ? [String.fromCharCode(65 + index)] : [])
    : undefined;
  const trueFalseAnswer = question.answers?.[0]?.rawValue?.toUpperCase() === "FALSE"
    ? "FALSE" as const
    : "TRUE" as const;

  return makeDraftQuestion({
    type: question.type,
    difficulty: question.difficulty ?? "EASY",
    text: question.content,
    explanation: question.explanation ?? "",
    hint: question.hint ?? "",
    ...(options ? { options } : {}),
    ...(correctOptionIds ? { correctOptionIds } : {}),
    trueFalseAnswer,
    acceptedAnswers: question.type === "TYPE_ANSWER" || question.type === "FILL_IN_BLANK"
      ? (question.answers ?? []).map((answer) => answer.rawValue)
      : [""],
    media: [],
  });
}

export function importedQuestionsToDrafts(
  imported: ValidImportedQuestion[],
  bankId: number,
): DraftQuestion[] {
  if (!imported.length) throw new Error("Không có câu hỏi hợp lệ.");
  return imported.map(({ question }) => {
    if (question.questionBankId !== bankId) {
      throw new Error("File import không thuộc Question Bank hiện tại.");
    }
    return mapOne(question);
  });
}
