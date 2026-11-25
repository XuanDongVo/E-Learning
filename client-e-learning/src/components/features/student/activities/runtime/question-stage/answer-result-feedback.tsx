"use client";

import { useTranslations } from "next-intl";
import { Check, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AnswerFeedback = {
  correct: boolean;
  retryAvailable: boolean;
};

type Props = {
  feedback?: AnswerFeedback;
  isGuidedStep?: boolean;
  revealedAnswer?: string;
  answerRevealed?: boolean;
  explanation?: string;
};

export function AnswerResultFeedback({
  feedback,
  isGuidedStep = false,
  revealedAnswer,
  answerRevealed,
  explanation,
}: Props) {
  const t = useTranslations("student.activities.runtime.feedback");
  if (!feedback) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border-2 p-3 sm:gap-3 sm:p-3.5",
        feedback.correct && "border-success bg-success-soft",
        !feedback.correct &&
          feedback.retryAvailable &&
          "border-warning bg-warning-soft",
        !feedback.correct &&
          !feedback.retryAvailable &&
          "border-destructive bg-destructive-soft",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full",
          feedback.correct && "bg-success text-primary-foreground",
          !feedback.correct &&
            feedback.retryAvailable &&
            "bg-warning text-accent-foreground",
          !feedback.correct &&
            !feedback.retryAvailable &&
            "bg-destructive text-destructive-foreground",
        )}
      >
        {feedback.correct ? (
          <Check size={18} />
        ) : feedback.retryAvailable ? (
          <RefreshCw size={18} />
        ) : (
          <X size={18} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "student-card-title !text-sm",
            feedback.correct && "text-success",
            !feedback.correct && feedback.retryAvailable && "text-warning",
            !feedback.correct &&
              !feedback.retryAvailable &&
              "text-destructive",
          )}
        >
          {feedback.correct
            ? t("correct")
            : feedback.retryAvailable
              ? t("retry")
              : t("incorrect")}
        </p>

        <p className="student-body mt-0.5 text-foreground">
          {feedback.correct
            ? isGuidedStep
              ? t("guidedCorrect")
              : t("correctPraise")
            : feedback.retryAvailable
              ? t("retryHint")
              : revealedAnswer
                ? t("correctAnswer", { answer: revealedAnswer })
                : t("reviewHint")}
        </p>

        {answerRevealed && explanation && (
          <div className="mt-2 border-t border-current/15 pt-2">
            <p className="student-label text-muted-foreground">{t("explanation")}</p>
            <p className="student-body mt-1 text-muted-foreground">
              {explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
