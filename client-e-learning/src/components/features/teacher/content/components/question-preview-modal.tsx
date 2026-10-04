"use client";

import type { DraftQuestion } from "@/types/question";
import { QuestionPreviewModal as SharedQuestionPreviewModal } from "@/components/features/teacher/question-authoring/QuestionPreviewModal";

export function QuestionPreviewModal({
  bankName,
  questions,
  initialIndex = 0,
  onClose,
}: {
  bankName: string;
  questions: DraftQuestion[];
  initialIndex?: number;
  onClose: () => void;
}) {
  return (
    <SharedQuestionPreviewModal
      title={bankName}
      questions={questions}
      initialIndex={initialIndex}
      onClose={onClose}
    />
  );
}
