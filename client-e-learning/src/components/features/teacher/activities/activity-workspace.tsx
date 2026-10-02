"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, ChevronDown } from "lucide-react";
import { gradeService } from "@/services/grade.service";
import { unitService } from "@/services/content/content.unit.service";
import { activityService } from "@/services/activity.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { ActivityMode, ActivityStatus } from "@/types/activity";
import { ContentToolbar } from "@/components/features/teacher/content/components/content-toolbar";

const modes: Record<ActivityMode, string> = {
  LEARNING: "Learning",
  TRY_HARD: "Try Hard",
  BOTH: "Both",
};

export function ActivityWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const requestedUnitId = Number(params.get("unitId") || 0);
  const [gradeId, setGradeId] = useState<number>();
  const [unitId, setUnitId] = useState(requestedUnitId);
  const [status, setStatus] = useState<"ALL" | ActivityStatus>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const grades = useQuery({
    queryKey: ["grades"],
    queryFn: async () => (await gradeService.list()).data || [],
  });
  const activeGrade = gradeId || grades.data?.[0]?.id;
  const units = useQuery({
    queryKey: QUERY_KEYS.contentUnits(activeGrade || 0),
    queryFn: async () => (await unitService.list(activeGrade!)).data || [],
    enabled: !!activeGrade,
  });

  useEffect(() => {
    if (!units.data?.length) return;
    const requested =
      requestedUnitId > 0 && units.data.some((u) => u.id === requestedUnitId);
    if (requested) {
      setUnitId(requestedUnitId);
      return;
    }
    if (!units.data.some((u) => u.id === unitId)) setUnitId(units.data[0].id);
  }, [requestedUnitId, unitId, units.data]);

  const selectedUnit = units.data?.find((u) => u.id === unitId);
  const includeArchived = status === "ARCHIVED";
  const activities = useQuery({
    queryKey: QUERY_KEYS.activities(selectedUnit?.id || 0, includeArchived),
    queryFn: async () =>
      (await activityService.list(selectedUnit!.id, includeArchived)).data ||
      [],
    enabled: !!selectedUnit,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (activities.data || [])
      .filter((a) => status === "ALL" || a.status === status)
      .filter(
        (a) =>
          !q || `${a.name} ${a.description || ""}`.toLowerCase().includes(q),
      )
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [activities.data, search, status]);
  useEffect(() => setPage(1), [search, status, unitId, pageSize]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const selectUnit = (id: number) => {
    setUnitId(id);
    const q = new URLSearchParams(params.toString());
    q.set("unitId", String(id));
    router.replace(`/teacher/activities?${q.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* <header className="flex flex-col gap-5 border-b border-border-color pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <nav
            className="mb-3 text-body-sm text-neutral-muted"
            aria-label="Breadcrumb"
          >
            Teacher / Activities
          </nav>
          <h1 className="text-page-title font-extrabold">Activities</h1>
          <p className="mt-2 text-body text-neutral-muted">
            Manage repeatable learning activities for a Unit.
          </p>
        </div>
        {selectedUnit && (
          <Link
            href={`/teacher/activities/new?unitId=${selectedUnit.id}`}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-body font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Create activity
          </Link>
        )}
      </header> */}

      <ContentToolbar
        title="Content"
        description="Manage your learning content organized by grades and units."
        action="Create Unit"
        // onAction={openCreate}
      >
        {/* Search */}
        <div className="flex h-9 w-full items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400 sm:w-[220px]">
          <Search size={14} />

          <input
            className="w-full border-0 text-body-sm text-slate-700 outline-none"
            // value={query}
            // onChange={(event) => setQuery(event.target.value)}
            placeholder="Search units..."
          />
        </div>

        {/* Mobile Grade Select */}
        <div className="relative w-full sm:w-auto">
          <select
            className="
              h-10 w-full appearance-none rounded-xl
              border border-slate-200 bg-white
              pl-3.5 pr-9
              text-body-sm font-medium text-slate-600
              outline-none
              transition-colors
              hover:border-slate-300
              focus:border-primary
              focus:ring-2 focus:ring-primary/10
              sm:w-[140px]
            "
            // value={selectedGradeId ?? ""}
            // onChange={(event) => {
            //   setGradeId(Number(event.target.value));
            // }}
          >
            {/* {grades.data?.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))} */}
          </select>

          <ChevronDown
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </ContentToolbar>

      <section className="border-b border-border-color pb-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="text-card-title font-bold">Find an activity</h2>
            <p className="mt-1 text-body-sm text-neutral-muted">
              Filter activities by unit, status or name.
            </p>
          </div>
          {selectedUnit && (
            <span className="text-body-sm text-neutral-muted">
              Current unit: <strong className="font-semibold text-neutral-dark">{selectedUnit.code}</strong>
            </span>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-2 block text-label font-semibold text-neutral-muted">
              Grade
            </span>
            <select
              value={activeGrade || ""}
              onChange={(e) => {
                setGradeId(Number(e.target.value));
                setUnitId(0);
              }}
              className="h-10 w-full rounded-lg border border-border-input bg-card-bg px-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <option value="">Select grade</option>
              {(grades.data || []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-label font-semibold text-neutral-muted">
              Unit
            </span>
            <select
              value={selectedUnit?.id || ""}
              onChange={(e) => selectUnit(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border-input bg-card-bg px-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <option value="">Select unit</option>
              {(units.data || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code} · {u.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-label font-semibold text-neutral-muted">
              Status
            </span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "ALL" | ActivityStatus)
              }
              className="h-10 w-full rounded-lg border border-border-input bg-card-bg px-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-label font-semibold text-neutral-muted">
              Search
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities"
                className="h-10 w-full rounded-lg border border-border-input bg-card-bg pl-9 pr-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
          </label>
        </div>
      </section>

      {!selectedUnit ? (
        <section className="border border-border-color bg-card-bg p-10 text-center text-body text-neutral-muted">
          Select a Unit to view activities.
        </section>
      ) : activities.isLoading ? (
        <section className="border border-border-color bg-card-bg p-6 text-body text-neutral-muted">
          Loading activities…
        </section>
      ) : activities.isError ? (
        <section className="border border-danger-light bg-danger-light p-6 text-body text-danger-text">
          Could not load activities. Try again.
        </section>
      ) : visible.length === 0 ? (
        <section className="border border-border-color bg-card-bg p-10 text-center">
          <p className="text-section-title font-semibold">
            No activities found
          </p>
          <p className="mt-2 text-body text-neutral-muted">
            Create the first activity for {selectedUnit.code} or change the
            filters.
          </p>
          <Link
            href={`/teacher/activities/new?unitId=${selectedUnit.id}`}
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-body font-semibold text-primary-foreground"
          >
            Create activity
          </Link>
        </section>
      ) : (
        <section className="border border-border-color bg-card-bg">
          <div className="flex flex-col gap-1 border-b border-border-color px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2 className="text-card-title font-bold">Activity list</h2>
              <p className="mt-1 text-body-sm text-neutral-muted">
                {selectedUnit?.code} activities, sorted by most recently updated.
              </p>
            </div>
            <span className="text-body-sm text-neutral-muted">
              {filtered.length} {filtered.length === 1 ? "activity" : "activities"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-border-color bg-background-app">
                {["Activity", "Questions", "Sources", "Mode", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-label font-semibold text-neutral-muted"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border-color last:border-0 hover:bg-background-app"
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/teacher/activities/${a.id}`}
                      className="block"
                    >
                      <span className="block truncate text-card-title font-semibold">
                        {a.name}
                      </span>
                      <span className="mt-1 block max-w-prose truncate text-body-sm text-neutral-muted">
                        {a.description || "No description"}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-body tabular-nums">
                    {a.totalQuestions}
                  </td>
                  <td className="px-4 py-3.5 text-body tabular-nums text-neutral-muted">
                    {a.banks.length}
                  </td>
                  <td className="px-4 py-3.5 text-body text-neutral-muted">
                    {modes[a.mode]}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-body-sm font-semibold ${a.status === "PUBLISHED" ? "text-success" : "bg-background-app text-neutral-muted"}`}
                      >
                        {a.status === "PUBLISHED"
                          ? "Published"
                          : a.status === "ARCHIVED"
                            ? "Archived"
                            : "Draft"}
                      </span>
                      {a.status !== "ARCHIVED" && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-body-sm font-semibold ${a.readiness.ready ? "bg-success-light text-success" : "text-accent-text"}`}
                        >
                          {a.readiness.ready ? "Ready" : "Needs attention"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </section>
      )}

      {visible.length > 0 && (
        <footer className="flex flex-col gap-3 text-body-sm text-neutral-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              Rows
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-8 rounded-lg border border-border-input bg-card-bg px-2"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 rounded-lg border border-border-color px-3 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page}/{pageCount}
            </span>
            <button
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-lg border border-border-color px-3 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
