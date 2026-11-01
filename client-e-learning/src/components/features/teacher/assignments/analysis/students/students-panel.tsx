"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { StudentsFilters, type StudentsFilterState } from "./students-filters";
import { StudentsTable } from "./students-table";

export function StudentsPanel({
  assignmentId,
  initialClassId = null,
  onViewAttempt,
}: {
  assignmentId: number;
  initialClassId?: number | null;
  onViewAttempt: (studentId: number) => void;
}) {
  const t = useTranslations("teacher.analytics");
  const [filters, setFilters] = useState<StudentsFilterState>({
    search: "",
    lifecycleStatus: "ALL",
    deadlineState: "ALL",
    classId: initialClassId,
  });
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: QUERY_KEYS.teacherAssignmentAnalysisStudents(assignmentId, {
      ...filters,
      page,
    }),
    queryFn: () =>
      assignmentAnalysisService.getStudents(assignmentId, {
        page,
        size: 20,
        search: filters.search || undefined,
        lifecycleStatus: filters.lifecycleStatus,
        deadlineState: filters.deadlineState,
        classId: filters.classId,
      }),
  });

  const classes = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of query.data?.items ?? []) {
      map.set(row.classId, row.className);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [query.data]);

  return (
    <div className="space-y-4">
      <StudentsFilters
        value={filters}
        onChange={(next) => {
          setPage(1);
          setFilters(next);
        }}
        classes={classes}
      />
      {query.isLoading ? (
        <SkeletonTable rows={6} columns={6} />
      ) : query.isError ? (
        <RegionState
          variant="error"
          title={t("loadError")}
          action={
            <button type="button" className="text-sm text-primary" onClick={() => query.refetch()}>
              {t("retry")}
            </button>
          }
        />
      ) : !query.data?.items.length ? (
        <RegionState variant="empty" title={t("students.empty")} />
      ) : (
        <>
          <StudentsTable rows={query.data.items} onViewAttempt={onViewAttempt} />
          {query.data.totalPages > 1 ? (
            <div className="flex items-center justify-end gap-2 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded border px-2 py-1 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("prev")}
              </button>
              <span>
                {page} / {query.data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= query.data.totalPages}
                className="rounded border px-2 py-1 disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
              >
                {t("next")}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
