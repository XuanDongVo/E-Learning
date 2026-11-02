"use client";

import { Link } from "@/i18n/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";
import type { Activity, ActivityMode } from "@/types/activity";

const modes: Record<ActivityMode, string> = {
  LEARNING: "Practice",
  TRY_HARD: "Try Hard",
  BOTH: "Both",
};

export function ActivityTable({
  activities,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  activities: Activity[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const columns: DataTableColumn<Activity>[] = [
    {
      id: "activity",
      header: "Activity",
      cell: (activity) => (
        <Link href={`/teacher/activities/${activity.id}`} className="block">
          <span className="block truncate text-card-title font-semibold">{activity.name}</span>
          <span className="mt-1 block max-w-prose truncate text-body-sm text-neutral-muted">
            {activity.description || "No description"}
          </span>
        </Link>
      ),
    },
    {
      id: "questions",
      header: "Questions",
      cell: (activity) => <span className="tabular-nums">{activity.totalQuestions}</span>,
    },
    {
      id: "sources",
      header: "Sources",
      cell: (activity) => <span className="tabular-nums text-neutral-muted">{activity.banks.length}</span>,
    },
    {
      id: "mode",
      header: "Mode",
      cell: (activity) => <span className="text-neutral-muted">{modes[activity.mode]}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (activity) => (
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-body-sm font-semibold ${
              activity.status === "PUBLISHED"
                ? "text-success"
                : "bg-background-app text-neutral-muted"
            }`}
          >
            {activity.status === "PUBLISHED"
              ? "Published"
              : activity.status === "ARCHIVED"
                ? "Archived"
                : "Draft"}
          </span>
          {activity.status !== "ARCHIVED" && (
            <span
              className={`rounded-full px-2.5 py-1 text-body-sm font-semibold ${
                activity.readiness.ready
                  ? "bg-success-light text-success"
                  : "text-accent-text"
              }`}
            >
              {activity.readiness.ready ? "Ready" : "Needs attention"}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={activities}
      columns={columns}
      getRowKey={(activity) => activity.id}
      minWidth="760px"
      pagination={{
        page,
        totalPages,
        totalElements: total,
        pageSize,
        pageSizeOptions: [10, 20, 50],
        showLabel: "Rows",
        perPageLabel: "",
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
}
