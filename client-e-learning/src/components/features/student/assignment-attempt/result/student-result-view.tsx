"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttemptResultResponse } from "@/types/student/assignment-attempt";

type ReviewStatus = "CORRECT" | "PARTIAL" | "INCORRECT" | "UNANSWERED";

function mapStatus(status: AttemptResultResponse["questions"][number]["status"]): ReviewStatus {
  if (status === "PARTIALLY_CORRECT") return "PARTIAL";
  if (status === "CORRECT") return "CORRECT";
  if (status === "UNANSWERED") return "UNANSWERED";
  return "INCORRECT";
}

function formatAnswerPayload(payload: Record<string, unknown> | null | undefined): string[] {
  if (!payload) return [];
  if (typeof payload.selectedKey === "string" && payload.selectedKey) {
    return [payload.selectedKey];
  }
  if (Array.isArray(payload.selectedKeys)) {
    return payload.selectedKeys.map(String);
  }
  if (payload.value !== undefined && payload.value !== null && String(payload.value).length > 0) {
    return [String(payload.value)];
  }
  if (payload.values && typeof payload.values === "object") {
    return Object.entries(payload.values as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${v == null ? "" : String(v)}`,
    );
  }
  return [];
}

function formatAnswerKey(answerKey: unknown): string[] {
  if (answerKey == null) return [];
  if (typeof answerKey === "string") return [answerKey];
  if (Array.isArray(answerKey)) return answerKey.map(String);
  if (typeof answerKey === "object") {
    const record = answerKey as Record<string, unknown>;
    if (Array.isArray(record.answers)) {
      return record.answers.map((item) => {
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          return String(row.rawValue ?? row.normalizedValue ?? "");
        }
        return String(item);
      }).filter(Boolean);
    }
    if (Array.isArray(record.options)) {
      return record.options
        .filter((item) => item && typeof item === "object" && (item as { correct?: boolean }).correct)
        .map((item) => String((item as { key?: string }).key ?? ""))
        .filter(Boolean);
    }
  }
  return [];
}

function formatWhen(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function percentDisplay(score: number | null | undefined): string {
  if (score == null || Number.isNaN(Number(score))) return "—";
  const n = Number(score);
  // Server stores 0–1 fraction (scale 4)
  const pct = n <= 1 ? n * 100 : n;
  return `${Math.round(pct * 100) / 100}`;
}

export function StudentResultView({
  result,
  assignmentTitle,
  startedAt,
  loading,
}: {
  result: AttemptResultResponse | null;
  assignmentTitle?: string | null;
  startedAt?: string | null;
  loading?: boolean;
}) {
  const t = useTranslations("student.assignmentAttempt");
  const locale = useLocale();

  const timedOut = result?.status === "TIMED_OUT";
  const finishedAt = result?.timedOutAt ?? result?.submittedAt ?? null;

  const statusText: Record<ReviewStatus, string> = {
    CORRECT: t("result.review.status.correct"),
    PARTIAL: t("result.review.status.partial"),
    INCORRECT: t("result.review.status.incorrect"),
    UNANSWERED: t("result.review.status.unanswered"),
  };

  const statusClass: Record<ReviewStatus, string> = {
    CORRECT: "text-success",
    PARTIAL: "text-warning-foreground",
    INCORRECT: "text-destructive",
    UNANSWERED: "text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          {timedOut ? (
            <Clock className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
          <h1 className="text-xl font-semibold">
            {timedOut ? t("result.timedOutTitle") : t("result.submittedTitle")}
          </h1>
          {result?.late && (
            <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground">
              {t("result.late")}
            </span>
          )}
        </div>

        {assignmentTitle && (
          <p className="mt-1 text-sm text-muted-foreground">{assignmentTitle}</p>
        )}

        {timedOut && (
          <p className="mt-2 text-sm text-muted-foreground">{t("result.timedOutHint")}</p>
        )}

        <div className="mt-5 flex flex-wrap items-end gap-8">
          <div>
            <div className="text-xs text-muted-foreground">{t("result.score")}</div>
            <div className="text-3xl font-bold tabular-nums">
              {result?.scoreVisible ? (result.totalEarnedPoints ?? "—") : "—"}
              <span className="text-lg font-medium text-muted-foreground">
                {" "}/ {result?.totalPossiblePoints ?? "—"}
              </span>
            </div>
            {result && !result.scoreVisible && (
              <p className="mt-1 text-xs text-muted-foreground">{t("result.scoreHidden")}</p>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("result.percent")}</div>
            <div className="text-xl font-semibold tabular-nums">
              {result?.scoreVisible ? percentDisplay(result.percentageScore) : "—"}%
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>
              {t("result.startedAt")}: {formatWhen(startedAt ?? null, locale)}
            </div>
            <div>
              {t("result.finishedAt")}: {formatWhen(finishedAt, locale)}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{t("result.lockedHint")}</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold">{t("result.answersHeading")}</h2>

        {loading && (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("result.loading")}
          </p>
        )}

        {!loading && result && !result.answersVisible && (
          <p className="mt-2 text-sm text-muted-foreground">{t("result.answersHidden")}</p>
        )}

        {!loading && result?.answersVisible && (
          <ol className="mt-3 divide-y">
            {result.questions.map((q) => {
              const status = mapStatus(q.status);
              const yourAnswer = formatAnswerPayload(q.answerPayload);
              const correct = formatAnswerKey(q.answerKey);
              return (
                <li
                  key={q.attemptQuestionId}
                  className="grid grid-cols-[3.5rem_1fr] gap-2 py-2 text-sm"
                >
                  <span className="font-semibold text-primary">
                    {t("result.review.questionLabel", { number: q.position + 1 })}
                  </span>
                  <div>
                    <div className={cn("text-xs font-medium", statusClass[status])}>
                      {statusText[status]}
                    </div>
                    <div>
                      {t("result.review.yourAnswer")}:{" "}
                      {yourAnswer.length ? yourAnswer.join("; ") : "—"}
                    </div>
                    {status !== "CORRECT" && (
                      <div className="text-muted-foreground">
                        {t("result.review.correctAnswer")}:{" "}
                        {correct.length ? correct.join("; ") : "—"}
                      </div>
                    )}
                    {result.scoreVisible && q.earnedPoints != null && (
                      <div className="text-xs text-muted-foreground">
                        {q.earnedPoints} / {q.possiblePoints}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <Button asChild variant="outline">
        <Link href="/student/assignments">{t("backToAssignments")}</Link>
      </Button>
    </div>
  );
}
