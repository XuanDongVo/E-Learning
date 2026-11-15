"use client";

import { Check, Lightbulb, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type {
  ActivitySessionQuestion,
  GuidedStepAnswerFeedback,
} from "@/types/student/activity-session";
import { QuestionStageView } from "./question-stage-view";
import { GuidedProgress } from "./question-stage/guided-progress";
import { QuestionActions } from "./question-stage/question-actions";

type GuidedStep = NonNullable<
  NonNullable<ActivitySessionQuestion["guided"]>["currentStep"]
>;

type Props = {
  question: ActivitySessionQuestion;
  draft: string[];
  hint?: string;
  error?: string;
  review?: {
    step: GuidedStep;
    feedback: GuidedStepAnswerFeedback;
    answer: string;
  };
  finalReview?: {
    feedback: { correct: boolean; retryAvailable: boolean };
    answer: string[];
  };
  pending: boolean;
  hintPending: boolean;
  onDraftChange: (next: string[]) => void;
  onSubmitStep: () => void;
  onUseHint: () => void;
  onDismissReview: () => void;
  onDismissFinalReview: () => void;
  onSubmitFinal: () => void;
};

export function GuidedStage({
  question,
  draft,
  hint,
  error,
  review,
  finalReview,
  pending,
  hintPending,
  onDraftChange,
  onSubmitStep,
  onUseHint,
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
          "button[aria-pressed]:not(:disabled)",
        )?.focus();
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [review, finalReview, guided?.stage]);

  if (!guided) return null;

  // The backend may already be on the next step. Keep the original question
  // and the submitted answer in view while PracticeWorkspace shows feedback.
  const step = review?.step ?? guided.currentStep;
  const finalVisible =
    !review &&
    (Boolean(finalReview) ||
      guided.stage === "FINAL_PENDING" ||
      guided.stage === "FINAL_RETRY");

  return (
    <div ref={areaRef} className="space-y-5">
      {step && !finalVisible && (
        <QuestionStageView
          key={`guided:${step.stepKey}:${review ? "review" : "answer"}`}
          type={step.type}
          prompt={step.prompt}
          options={step.options}
          draft={review ? [review.answer] : draft}
          disabled={pending || Boolean(review)}
          inputLabel="Câu trả lời của bạn"
          inputPlaceholder="Nhập câu trả lời"
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
              {hint && (
                <p className="student-body rounded-xl border border-learning/30 bg-learning-soft px-3 py-2">
                  Gợi ý: {hint}
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
                  <Lightbulb size={16} /> Gợi ý
                </Button>
              )}
              {review ? (
                <Button type="button" onClick={onDismissReview}>
                  {review.feedback.retryAvailable ? (
                    <RefreshCw size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  {review.feedback.retryAvailable ? "Thử lại ngay" : "Tiếp tục ngay"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onSubmitStep}
                  disabled={!(draft[0] ?? "").trim() || pending}
                >
                  <Send size={16} /> Gửi câu trả lời
                </Button>
              )}
            </QuestionActions>
          }
        />
      )}
      {finalVisible && (
        <div className="border-t-2 border-border pt-5">
          <QuestionStageView
            key={`final:${question.id}:${finalReview ? "review" : guided.stage}`}
            type={question.type}
            prompt={question.content}
            options={question.options}
            draft={finalReview?.answer ?? draft}
            disabled={pending || Boolean(finalReview)}
            inputLabel="Đáp án cuối cùng"
            inputPlaceholder="Nhập đáp án"
            onDraftChange={onDraftChange}
            guidedProgress={<GuidedProgress intro={guided.introContent} />}
            actions={
              <QuestionActions>
                {finalReview ? (
                  <Button type="button" onClick={onDismissFinalReview}>
                    {finalReview.feedback.retryAvailable ? (
                      <RefreshCw size={16} />
                    ) : (
                      <Check size={16} />
                    )}
                    {finalReview.feedback.retryAvailable
                      ? "Thử lại ngay"
                      : "Tiếp tục ngay"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={onSubmitFinal}
                    disabled={draft.length === 0 || pending}
                  >
                    <Send size={16} /> Gửi đáp án
                  </Button>
                )}
              </QuestionActions>
            }
          />
        </div>
      )}
    </div>
  );
}
