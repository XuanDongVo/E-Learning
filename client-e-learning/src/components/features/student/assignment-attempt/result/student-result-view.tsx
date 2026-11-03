"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { AttemptResultResponse } from "@/types/student/assignment-attempt";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDurationRange } from "@/utils/format";
import { ResultQuestionCard } from "./result-question-card";
import {
  FilterType,
  mapStatus,
  percentDisplay,
  points,
  ScoreRing,
  STATUS_CONFIG,
} from "./result-helpers";

export function StudentResultView({
  result,
  assignmentTitle,
  startedAt,
}: {
  result: AttemptResultResponse | null;
  assignmentTitle?: string | null;
  startedAt?: string | null;
}) {
  const t = useTranslations("student.assignmentAttempt");
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const questions = useMemo(() => result?.questions ?? [], [result]);
  const effectiveStartedAt = result?.startedAt ?? startedAt ?? null;
  const finishedAt =
    result?.finishedAt ?? result?.submittedAt ?? result?.timedOutAt ?? null;
  const counts = useMemo(() => {
    const values = { CORRECT: 0, PARTIAL: 0, INCORRECT: 0, UNANSWERED: 0 };
    questions.forEach((question) => values[mapStatus(question.status)]++);
    return values;
  }, [questions]);
  const filteredQuestions =
    activeFilter === "all"
      ? questions
      : questions.filter(
          (question) => mapStatus(question.status) === activeFilter,
        );
  const answeredCount = questions.length - counts.UNANSWERED;
  const title = result?.assignmentTitle ?? assignmentTitle ?? t("result.title");
  const timedOut = result?.status === "TIMED_OUT";

  if (!result) {
    return null;
  }

  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b bg-card px-4 rounded-xl mb-4">
        <Button variant="ghost" size="sm" >
          <Link href="/student/assignments">
            <ArrowLeft className="h-4 w-4" /> Danh sách bài
          </Link>
        </Button>
        <BarChart3 className="  h-4 w-4 text-primary" />
        <h1 className="min-w-0 truncate font-semibold">Kết quả · {title}</h1>
        <div className="ml-auto flex items-center gap-2"></div>
      </header>

      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <ScoreRing
              percent={percentDisplay(result.percentageScore)}
              label={t("result.percent")}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {timedOut ? (
                  <Clock className="h-5 w-5 text-warning" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
                <h1 className="text-xl font-bold">
                  {timedOut
                    ? t("result.timedOutTitle")
                    : t("result.submittedTitle")}
                </h1>
                {result.late && (
                  <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                    {t("result.late")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="mt-3 text-3xl font-extrabold tabular-nums">
                {result.scoreVisible ? (
                  <>
                    {points(result.totalEarnedPoints)}
                    <span className="text-lg font-medium text-muted-foreground">
                      {" "}
                      / {points(result.totalPossiblePoints)}{" "}
                      {t("result.points")}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-normal text-muted-foreground">
                    {t("result.scoreHidden")}
                  </span>
                )}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
                <SummaryItem
                  label={t("result.startedAt")}
                  value={formatDateTime(effectiveStartedAt, locale)}
                />
                <SummaryItem
                  label={t("result.finishedAt")}
                  value={formatDateTime(finishedAt, locale)}
                />
                <SummaryItem
                  label={t("result.duration")}
                  value={formatDurationRange(effectiveStartedAt, finishedAt)}
                />
                <SummaryItem
                  label={t("result.answered")}
                  value={`${answeredCount} / ${questions.length}`}
                />
              </dl>
            </div>
          </div>

          {result.answersVisible && (
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["CORRECT", "PARTIAL", "INCORRECT", "UNANSWERED"] as const).map(
                (status) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const active = activeFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveFilter(active ? "all" : status)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        active ? config.soft : "bg-card hover:bg-muted/50",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.text)} />
                      <div>
                        <div className="text-xl font-bold tabular-nums leading-none">
                          {counts[status]}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {t(`result.review.status.${status.toLowerCase()}`)}
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>{t("result.lockedHint")}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold">
                {t("result.questionDetails")}
              </h2>
              {result.answersVisible && (
                <div className="flex flex-wrap items-center gap-1">
                  <FilterButton
                    active={activeFilter === "all"}
                    onClick={() => setActiveFilter("all")}
                  >
                    {t("result.filters.all")} ({questions.length})
                  </FilterButton>
                  {(
                    ["CORRECT", "PARTIAL", "INCORRECT", "UNANSWERED"] as const
                  ).map((status) => (
                    <FilterButton
                      key={status}
                      active={activeFilter === status}
                      onClick={() => setActiveFilter(status)}
                    >
                      {t(`result.review.status.${status.toLowerCase()}`)} (
                      {counts[status]})
                    </FilterButton>
                  ))}
                </div>
              )}
            </div>

            {!result.answersVisible ? (
              <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                {t("result.answersHidden")}
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                {t("result.filters.empty")}
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <ResultQuestionCard
                  key={question.attemptQuestionId}
                  question={question}
                  scoreVisible={result.scoreVisible}
                  t={t}
                />
              ))
            )}
          </section>

          <aside className="h-fit rounded-lg border bg-card p-4 shadow-sm lg:sticky lg:top-6">
            <h3 className="mb-3 text-sm font-bold">{t("result.navigator")}</h3>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
              {questions.map((question) => {
                const status = mapStatus(question.status);
                return (
                  <button
                    key={question.attemptQuestionId}
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(`review-q-${question.position}`)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className={cn(
                      "grid h-8 place-items-center rounded border text-xs font-semibold transition-colors hover:opacity-80",
                      STATUS_CONFIG[status].cell,
                    )}
                  >
                    {question.position + 1}
                  </button>
                );
              })}
            </div>
            <Button  variant="outline" className="mt-5 w-full">
              <Link href="/student/assignments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToAssignments")}
              </Link>
            </Button>
          </aside>
        </div>
      </div>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
