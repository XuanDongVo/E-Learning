"use client";

import type { TranslationValues } from "next-intl";
import type { AttemptResultQuestionResponse } from "@/types/student/assignment-attempt";
import { cn } from "@/lib/utils";
import {
  formatAnswerKey,
  formatAnswerPayload,
  formatRichMarkup,
  mapStatus,
  points,
  questionSnapshot,
  snapshotChoices,
  snapshotText,
  STATUS_CONFIG,
  StatusPill,
} from "./result-helpers";

type Translate = (key: string, values?: TranslationValues) => string;

export function ResultQuestionCard({
  question,
  scoreVisible,
  t,
}: {
  question: AttemptResultQuestionResponse;
  scoreVisible: boolean;
  t: Translate;
}) {
  const status = mapStatus(question.status);
  const config = STATUS_CONFIG[status];
  const snapshot = questionSnapshot(question);
  const type = snapshotText(snapshot, "type") ?? "UNKNOWN";
  const prompt = snapshotText(snapshot, "prompt") ?? snapshotText(snapshot, "promptVi");
  const choices = snapshotChoices(snapshot);
  const answer = formatAnswerPayload(question.answerPayload);
  const correct = formatAnswerKey(question.answerKey);
  const typeLabel = t(`paper.types.${type}`, { defaultMessage: type });
  const statusLabel = t(`result.review.status.${status.toLowerCase()}`, { defaultMessage: status });

  return (
    <article
      id={`review-q-${question.position}`}
      className={cn("scroll-mt-24 rounded-lg border border-l-4 bg-card p-4 shadow-sm", config.bar)}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">
            {t("result.review.questionLabel", { number: question.position + 1 })}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {typeLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={status} label={statusLabel} />
          {scoreVisible && question.earnedPoints != null && (
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              {points(question.earnedPoints)} / {points(question.possiblePoints)} {t("result.points")}
            </span>
          )}
        </div>
      </header>

      {prompt && <div className="mt-3 text-sm font-medium leading-relaxed">{formatRichMarkup(prompt)}</div>}

      {choices.length > 0 && (
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {choices.map((choice) => {
            const chosen = answer.includes(choice.key);
            const isCorrect = correct.includes(choice.key);
            return (
              <div
                key={choice.key}
                className={cn(
                  "flex items-center gap-2 rounded-md border p-2 text-sm",
                  isCorrect
                    ? "border-success/50 bg-success/10 font-medium"
                    : chosen
                      ? "border-destructive/40 bg-destructive/10"
                      : "border-border/60 bg-muted/20 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                    chosen ? "bg-foreground text-background" : "border border-border bg-background",
                  )}
                >
                  {choice.key}
                </span>
                <span className="flex-1">{formatRichMarkup(choice.text)}</span>
                {chosen && <span className="text-xs font-semibold">{t("result.review.chosen")}</span>}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <AnswerBlock label={t("result.review.yourAnswer")} values={answer} empty={t("result.review.noAnswer")} />
        <AnswerBlock
          label={t("result.review.correctAnswer")}
          values={correct}
          empty={t("result.review.notAvailable")}
        />
      </div>

      {question.explanation && (
        <div className="mt-3 rounded-md bg-muted/60 p-3 text-sm">
          <div className="font-semibold">{t("result.review.explanation")}</div>
          <div className="mt-1 whitespace-pre-wrap text-muted-foreground">{question.explanation}</div>
        </div>
      )}
    </article>
  );
}

function AnswerBlock({ label, values, empty }: { label: string; values: string[]; empty: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-medium">{values.length > 0 ? values.join(", ") : empty}</div>
    </div>
  );
}
