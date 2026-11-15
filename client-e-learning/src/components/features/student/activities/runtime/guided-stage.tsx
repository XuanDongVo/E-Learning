"use client";

import { Check, Lightbulb, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type {
  ActivitySessionQuestion,
  GuidedStepAnswerFeedback,
} from "@/types/student/activity-session";
import { QuestionStageView } from "./question-stage-view";
import { AnswerFeedback } from "./question-stage/answer-feedback";
import { GuidedProgress } from "./question-stage/guided-progress";
import { QuestionActions } from "./question-stage/question-actions";

type FinalFeedback = {
  correct: boolean;
  retryAvailable: boolean;
  answerRevealed: boolean;
  correctAnswer?: string;
  explanation?: string;
};

type Props = {
  question: ActivitySessionQuestion;
  draft: string[];
  feedback?: GuidedStepAnswerFeedback;
  finalFeedback?: FinalFeedback;
  hint?: string;
  error?: string;
  review?: {
    step: NonNullable<NonNullable<ActivitySessionQuestion["guided"]>["currentStep"]>;
    feedback: GuidedStepAnswerFeedback;
  };
  finalReview?: { feedback: FinalFeedback };
  onDismissReview: () => void;
  onDismissFinalReview: () => void;
  pending: boolean;
  hintPending: boolean;
  onDraftChange: (next: string[]) => void;
  onSubmitStep: () => void;
  onUseHint: () => void;
  onContinue: () => void;
  onRetryStep: () => void;
  onRetryFinal: () => void;
  onSubmitFinal: () => void;
};

export function GuidedStage(props: Props) {
  const { question, draft, hint, error, pending } = props;
  const areaRef = useRef<HTMLDivElement>(null);
  const guided = question.guided;
  const review = props.review;
  const finalReview = props.finalReview;
  const feedback = review?.feedback ?? props.feedback;
  const finalFeedback = finalReview?.feedback ?? props.finalFeedback;

  useEffect(() => {
    if (review || finalReview) return;
    if (guided?.stage !== "STEP_RETRY" && guided?.stage !== "FINAL_RETRY") return;
    const id = window.requestAnimationFrame(() => {
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
    return () => window.cancelAnimationFrame(id);
  }, [review, finalReview, guided?.stage]);

  if (!guided) return null;

  // Server advances immediately; keep showing the answered step until the
  // feedback dwell finishes so the learner can actually read the result.
  const step = review?.step ?? guided.currentStep;
  const finalVisible = !review && (Boolean(finalReview) ||
    guided.stage === "FINAL_PENDING" || guided.stage === "FINAL_RETRY");
  const resolved = !review && !finalReview && guided.stage === "QUESTION_RESOLVED";
  const stepFeedback = feedback ? (
    <AnswerFeedback
      tone={
        feedback.correct
          ? "correct"
          : feedback.retryAvailable
            ? "retry"
            : "incorrect"
      }
    >
      {feedback.correct
        ? "Chính xác!"
        : feedback.retryAvailable
          ? "Chưa đúng, bạn còn một lần thử."
          : "Đã ghi nhận. Hãy tiếp tục."}
    </AnswerFeedback>
  ) : null;
  const finalResult = finalFeedback ? (
    <AnswerFeedback
      tone={
        finalFeedback.correct
          ? "correct"
          : finalFeedback.retryAvailable
            ? "retry"
            : "incorrect"
      }
    >
      {finalFeedback.correct
        ? "Chính xác!"
        : finalFeedback.retryAvailable
          ? "Chưa đúng, bạn còn một lần thử."
          : "Câu trả lời đã được ghi nhận."}
    </AnswerFeedback>
  ) : null;

  return (
    <div ref={areaRef} className="space-y-5" aria-live="polite">
      {/* <span className="student-meta rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
        Câu {question.position + 1}
      </span> */}
      {step && !finalVisible ? (
        <QuestionStageView
          key={`guided:${step.stepKey}:${review ? "feedback" : "answer"}`}
          type={step.type}
          prompt={step.prompt}
          options={step.options}
          draft={draft}
          disabled={pending || Boolean(review) || Boolean(feedback)}
          inputLabel="Câu trả lời của bạn"
          inputPlaceholder="Nhập câu trả lời"
          onDraftChange={props.onDraftChange}
          guidedProgress={
            <GuidedProgress
              intro={guided.introContent}
              position={step.position}
              total={step.totalSteps}
            />
          }
          feedback={
            <>
              {hint ? (
                <p className="student-body rounded-xl border border-learning/30 bg-learning-soft px-3 py-2">
                  Gợi ý: {hint}
                </p>
              ) : null}
              {stepFeedback}
              {error ? (
                <p role="alert" className="student-body text-destructive">
                  {error}
                </p>
              ) : null}
            </>
          }
          actions={
            <QuestionActions>
              {step.hintAvailable && !hint && !feedback ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={props.onUseHint}
                  disabled={props.hintPending}
                >
                  <Lightbulb size={16} /> Gợi ý
                </Button>
              ) : null}
              {review ? (
                <Button type="button" onClick={props.onDismissReview}>
                  {feedback?.retryAvailable ? <RefreshCw size={16} /> : <Check size={16} />}
                  {feedback?.retryAvailable ? "Thử lại ngay" : "Tiếp tục ngay"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={props.onSubmitStep}
                  disabled={
                    !(draft[0] ?? "").trim() || pending || Boolean(feedback)
                  }
                >
                  <Send size={16} /> Gửi câu trả lời
                </Button>
              )}
            </QuestionActions>
          }
        />
      ) : null}
      {finalVisible ? (
        <div className="border-t-2 border-border pt-5">
          <QuestionStageView
            key={`final:${question.id}:${finalReview ? "feedback" : guided.stage}`}
            type={question.type}
            prompt={question.content}
            options={question.options}
            draft={draft}
            disabled={pending || Boolean(finalReview) || Boolean(finalFeedback)}
            inputLabel="Đáp án cuối cùng"
            inputPlaceholder="Nhập đáp án"
            onDraftChange={props.onDraftChange}
            guidedProgress={<GuidedProgress intro={guided.introContent} />}
            feedback={finalResult}
            actions={
              <QuestionActions>
                {finalReview ? (
                  <Button type="button" onClick={props.onDismissFinalReview}>
                    {finalFeedback?.retryAvailable ? <RefreshCw size={16} /> : <Check size={16} />}
                    {finalFeedback?.retryAvailable ? "Thử lại ngay" : "Tiếp tục ngay"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={props.onSubmitFinal}
                    disabled={
                      draft.length === 0 || pending || Boolean(finalFeedback)
                    }
                  >
                    <Send size={16} /> Gửi đáp án
                  </Button>
                )}
              </QuestionActions>
            }
          />
        </div>
      ) : null}
      {resolved ? (
        <AnswerFeedback tone={question.finalCorrect ? "correct" : "incorrect"}>
          {question.finalCorrect
            ? "Câu hỏi này đã được hoàn thành chính xác."
            : "Câu hỏi này đã được hoàn thành."}
        </AnswerFeedback>
      ) : null}
    </div>
  );
}
