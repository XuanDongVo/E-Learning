"use client";

import { useTranslations } from "next-intl";

import type { ReactNode } from "react";
import { Check, Lightbulb, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivitySessionQuestion } from "@/types/student/activity-session";
import { QuestionStageView } from "../question-stage-view";
import { GuidedProgress } from "../question-stage/guided-progress";
import { QuestionActions } from "../question-stage/question-actions";
import type { GuidedStep, GuidedStepReview } from "./guided-stage-types";

export function GuidedStepStage({
  guided,
  step,
  draft,
  hint,
  error,
  review,
  resultFeedback,
  pending,
  hintPending,
  onDraftChange,
  onSubmit,
  onUseHint,
  onDismissReview,
}: {
  guided: NonNullable<ActivitySessionQuestion["guided"]>;
  step: GuidedStep;
  draft: string[];
  hint?: string;
  error?: string;
  review?: GuidedStepReview;
  resultFeedback?: ReactNode;
  pending: boolean;
  hintPending: boolean;
  onDraftChange: (next: string[]) => void;
  onSubmit: () => void;
  onUseHint: () => void;
  onDismissReview: () => void;
}) {
  const t = useTranslations("student.activities.runtime.guided");
  return (
    <QuestionStageView
      key={`guided:${step.stepKey}:${review ? "review" : "answer"}`}
      type={step.type}
      prompt={step.prompt}
      options={step.options}
      draft={review ? [review.answer] : draft}
      disabled={pending || Boolean(review)}
      inputLabel={t("stepInput")}
      inputPlaceholder={t("stepPlaceholder")}
      onDraftChange={onDraftChange}
      guidedProgress={
        <GuidedProgress
          intro={guided.introContent}
          position={step.position}
          total={step.totalSteps}
        />
      }
      feedback={
        <>
          {resultFeedback}
          {hint && (
            <p className="student-body rounded-xl border border-learning/30 bg-learning-soft px-3 py-2">
              {t("stepHint", { hint })}
            </p>
          )}
          {error && (
            <p role="alert" className="student-body text-destructive">
              {error}
            </p>
          )}
        </>
      }
      actions={
        <QuestionActions>
          {step.hintAvailable && !hint && !review && (
            <Button
              type="button"
              variant="outline"
              onClick={onUseHint}
              disabled={hintPending}
            >
              <Lightbulb size={16} /> {t("hint")}
            </Button>
          )}
          {review ? (
            <Button type="button" onClick={onDismissReview}>
              {review.feedback.retryAvailable ? (
                <RefreshCw size={16} />
              ) : (
                <Check size={16} />
              )}
              {review.feedback.retryAvailable ? t("retry") : t("continue")}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!(draft[0] ?? "").trim() || pending}
            >
              <Send size={16} /> {t("submitStep")}
            </Button>
          )}
        </QuestionActions>
      }
    />
  );
}
