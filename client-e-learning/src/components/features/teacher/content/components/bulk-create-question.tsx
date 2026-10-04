"use client";

import { contentService } from "@/services/content.service";
import { QuestionComposer } from "@/components/features/teacher/question-authoring/QuestionComposer";

export function BulkQuestionCreator({
  bankId,
  bankName = "Question Bank",
  onNavigate,
}: {
  bankId: number;
  bankName?: string;
  onNavigate: (view: import("@/types/content").ContentView, bankId: number) => void;
}) {
  return (
    <QuestionComposer
      title={`Create questions for ${bankName}`}
      storageKey={`elearning_question_draft:QUESTION_BANK:${bankId}`}
      onUploadMedia={async (file) => {
        const response = await contentService.uploadQuestionDraftMedia(file);
        if (!response.data) {
          throw new Error("Upload failed — server returned no data.");
        }

        return {
          id: response.data.id,
          url: response.data.url,
        };
      }}
      onSave={async (questions) => {
        const payload = questions.map((question) => ({
          questionBankId: bankId,
          type: question.type,
          difficulty: question.difficulty,
          content: question.text.trim(),
          explanation: question.explanation?.trim() || undefined,
          options:
            question.type === "SINGLE_CHOICE" ||
            question.type === "MULTIPLE_CHOICE"
              ? question.options.map((option) => ({
                  content: option.text.trim(),
                  isCorrect: question.correctOptionIds.includes(option.id),
                }))
              : undefined,
          answers:
            question.type === "TRUE_FALSE"
              ? [{ rawValue: question.trueFalseAnswer }]
              : question.type === "FILL_IN_BLANK" ||
                  question.type === "TYPE_ANSWER"
                ? question.acceptedAnswers.map((answer) => ({
                    rawValue: answer.trim(),
                  }))
                : undefined,
          mediaIds: question.media
            .map((media) => Number(media.id))
            .filter((id) => !Number.isNaN(id)),
        }));

        await contentService.createQuestion(payload as any);
      }}
      successDescription={bankName ? `Saved in ${bankName}.` : undefined}
      onSaveSuccess={() => {
        window.setTimeout(() => {
          onNavigate("bank", bankId);
        }, 1000);
      }}
    />
  );
}
