"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { teacherStudentService } from "@/services/teacher/student.service";
import type { StudentActivitySessionItem } from "@/types/teacher/student-learning";
import { formatDateTime } from "@/utils/format";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";
import { RegionState } from "@/components/feedback";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { StatusBadge } from "@/components/ui/status-badge";

export function StudentActivitiesView() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const t = useTranslations("teacher.students.hub");
  const tTable = useTranslations("teacher.students.table");
  const locale = useLocale();
  const [mode, setMode] = useState<"all" | "LEARNING" | "TRY_HARD">("all");
  const [status, setStatus] = useState<"all" | string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const query = useQuery({
    queryKey: ["teacher-student-sessions", studentId, mode, status, page, pageSize],
    queryFn: () =>
      teacherStudentService.listActivitySessions(studentId, {
        mode,
        status,
        page,
        size: pageSize,
      }),
    enabled: Number.isFinite(studentId),
  });
  const pageData = query.data?.data;
  const items = pageData?.items ?? [];

  const columns: DataTableColumn<StudentActivitySessionItem>[] = useMemo(
    () => [
      {
        id: "activity",
        header: t("activities.colActivity"),
        cell: (row) => (
          <div>
            <p className="text-sm font-bold">{row.activityName}</p>
            <p className="text-muted-foreground">{row.unitLabel}</p>
          </div>
        ),
      },
      {
        id: "mode",
        header: t("activities.colMode"),
        cell: (row) => (
          <StatusBadge tone="info" label={t(`sessionMode.${row.mode}`)} />
        ),
      },
      {
        id: "status",
        header: t("activities.colStatus"),
        cell: (row) => (
          <StatusBadge
            status={row.status}
            label={t(`sessionStatus.${row.status}`)}
          />
        ),
      },
      {
        id: "result",
        header: t("activities.colResult"),
        cell: (row) =>
          row.status === "ABANDONED"
            ? "—"
            : t("activities.resultLine", {
                first: row.firstCorrectCount,
                total: row.totalQuestions,
                hints: row.hintUsedCount,
              }),
        className: "text-muted-foreground",
      },
      {
        id: "completed",
        header: t("activities.colCompleted"),
        cell: (row) => formatDateTime(row.completedAt ?? row.startedAt, locale),
        className: "text-muted-foreground",
      },
    ],
    [t, locale],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 rounded-xl border-2 border-ink shadow-pop bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold">{t("activities.title")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("activities.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-md border border-border bg-card px-2 text-sm font-semibold w-36"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as typeof mode);
              setPage(1);
            }}
            aria-label={t("activities.modeAll")}
          >
            <option value="all">{t("activities.modeAll")}</option>
            <option value="LEARNING">{t("sessionMode.LEARNING")}</option>
            <option value="TRY_HARD">{t("sessionMode.TRY_HARD")}</option>
          </select>
          <select
            className="h-9 rounded-md border border-border bg-card px-2 text-sm font-semibold w-36"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label={t("activities.statusAll")}
          >
            <option value="all">{t("activities.statusAll")}</option>
            <option value="COMPLETED">{t("sessionStatus.COMPLETED")}</option>
            <option value="GAME_OVER">{t("sessionStatus.GAME_OVER")}</option>
            <option value="ABANDONED">{t("sessionStatus.ABANDONED")}</option>
            <option value="IN_PROGRESS">{t("sessionStatus.IN_PROGRESS")}</option>
          </select>
        </div>
      </div>

      <DataTable
        data={items}
        columns={columns}
        getRowKey={(row) => row.sessionId}
        isLoading={query.isLoading}
        loadingState={<SkeletonTable columns={6} />}
        errorState={
          query.isError ? (
            <RegionState variant="error" description={t("activities.error")} />
          ) : undefined
        }
        emptyState={<RegionState variant="empty" description={t("activities.empty")} />}
        pagination={
          pageData
            ? {
                page: pageData.page,
                totalPages: Math.max(1, pageData.totalPages),
                totalElements: pageData.totalElements,
                pageSize: pageData.size,
                totalLabel: tTable("totalStudents", { total: pageData.totalElements }),
                showLabel: tTable("show"),
                perPageLabel: tTable("perPage"),
                previousLabel: tTable("previous"),
                nextLabel: tTable("next"),
                onPageChange: setPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setPage(1);
                },
              }
            : undefined
        }
      />
    </div>
  );
}
