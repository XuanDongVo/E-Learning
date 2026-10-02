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
  LEARNING: "Learning",
  TRY_HARD: "Try Hard",
  BOTH: "Both",
};
const strategyLabels: Record<SelectionStrategy, string> = {
  RANDOM: "Random",
  WEAKNESS_PRIORITY: "Weakness priority",
};

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
      <section className="border border-border-color bg-card-bg p-6 text-body text-neutral-muted">
        Loading activity…
      </section>
    );
  if (query.isError || !query.data)
    return (
      <section className="border border-danger-light bg-danger-light p-6 text-body text-danger-text">
        Could not load this Activity.
      </section>
    );
  const a = query.data;
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <nav
          className="mb-3 text-body-sm text-neutral-muted"
          aria-label="Breadcrumb"
        >
          <Link href="/teacher/activities">Activities</Link>
          <span className="mx-2">/</span>
          <span>{a.name}</span>
        </nav>
        <div className="flex flex-col gap-4 border-b border-border-color pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-page-title font-extrabold">{a.name}</h1>
              <Status status={a.status} />
              {a.status !== "ARCHIVED" && (
                <Readiness ready={a.readiness.ready} />
              )}
            </div>
            <p className="mt-2 text-body text-neutral-muted">
              {a.unitCode} · {a.unitName} · Grade {a.gradeName}
            </p>
            {a.description && (
              <p className="mt-3 max-w-prose text-body">{a.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {a.status === "ARCHIVED" ? (
              <button
                onClick={() => status.mutate("DRAFT")}
                disabled={status.isPending}
                className="h-10 rounded-lg border border-border-input px-4 text-body font-semibold"
              >
                Restore
              </button>
            ) : (
              <>
                <Link
                  href={`/teacher/activities/${a.id}/edit`}
                  className="inline-flex h-10 items-center rounded-lg border border-border-input px-4 text-body font-semibold"
                >
                  Edit
                </Link>
                <button
                  onClick={() => status.mutate("ARCHIVED")}
                  disabled={status.isPending}
                  className="h-10 rounded-lg border border-border-input px-4 text-body font-semibold"
                >
                  Archive
                </button>
                {a.status !== "PUBLISHED" && (
                  <button
                    onClick={() => status.mutate("PUBLISHED")}
                    disabled={!a.readiness.ready || status.isPending}
                    className="h-10 rounded-lg bg-primary px-4 text-body font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    Publish
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {!a.readiness.ready && a.status !== "ARCHIVED" && (
        <section className="border-l-2 border-accent bg-background-app p-4">
          <h2 className="text-section-title font-bold text-accent-text">
            Publish checks
          </h2>
          <div className="mt-3 space-y-2">
            {a.readiness.errors.map((e, i) => (
              <div
                key={`${e.code}-${e.questionBankId || i}`}
                className="border border-border-color bg-card-bg p-3 text-body"
              >
                {e.message}
                {e.required !== null && e.available !== null && (
                  <span className="ml-2 text-body-sm text-neutral-muted">
                    required {e.required} · ready {e.available}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-6">
          <section className="border-b border-border-color pb-6">
            <div className="border-b border-border-color px-5 py-4">
              <h2 className="text-section-title font-bold">Question Banks</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-border-color bg-background-app">
                    <th className="px-5 py-3 text-left text-label text-neutral-muted">
                      Question Bank
                    </th>
                    <th className="px-4 py-3 text-left text-label text-neutral-muted">
                      Topic
                    </th>
                    <th className="px-4 py-3 text-right text-label text-neutral-muted">
                      Ready
                    </th>
                    <th className="px-4 py-3 text-right text-label text-neutral-muted">
                      Allocated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {a.banks.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border-color last:border-0"
                    >
                      <td className="px-5 py-3.5 text-body font-semibold">
                        {b.questionBankName}
                        <div className="text-body-sm font-normal text-neutral-muted">
                          {b.sectionName}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-body-sm text-neutral-muted">
                        {b.topicName}
                      </td>
                      <td className="px-4 py-3.5 text-right text-body tabular-nums">
                        {b.readyQuestions}/{b.totalQuestions}
                      </td>
                      <td className="px-4 py-3.5 text-right text-body tabular-nums">
                        {b.allocatedQuestions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-t border-border-color pt-6">
            <h2 className="text-section-title font-bold">Student experience</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Row label="Mode" value={modeLabels[a.mode]} />
              <Row
                label="Time limit"
                value={
                  a.mode === "LEARNING"
                    ? "Unlimited"
                    : a.timeLimitSeconds
                      ? formatSeconds(a.timeLimitSeconds) + " for the whole run"
                      : "Not set"
                }
              />
              <Row
                label="Lives"
                value={
                  a.mode === "LEARNING"
                    ? "Not used"
                    : String(a.lives ?? "Not set")
                }
              />
              <Row
                label="Practice options"
                value={a.availableSelectionStrategies
                  .map((x) => strategyLabels[x])
                  .join(", ")}
              />
            </dl>
          </section>
        </main>
        <aside className="self-start lg:sticky lg:top-24">
          <section className="border-t border-border-color pt-6">
            <h2 className="text-card-title font-semibold">Activity status</h2>
            <dl className="mt-4 space-y-3 text-body-sm">
              <Row label="Created" value={formatDate(a.createdAt)} />
              <Row label="Updated" value={formatDate(a.updatedAt)} />
              <Row
                label="Published"
                value={
                  a.publishedAt ? formatDate(a.publishedAt) : "Not published"
                }
              />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-neutral-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
function Status({ status }: { status: ActivityStatus }) {
  return (
    <span className="rounded-full bg-background-app px-2.5 py-1 text-body-sm font-semibold text-neutral-muted">
      {status === "PUBLISHED"
        ? "Published"
        : status === "ARCHIVED"
          ? "Archived"
          : "Draft"}
    </span>
  );
}
function Readiness({ ready }: { ready: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-body-sm font-semibold ${ready ? "text-success" : "text-accent-text"}`}
    >
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
