"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ActivitySessionQuestion } from "@/types/student/activity-session";
import { GuidedFinalStage } from "./guided/GuidedFinalStage";
import { GuidedStepStage } from "./guided/GuidedStepStage";
import type {
  GuidedFinalReview,
  GuidedStepReview,
} from "./guided/guided-stage-types";

type Props = {
  question: ActivitySessionQuestion;
  draft: string[];
  stepHint?: string;
  stepError?: string;
  finalHint?: string;
  finalError?: string;
  review?: GuidedStepReview;
  finalReview?: GuidedFinalReview;
  resultFeedback?: ReactNode;
  pending: boolean;
  stepHintPending: boolean;
  finalHintPending: boolean;
  onDraftChange: (next: string[]) => void;
  onSubmitStep: () => void;
  onUseStepHint: () => void;
  onUseFinalHint: () => void;
  onDismissReview: () => void;
  onDismissFinalReview: () => void;
  onSubmitFinal: () => void;
};

export function GuidedStage({
  question,
  draft,
  stepHint,
  stepError,
  finalHint,
  finalError,
  review,
  finalReview,
  resultFeedback,
  pending,
  stepHintPending,
  finalHintPending,
  onDraftChange,
  onSubmitStep,
  onUseStepHint,
  onUseFinalHint,
  onDismissReview,
  onDismissFinalReview,
  onSubmitFinal,
}: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const guided = question.guided;

  useEffect(() => {
    if (review || finalReview) return;
    if (guided?.stage !== "STEP_RETRY" && guided?.stage !== "FINAL_RETRY") return;
    const frame = window.requestAnimationFrame(() => {
      const input = areaRef.current?.querySelector<HTMLInputElement>(
        "input:not(:disabled)",
      );
      if (input) {
        input.focus();
        input.select();
      } else {
        areaRef.current?.querySelector<HTMLButtonElement>(
          "button:not(:disabled)",
        )?.focus();
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [review, finalReview, guided?.stage]);

  if (!guided) return null;

  const step = review?.step ?? guided.currentStep;
  const finalVisible =
    !review &&
    (Boolean(finalReview) ||
      guided.stage === "FINAL_PENDING" ||
      guided.stage === "FINAL_RETRY");

  return (
    <div ref={areaRef} className="space-y-5">
      {step && !finalVisible && (
        <GuidedStepStage
          guided={guided}
          step={step}
          draft={draft}
          hint={stepHint}
          error={stepError}
          review={review}
          resultFeedback={resultFeedback}
          pending={pending}
          hintPending={stepHintPending}
          onDraftChange={onDraftChange}
          onSubmit={onSubmitStep}
          onUseHint={onUseStepHint}
          onDismissReview={onDismissReview}
        />
      )}
      {finalVisible && (
        <GuidedFinalStage
          question={question}
          draft={draft}
          review={finalReview}
          resultFeedback={resultFeedback}
          hint={finalHint}
          error={finalError}
          pending={pending}
          hintPending={finalHintPending}
          onDraftChange={onDraftChange}
          onUseHint={onUseFinalHint}
          onDismissReview={onDismissFinalReview}
          onSubmit={onSubmitFinal}
        />
      )}
    </div>
  );
}
