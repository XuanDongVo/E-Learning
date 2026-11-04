"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, Plus } from "lucide-react";
import { gradeService } from "@/services/grade.service";
import { unitService } from "@/services/content/content.unit.service";
import { activityService } from "@/services/activity.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { ActivityStatus } from "@/types/activity";
import { ActivityTable } from "./activity-table";
import { RegionState } from "@/components/feedback";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { TeacherPageHeader } from "@/components/features/teacher/shared/teacher-page-header";

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

  const selectedUnit =
    units.data?.find((u) => u.id === unitId) ??
    (requestedUnitId > 0
      ? units.data?.find((u) => u.id === requestedUnitId)
      : undefined) ??
    units.data?.[0];
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
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const selectUnit = (id: number) => {
    setUnitId(id);
    setPage(1);
    const q = new URLSearchParams(params.toString());
    q.set("unitId", String(id));
    router.replace(`/teacher/activities?${q.toString()}`);
  };

  const createHref = selectedUnit
    ? `/teacher/activities/new?unitId=${selectedUnit.id}`
    : undefined;

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Activities"
        description="Create and manage learning activities for your units."
        pipoMood="wave"
        pipoSize={100}
      />

      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex h-9 w-full items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400 sm:w-[220px]">
          <Search size={14} />
          <input
            className="w-full border-0 text-body-sm text-slate-700 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search activities..."
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-body-sm font-medium text-slate-600 outline-none transition-colors hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-[140px]"
            value={activeGrade || ""}
            onChange={(e) => {
              setGradeId(Number(e.target.value));
              setUnitId(0);
              setPage(1);
            }}
          >
            <option value="">Select grade</option>
            {(grades.data || []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2 max-sm:w-full max-sm:ml-0">
          {createHref ? (
            <Link
              href={createHref}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-body-sm font-bold text-white shadow-[0_5px_12px_rgba(79,70,229,0.18)] transition-colors hover:bg-primary-hover sm:w-auto"
            >
              <Plus size={15} />
              Create Activity
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-primary/50 px-3 text-body-sm font-bold text-white sm:w-auto"
            >
              <Plus size={15} />
              Create Activity
            </button>
          )}
        </div>
      </div>

      <section className="border-b border-border-color pb-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="hidden lg:block">
            <span className="mb-2 block text-label font-semibold text-neutral-muted">
              Grade
            </span>
            <select
              value={activeGrade || ""}
              onChange={(e) => {
                setGradeId(Number(e.target.value));
                setUnitId(0);
                setPage(1);
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
          <label className="hidden lg:block">
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
              onChange={(e) => {
                setStatus(e.target.value as "ALL" | ActivityStatus);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-border-input bg-card-bg px-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <label className="hidden lg:block">
            <span className="mb-2 block text-label font-semibold text-neutral-muted">
              Search
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-muted" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search activities"
                className="h-10 w-full rounded-lg border border-border-input bg-card-bg pl-9 pr-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
          </label>
        </div>
      </section>

      {!selectedUnit ? (
        <RegionState variant="empty" />
      ) : activities.isLoading ? (
        <SkeletonTable columns={5} />
      ) : activities.isError ? (
        <RegionState variant="error" />
      ) : visible.length === 0 ? (
        <RegionState
          variant="empty"
          action={
            <Link
              href={`/teacher/activities/new?unitId=${selectedUnit.id}`}
              className="inline-flex h-10 items-center rounded-xl border border-primary bg-primary px-4 text-body font-bold text-primary-foreground"
            >
              Create activity
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Activity list
                </h2>
                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "activity" : "activities"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {selectedUnit?.code} activities, sorted by most recently
                updated.
              </p>
            </div>
          </div>

          <ActivityTable
            activities={visible}
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            totalPages={pageCount}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        </section>
      )}
    </div>
  );
}
