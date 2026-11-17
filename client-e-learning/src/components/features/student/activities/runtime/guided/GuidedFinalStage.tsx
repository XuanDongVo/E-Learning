"use client";

import type { ReactNode } from "react";
import { Check, Lightbulb, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivitySessionQuestion } from "@/types/student/activity-session";
import { QuestionStageView } from "../question-stage-view";
import { GuidedProgress } from "../question-stage/guided-progress";
import { QuestionActions } from "../question-stage/question-actions";
import {
  isGuidedFinalDraftComplete,
  type GuidedFinalReview,
} from "./guided-stage-types";

export function GuidedFinalStage({
  question,
  draft,
  review,
  resultFeedback,
  hint,
  error,
  pending,
  hintPending,
  onDraftChange,
  onUseHint,
  onDismissReview,
  onSubmit,
}: {
  question: ActivitySessionQuestion;
  draft: string[];
  review?: GuidedFinalReview;
  resultFeedback?: ReactNode;
  hint?: string;
  error?: string;
  pending: boolean;
  hintPending: boolean;
  onDraftChange: (next: string[]) => void;
  onUseHint: () => void;
  onDismissReview: () => void;
  onSubmit: () => void;
}) {
  const guided = question.guided;
  if (!guided) return null;

  return (
    <div className="border-t-2 border-border pt-5">
      <QuestionStageView
        key={`final:${question.id}:${review ? "review" : guided.stage}`}
        type={question.type}
        prompt={question.content}
        options={question.options}
        ordering={question.ordering}
        draft={review?.answer ?? draft}
        disabled={pending || Boolean(review)}
        inputLabel="Đáp án cuối cùng"
        inputPlaceholder="Nhập đáp án"
        onDraftChange={onDraftChange}
        guidedProgress={<GuidedProgress intro={guided.introContent} />}
        feedback={
          <>
            {resultFeedback}
            {hint && (
              <p className="student-body rounded-xl border border-learning/30 bg-learning-soft px-3 py-2">
                Gợi ý Final: {hint}
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
            {question.hasHint && !hint && !review && (
              <Button
                type="button"
                variant="outline"
                onClick={onUseHint}
                disabled={hintPending}
              >
                <Lightbulb size={16} /> Gợi ý Final
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
                onClick={onSubmit}
                disabled={!isGuidedFinalDraftComplete(question, draft) || pending}
              >
                <Send size={16} /> Gửi đáp án
              </Button>
            )}
          </QuestionActions>
        }
      />
    </div>
  );
}
