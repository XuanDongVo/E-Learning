import type { DraftQuestion } from "@/types/question";

export function isQuestionComplete(question: DraftQuestion): boolean {
  if (!question.text.trim()) return false;

  if (
    question.type === "SINGLE_CHOICE" ||
    question.type === "MULTIPLE_CHOICE"
  ) {
    const filled = question.options.every(
      (option) => option.text.trim().length > 0,
    );
    const correctCount = question.correctOptionIds.filter((id) =>
      question.options.some((option) => option.id === id),
    ).length;

    const hasValidCorrectCount =
      question.type === "SINGLE_CHOICE"
        ? correctCount === 1
        : correctCount > 0;

    return filled && hasValidCorrectCount;
  }

  if (question.type === "FILL_IN_BLANK") {
    if (!question.text.includes("____")) return false;
    return question.acceptedAnswers.some(
      (answer) => answer.trim().length > 0,
    );
  }

  if (question.type === "TYPE_ANSWER") {
    return question.acceptedAnswers.some(
      (answer) => answer.trim().length > 0,
    );
  }

  return true;
}
