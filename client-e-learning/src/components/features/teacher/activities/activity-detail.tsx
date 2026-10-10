"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ActivityMode,
  ActivityStatus,
  SelectionStrategy,
} from "@/types/activity";

const modeLabels: Record<ActivityMode, string> = {
  LEARNING: "Practice",
  TRY_HARD: "Try Hard",
  BOTH: "Both",
};
const modeHints: Record<ActivityMode, string> = {
  LEARNING: "Students practice with no timer and no lives.",
  TRY_HARD: "Students race the clock and can lose lives.",
  BOTH: "Students choose Learning or Try Hard.",
};
const difficultyLabels = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard", MIXED: "Mixed" } as const;
const strategyLabels: Record<SelectionStrategy, string> = {
  RANDOM: "Random",
  WEAKNESS_PRIORITY: "Weakness priority",
};

const btnBase =
  "inline-flex h-10 items-center justify-center rounded-lg px-4 text-body font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
const btnOutline = `${btnBase} border border-border-input bg-card-bg hover:bg-background-app`;
const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:opacity-90`;

export function ActivityDetail({ activityId }: { activityId: number }) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEYS.activity(activityId),
    queryFn: async () => (await activityService.get(activityId)).data,
  });
  const status = useMutation({
    mutationFn: (value: ActivityStatus) =>
      activityService.updateStatus(activityId, value),
    onSuccess: async (r) => {
      if (!r.data) return;
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.activity(activityId) });
      await qc.invalidateQueries({
        queryKey: QUERY_KEYS.activities(r.data.unitId, false),
      });
    },
  });

  if (query.isLoading)
    return (
      <section className="mx-auto max-w-6xl rounded-xl border border-border-color bg-card-bg p-6 text-body text-neutral-muted">
        Loading activity…
      </section>
    );
  if (query.isError || !query.data)
    return (
      <section className="mx-auto max-w-6xl rounded-xl border border-danger-light bg-danger-light p-6 text-body text-danger-text">
        Could not load this Activity.
      </section>
    );

  const a = query.data;
  const isArchived = a.status === "ARCHIVED";
  const readyTotal = a.banks.reduce((s, b) => s + b.readyQuestions, 0);
  const allocatedTotal = a.banks.reduce((s, b) => s + b.allocatedQuestions, 0);
  const coverage =
    allocatedTotal > 0
      ? Math.min(100, Math.round((readyTotal / allocatedTotal) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ───────── Header ───────── */}
      <header className="space-y-4">
        <nav
          className="text-body-sm text-neutral-muted"
          aria-label="Breadcrumb"
        >
          <Link
            href="/teacher/activities"
            className="hover:text-primary hover:underline"
          >
            Activities
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span aria-current="page">{a.name}</span>
        </nav>

        <div className="rounded-xl border border-border-color bg-card-bg p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="text-page-title font-extrabold">{a.name}</h1>
                <Status status={a.status} />
                {!isArchived && <Readiness ready={a.readiness.ready} />}
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip>{a.unitCode}</Chip>
                <Chip>{a.unitName}</Chip>
                <Chip>{/^grade/i.test(a.gradeName) ? a.gradeName : `Grade ${a.gradeName}`}</Chip>
              </div>

              {a.description && (
                <p className="max-w-prose text-body text-neutral-muted">
                  {a.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {isArchived ? (
                <button
                  onClick={() => status.mutate("DRAFT")}
                  disabled={status.isPending}
                  className={btnOutline}
                >
                  Restore
                </button>
              ) : (
                <>
                  <Link
                    href={`/teacher/activities/${a.id}/edit`}
                    className={btnOutline}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => status.mutate("ARCHIVED")}
                    disabled={status.isPending}
                    className={btnOutline}
                  >
                    Archive
                  </button>
                  {a.status !== "PUBLISHED" && (
                    <button
                      onClick={() => status.mutate("PUBLISHED")}
                      disabled={!a.readiness.ready || status.isPending}
                      title={
                        a.readiness.ready
                          ? undefined
                          : "Fix the publish checks first"
                      }
                      className={btnPrimary}
                    >
                      Publish
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Key numbers */}
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-color bg-border-color md:grid-cols-4">
            <Stat label="Question banks" value={String(a.banks.length)} />
            <Stat
              label="Ready questions"
              value={`${readyTotal}/${allocatedTotal}`}
              hint={allocatedTotal ? `${coverage}% of what's needed` : undefined}
            />
            <Stat label="Mode" value={modeLabels[a.mode]} />
            <Stat label="Difficulty" value={difficultyLabels[a.questionDifficulty]} />
            <Stat
              label="Practice"
              value={a.availableSelectionStrategies
                .map((x) => strategyLabels[x])
                .join(", ")}
            />
          </dl>
        </div>
      </header>

      {/* ───────── Publish checks ───────── */}
      {!a.readiness.ready && !isArchived && (
        <section
          role="alert"
          className="rounded-xl border border-border-color border-l-4 border-l-accent bg-card-bg p-5"
        >
          <h2 className="text-section-title font-bold text-accent-text">
            {a.status === "PUBLISHED"
              ? "This activity is published but needs attention"
              : "Fix these before publishing"}
          </h2>
          <ul className="mt-3 space-y-2">
            {a.readiness.errors.map((e, i) => (
              <li
                key={`${e.code}-${e.questionBankId || i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background-app px-4 py-3 text-body"
              >
                <span>{e.message}</span>
                {e.required !== null && e.available !== null && (
                  <span className="rounded-full bg-card-bg px-2.5 py-0.5 text-body-sm font-semibold tabular-nums text-accent-text">
                    {e.available} of {e.required} ready
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ───────── Body ───────── */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-6">
          {/* Question banks */}
          <section className="overflow-hidden rounded-xl border border-border-color bg-card-bg">
            <div className="flex items-center justify-between border-b border-border-color px-5 py-4">
              <h2 className="text-section-title font-bold">Question Banks</h2>
              <span className="text-body-sm text-neutral-muted">
                {a.banks.length} {a.banks.length === 1 ? "bank" : "banks"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-background-app">
                    <th className="px-5 py-3 text-left text-label font-semibold text-neutral-muted">
                      Question Bank
                    </th>
                    <th className="px-4 py-3 text-left text-label font-semibold text-neutral-muted">
                      Topic
                    </th>
                    <th className="w-56 px-4 py-3 text-left text-label font-semibold text-neutral-muted">
                      Ready questions
                    </th>
                    <th className="px-5 py-3 text-right text-label font-semibold text-neutral-muted">
                      Allocated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {a.banks.map((b) => {
                    const short = b.readyQuestions < b.allocatedQuestions;
                    const pct =
                      b.totalQuestions > 0
                        ? Math.round(
                            (b.readyQuestions / b.totalQuestions) * 100,
                          )
                        : 0;
                    return (
                      <tr
                        key={b.id}
                        className="border-t border-border-color transition-colors hover:bg-background-app/60"
                      >
                        <td className="px-5 py-4">
                          <div className="text-body font-semibold">
                            {b.questionBankName}
                          </div>
                          <div className="text-body-sm text-neutral-muted">
                            {b.sectionName}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-body-sm text-neutral-muted">
                          {b.topicName}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-2 flex-1 overflow-hidden rounded-full bg-background-app"
                              role="progressbar"
                              aria-valuenow={b.readyQuestions}
                              aria-valuemin={0}
                              aria-valuemax={b.totalQuestions}
                              aria-label={`${b.readyQuestions} of ${b.totalQuestions} questions ready`}
                            >
                              <div
                                className={`h-full rounded-full ${short ? "bg-accent" : "bg-success"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span
                              className={`w-12 text-right text-body-sm font-semibold tabular-nums ${short ? "text-accent-text" : ""}`}
                            >
                              {b.readyQuestions}/{b.totalQuestions}
                            </span>
                          </div>
                          {short && (
                            <p className="mt-1 text-body-sm text-accent-text">
                              Needs {b.allocatedQuestions - b.readyQuestions}{" "}
                              more ready
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-body font-semibold tabular-nums">
                          {b.allocatedQuestions}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Student experience */}
          <section className="rounded-xl border border-border-color bg-card-bg p-5">
            <h2 className="text-section-title font-bold">Student experience</h2>
            <p className="mt-1 text-body-sm text-neutral-muted">
              {modeHints[a.mode]}
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Tile label="Mode" value={modeLabels[a.mode]} />
              <Tile
                label="Time limit"
                value={
                  a.mode === "LEARNING"
                    ? "Unlimited"
                    : a.timeLimitSeconds
                      ? `${formatSeconds(a.timeLimitSeconds)} per question`
                      : "Not set"
                }
              />
              <Tile
                label="Lives"
                value={
                  a.mode === "LEARNING"
                    ? "Not used"
                    : String(a.lives ?? "Not set")
                }
              />
              <Tile
                label="Practice options"
                value={a.availableSelectionStrategies
                  .map((x) => strategyLabels[x])
                  .join(", ")}
              />
            </dl>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="self-start lg:sticky lg:top-24">
          <section className="rounded-xl border border-border-color bg-card-bg p-5">
            <h2 className="text-card-title font-semibold">Activity status</h2>
            <ol className="mt-4 space-y-4">
              <TimelineItem
                done
                label="Created"
                value={formatDate(a.createdAt)}
              />
              <TimelineItem
                done={a.updatedAt !== a.createdAt}
                label="Last updated"
                value={formatDate(a.updatedAt)}
              />
              <TimelineItem
                done={!!a.publishedAt}
                label="Published"
                value={
                  a.publishedAt ? formatDate(a.publishedAt) : "Not published"
                }
                last
              />
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ───────── Small components ───────── */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-background-app px-2.5 py-1 text-body-sm text-neutral-muted">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-card-bg px-4 py-3">
      <dt className="text-body-sm text-neutral-muted">{label}</dt>
      <dd className="mt-1 text-card-title font-bold tabular-nums">{value}</dd>
      {hint && <p className="text-body-sm text-neutral-muted">{hint}</p>}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background-app px-4 py-3">
      <dt className="text-body-sm text-neutral-muted">{label}</dt>
      <dd className="mt-0.5 text-body font-semibold">{value}</dd>
    </div>
  );
}

function TimelineItem({
  label,
  value,
  done,
  last,
}: {
  label: string;
  value: string;
  done?: boolean;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-3">
      {!last && (
        <span
          className="absolute left-[5px] top-4 h-[calc(100%+0.5rem)] w-px bg-border-color"
          aria-hidden
        />
      )}
      <span
        className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${done ? "border-success bg-success" : "border-border-input bg-card-bg"}`}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="text-body-sm text-neutral-muted">{label}</div>
        <div className="text-body font-semibold">{value}</div>
      </div>
    </li>
  );
}

function Status({ status }: { status: ActivityStatus }) {
  const label =
    status === "PUBLISHED"
      ? "Published"
      : status === "ARCHIVED"
        ? "Archived"
        : "Draft";
  const dot =
    status === "PUBLISHED"
      ? "bg-success"
      : status === "ARCHIVED"
        ? "bg-border-input"
        : "bg-accent";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-color bg-background-app px-2.5 py-1 text-body-sm font-semibold">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

function Readiness({ ready }: { ready: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border-color px-2.5 py-1 text-body-sm font-semibold ${ready ? "text-success" : "text-accent-text"}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${ready ? "bg-success" : "bg-accent"}`}
        aria-hidden
      />
      {ready ? "Ready" : "Needs attention"}
    </span>
  );
}

function formatSeconds(s: number) {
  return s % 60 === 0 ? `${s / 60} min` : `${s}s`;
}
function formatDate(v: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(v),
  );
}