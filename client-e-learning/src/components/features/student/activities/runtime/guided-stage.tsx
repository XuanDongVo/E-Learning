"use client";

import { Check, Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ActivitySessionQuestion,
  GuidedStepAnswerFeedback,
} from "@/types/student/activity-session";

type Props = {
  question: ActivitySessionQuestion;
  draft: string[];
  feedback?: GuidedStepAnswerFeedback;
  finalFeedback?: {
    correct: boolean;
    retryAvailable: boolean;
    answerRevealed: boolean;
    correctAnswer?: string;
    explanation?: string;
  };
  hint?: string;
  error?: string;
  pending: boolean;
  hintPending: boolean;
  onDraftChange: (next: string[]) => void;
  onSubmitStep: () => void;
  onUseHint: () => void;
  onContinue: () => void;
  onSubmitFinal: () => void;
};

const truthOptions = [
  { key: "TRUE", content: "Đúng" },
  { key: "FALSE", content: "Sai" },
];

export function GuidedStage({
  question,
  draft,
  feedback,
  finalFeedback,
  hint,
  error,
  pending,
  hintPending,
  onDraftChange,
  onSubmitStep,
  onUseHint,
  onContinue,
  onSubmitFinal,
}: Props) {
  const guided = question.guided;
  if (!guided) return null;

  const step = guided.currentStep;
  const finalVisible =
    guided.stage === "FINAL_PENDING" || guided.stage === "FINAL_RETRY";
  const stepChoices = step?.type === "SINGLE_CHOICE" || step?.type === "TRUE_FALSE";
  const finalChoices =
    question.type === "SINGLE_CHOICE" ||
    question.type === "MULTIPLE_CHOICE" ||
    question.type === "TRUE_FALSE";
  const finalOptions =
    question.type === "TRUE_FALSE" ? truthOptions : question.options;
  const stageOptions = step?.type === "TRUE_FALSE" ? truthOptions : step?.options ?? [];
  const toggleFinalChoice = (key: string) => {
    onDraftChange(
      question.type === "MULTIPLE_CHOICE"
        ? draft.includes(key)
          ? draft.filter((value) => value !== key)
          : [...draft, key]
        : [key],
    );
  };

  return (
    <div className="space-y-5" aria-live="polite">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="student-meta rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
          Câu {question.position + 1}
        </span>
        <span className="student-meta rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
          Hướng dẫn từng bước
        </span>
      </div>
      {guided.introContent && (
        <p className="student-body text-muted-foreground">
          {guided.introContent}
        </p>
      )}
      {step && !finalVisible && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="student-label">
              Bước {step.position + 1}/{step.totalSteps}
            </p>
            <span className="student-caption text-muted-foreground">
              {step.type === "TRUE_FALSE"
                ? "Đúng hoặc sai"
                : step.type === "SINGLE_CHOICE"
                  ? "Chọn một đáp án"
                  : "Nhập câu trả lời"}
            </span>
          </div>
          <h1 className="student-section-title">{step.prompt}</h1>
          {stepChoices ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {stageOptions.map((option) => (
                <Button
                  key={option.key}
                  type="button"
                  variant="outline"
                  disabled={pending || Boolean(feedback)}
                  aria-pressed={draft.includes(option.key)}
                  onClick={() => onDraftChange([option.key])}
                  className={`student-control h-auto min-h-14 justify-start whitespace-normal text-left ${draft.includes(option.key) ? "border-learning bg-learning-soft" : ""}`}
                >
                  {option.content}
                </Button>
              ))}
            </div>
          ) : (
            <input
              className="student-field"
              value={draft[0] ?? ""}
              disabled={pending || Boolean(feedback)}
              onChange={(event) => onDraftChange([event.target.value])}
              aria-label="Câu trả lời của bạn"
              placeholder="Nhập câu trả lời"
            />
          )}
          {hint && (
            <p className="student-body rounded-xl border border-learning/30 bg-learning-soft px-3 py-2">
              Gợi ý: {hint}
            </p>
          )}
          {feedback && (
            <p className={feedback.correct ? "student-body text-success" : "student-body text-destructive"}>
              {feedback.correct
                ? "Chính xác!"
                : feedback.retryAvailable
                  ? "Chưa đúng, bạn còn một lần thử."
                  : "Đã ghi nhận. Hãy tiếp tục."}
            </p>
          )}
          {error && <p role="alert" className="student-body text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            {step.hintAvailable && !hint && !feedback && (
              <Button type="button" variant="outline" onClick={onUseHint} disabled={hintPending}>
                <Lightbulb size={16} /> Gợi ý
              </Button>
            )}
            {feedback?.stepResolved ? (
              <Button type="button" onClick={onContinue}><Check size={16} /> Tiếp tục</Button>
            ) : (
              <Button
                type="button"
                onClick={onSubmitStep}
                disabled={!(draft[0] ?? "").trim() || pending || Boolean(feedback)}
              >
                <Send size={16} /> Gửi câu trả lời
              </Button>
            )}
          </div>
        </div>
      )}
      {finalVisible && (
        <div className="space-y-4 border-t-2 border-border pt-5">
          <p className="student-label">Câu hỏi chính</p>
          <h1 className="student-section-title">{question.content}</h1>
          {finalChoices ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {finalOptions.map((option) => (
                <Button
                  key={option.key}
                  type="button"
                  variant="outline"
                  disabled={pending}
                  aria-pressed={draft.includes(option.key)}
                  onClick={() => toggleFinalChoice(option.key)}
                  className={`student-control h-auto min-h-14 justify-start whitespace-normal text-left ${draft.includes(option.key) ? "border-learning bg-learning-soft" : ""}`}
                >
                  {option.content}
                </Button>
              ))}
            </div>
          ) : (
            <input
              className="student-field"
              value={draft[0] ?? ""}
              disabled={pending}
              onChange={(event) => onDraftChange([event.target.value])}
              aria-label="Đáp án cuối cùng"
              placeholder="Nhập đáp án"
            />
          )}
          {finalFeedback && (
            <p
              className={
                finalFeedback.correct
                  ? "student-body text-success"
                  : finalFeedback.retryAvailable
                    ? "student-body text-warning"
                    : "student-body text-destructive"
              }
            >
              {finalFeedback.correct
                ? "Chính xác!"
                : finalFeedback.retryAvailable
                  ? "Chưa đúng, bạn còn một lần thử."
                  : "Câu trả lời đã được ghi nhận."}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="button" onClick={onSubmitFinal} disabled={draft.length === 0 || pending}>
              <Send size={16} /> Gửi đáp án
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
