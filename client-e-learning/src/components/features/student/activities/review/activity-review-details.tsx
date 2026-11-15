"use client";

import { CheckCircle2, CircleDashed, History, Lightbulb, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/format";
import type {
  ActivityReviewAttempt,
  ActivityReviewOption,
  ActivityReviewQuestion,
  ActivityReviewStep,
  ActivitySessionReview,
} from "@/types/student/activity-session";

function answerValues(answer: unknown): string[] {
  if (Array.isArray(answer)) return answer.map(String);
  if (answer === null || answer === undefined) return [];
  return [String(answer)];
}

function answerText(
  answer: unknown,
  options: ActivityReviewOption[],
  fallback: string,
) {
  const values = answerValues(answer);
  if (!values.length) return fallback;
  return values
    .map((value) => {
      const option = options.find(
        (candidate) => candidate.key.toLowerCase() === value.toLowerCase(),
      );
      return option ? `${option.key}. ${option.content}` : value;
    })
    .join(", ");
}

function OutcomeIcon({ correct }: { correct?: boolean | null }) {
  return correct === null || correct === undefined ? (
    <CircleDashed className="size-5 text-muted-foreground" aria-hidden="true" />
  ) : correct ? (
    <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
  ) : (
    <XCircle className="size-5 text-destructive" aria-hidden="true" />
  );
}

function AttemptList({
  attempts,
  options,
}: {
  attempts: ActivityReviewAttempt[];
  options: ActivityReviewOption[];
}) {
  const t = useTranslations("student.activities.review");
  const locale = useLocale();
  if (!attempts.length) {
    return <p className="student-body text-muted-foreground">{t("notAnswered")}</p>;
  }
  return (
    <ol className="space-y-2">
      {attempts.map((attempt) => (
        <li
          key={attempt.attemptNumber}
          className="flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
        >
          <OutcomeIcon correct={attempt.correct} />
          <div className="min-w-0 flex-1">
            <p className="student-label">
              {t("attempt", { number: attempt.attemptNumber })}
            </p>
            <p className="student-meta text-muted-foreground">
              {formatDateTime(attempt.submittedAt, locale)}
            </p>
            <p className="student-body break-words">
              {answerText(attempt.submittedAnswer, options, t("notAnswered"))}
            </p>
          </div>
          {attempt.hintUsedBeforeAttempt ? (
            <span className="student-meta inline-flex items-center gap-1 text-warning">
              <Lightbulb className="size-4" aria-hidden="true" />
              {t("usedHint")}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function CorrectAnswer({
  answers,
  options,
  explanation,
}: {
  answers: string[];
  options: ActivityReviewOption[];
  explanation?: string | null;
}) {
  const t = useTranslations("student.activities.review");
  if (!answers.length && !explanation) return null;
  return (
    <div className="rounded-xl border border-success/30 bg-success-soft px-3 py-2.5">
      {answers.length ? (
        <p className="student-body">
          <span className="student-label text-success">{t("correctAnswer")}: </span>
          {answerText(answers, options, "")}
        </p>
      ) : null}
      {explanation ? (
        <p className="student-body mt-1 text-muted-foreground">{explanation}</p>
      ) : null}
    </div>
  );
}

function StepReview({ step }: { step: ActivityReviewStep }) {
  const t = useTranslations("student.activities.review");
  return (
    <li className="border-l-2 border-learning pl-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="student-label">
          {t("step", { number: step.position + 1 })}
        </p>
        <span className={cn(
          "student-meta",
          step.finalCorrect === null || step.finalCorrect === undefined
            ? "text-muted-foreground"
            : step.finalCorrect
              ? "text-success"
              : "text-destructive",
        )}>
          {step.finalCorrect === null || step.finalCorrect === undefined
            ? t("notAnswered")
            : step.finalCorrect
              ? t("correct")
              : t("incorrect")}
        </span>
      </div>
      <p className="student-body mt-1 font-semibold">{step.prompt}</p>
      <div className="mt-3 space-y-2">
        <AttemptList attempts={step.attempts} options={step.options} />
        <CorrectAnswer
          answers={step.correctAnswers}
          options={step.options}
          explanation={step.explanation}
        />
      </div>
    </li>
  );
}

function QuestionReview({ question }: { question: ActivityReviewQuestion }) {
  const t = useTranslations("student.activities.review");
  const historyUnavailable =
    question.finalAnswer.historyState === "LEGACY_UNAVAILABLE";
  return (
    <li>
      <PaperSurface className="p-4 sm:p-5">
        <details open={question.position === 0}>
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30">
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full",
                question.finalCorrect === null || question.finalCorrect === undefined
                  ? "bg-secondary text-muted-foreground"
                  : question.finalCorrect
                    ? "bg-success-soft text-success"
                    : "bg-destructive-soft text-destructive",
              )}
            >
              <OutcomeIcon correct={question.finalCorrect} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="student-card-title block">
                {t("question", { number: question.position + 1 })}
              </span>
              <span className="student-meta block text-muted-foreground">
                {question.deliveryType === "GUIDED_REASONING"
                  ? t("guidedQuestion")
                  : t("classicQuestion")}
              </span>
            </span>
          </summary>

        <div className="mt-4 space-y-5 border-t border-border pt-4">
          {!question.snapshotAvailable ? (
            <p className="student-body rounded-xl border border-warning bg-warning-soft px-3 py-2">
              {t("snapshotUnavailable")}
            </p>
          ) : null}

          {question.guided ? (
            <section aria-label={t("guidedSteps")}>
              {question.guided.introContent ? (
                <p className="student-body mb-4 rounded-xl bg-learning-soft px-3 py-2.5">
                  {question.guided.introContent}
                </p>
              ) : null}
              <h3 className="student-section-title mb-3">{t("guidedSteps")}</h3>
              {question.guided.steps.length ? (
                <ol className="space-y-5">
                  {question.guided.steps.map((step) => (
                    <StepReview key={step.stepKey} step={step} />
                  ))}
                </ol>
              ) : (
                <p className="student-body text-muted-foreground">{t("noStepHistory")}</p>
              )}
            </section>
          ) : null}

          <section aria-label={t("finalQuestion")} className="space-y-3">
            <h3 className="student-section-title">{t("finalQuestion")}</h3>
            <p className="student-body font-semibold">
              {question.prompt ?? t("promptHidden")}
            </p>
            {historyUnavailable ? (
              <div className="flex gap-2 rounded-xl border border-warning bg-warning-soft px-3 py-2.5">
                <History className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
                <p className="student-body">{t("historyUnavailable")}</p>
              </div>
            ) : (
              <AttemptList
                attempts={question.finalAnswer.attempts}
                options={question.options}
              />
            )}
            <CorrectAnswer
              answers={question.finalAnswer.correctAnswers}
              options={question.options}
              explanation={question.finalAnswer.explanation}
            />
          </section>
        </div>
        </details>
      </PaperSurface>
    </li>
  );
}

export function ActivityReviewDetails({ review }: { review: ActivitySessionReview }) {
  const t = useTranslations("student.activities.review");
  if (!review.questions.length) {
    return <p className="student-body text-muted-foreground">{t("empty")}</p>;
  }
  return (
    <ol className="space-y-3">
      {review.questions.map((question) => (
        <QuestionReview key={question.sessionQuestionId} question={question} />
      ))}
    </ol>
  );
}
