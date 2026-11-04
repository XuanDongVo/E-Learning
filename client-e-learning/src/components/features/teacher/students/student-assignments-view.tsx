"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { teacherStudentService } from "@/services/teacher/student.service";
import type {
  StudentAssignmentItem,
  StudentAssignmentStatus,
} from "@/types/teacher/student-learning";
import { formatDateTime, formatScorePercent } from "@/utils/format";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table/data-table";
import { RegionState } from "@/components/feedback";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

const STATUS_FILTERS: Array<"ALL" | StudentAssignmentStatus> = [
  "ALL",
  "SUBMITTED",
  "LATE",
  "TIMED_OUT",
  "IN_PROGRESS",
  "NOT_STARTED",
];

export function StudentAssignmentsView() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const t = useTranslations("teacher.students.hub");
  const tTable = useTranslations("teacher.students.table");
  const locale = useLocale();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const query = useQuery({
    queryKey: [
      "teacher-student-assignments",
      studentId,
      status,
      page,
      pageSize,
    ],
    queryFn: () =>
      teacherStudentService.listAssignments(studentId, {
        status: status === "ALL" ? undefined : status,
        page,
        size: pageSize,
      }),
    enabled: Number.isFinite(studentId),
  });
  const pageData = query.data?.data;
  const items = pageData?.items ?? [];

  const columns: DataTableColumn<StudentAssignmentItem>[] = useMemo(
    () => [
      {
        id: "title",
        header: t("assignments.colTitle"),
        cell: (row) => <span className="font-bold text-sm">{row.title}</span>,
      },
      {
        id: "due",
        header: t("assignments.colDue"),
        cell: (row) => formatDateTime(row.dueAt, locale),
        className: "text-muted-foreground",
      },
      {
        id: "status",
        header: t("assignments.colStatus"),
        cell: (row) => (
          <StatusBadge
            status={row.status}
            label={t(`assignmentStatus.${row.status}`)}
          />
        ),
      },
      {
        id: "submitted",
        header: t("assignments.colSubmitted"),
        cell: (row) => formatDateTime(row.submittedAt, locale),
        className: "text-muted-foreground",
      },
      {
        id: "score",
        header: t("assignments.colScore"),
        align: "right",
        cell: (row) => (
          <span className="font-extrabold">
            {formatScorePercent(row.scorePercent)}
          </span>
        ),
      },
    ],
    [t, locale],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-foreground tracking-tight">
            {t("assignments.title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("assignments.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const isActive = status === f;
            return (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => {
                  setStatus(f);
                  setPage(1);
                }}
                className="h-8 rounded-lg px-3 text-xs font-bold"
              >
                {f === "ALL"
                  ? t("assignments.filterAll")
                  : t(`assignmentStatus.${f}`)}
              </Button>
            );
          })}
        </div>
      </div>

      <DataTable
        data={items}
        columns={columns}
        getRowKey={(row) => row.assignmentId}
        isLoading={query.isLoading}
        loadingState={<SkeletonTable columns={6} />}
        errorState={
          query.isError ? (
            <RegionState variant="error" description={t("assignments.error")} />
          ) : undefined
        }
        emptyState={
          <RegionState variant="empty" description={t("assignments.empty")} />
        }
        pagination={
          pageData
            ? {
                page: pageData.page,
                totalPages: Math.max(1, pageData.totalPages),
                totalElements: pageData.totalElements,
                pageSize: pageData.size,
                totalLabel: tTable("totalStudents", {
                  total: pageData.totalElements,
                }),
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
