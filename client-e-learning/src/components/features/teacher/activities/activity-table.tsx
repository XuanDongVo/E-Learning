"use client";

import { Link } from "@/i18n/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";
import type { Activity, ActivityMode, ActivityPracticeType } from "@/types/activity";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("teacher.activities.table");
  const modes: Record<ActivityMode, string> = {
    LEARNING: t("modes.learning"),
    TRY_HARD: t("modes.tryHard"),
    BOTH: t("modes.both"),
  };
  const practiceTypes: Record<ActivityPracticeType, string> = {
    CLASSIC: "Classic",
    GUIDED_REASONING: "Guided",
  };
  const columns: DataTableColumn<Activity>[] = [
    {
      id: "activity",
      header: t("activity"),
      cell: (activity) => (
        <Link href={`/teacher/activities/${activity.id}`} className="block">
          <span className="block truncate text-card-title font-semibold">{activity.name}</span>
          <span className="mt-1 block max-w-prose truncate text-body-sm text-neutral-muted">
            {activity.description || t("noDescription")}
          </span>
        </Link>
      ),
    },
    {
      id: "questions",
      header: t("questions"),
      cell: (activity) => <span className="tabular-nums">{activity.totalQuestions}</span>,
    },
    {
      id: "sources",
      header: t("sources"),
      cell: (activity) => <span className="tabular-nums text-neutral-muted">{activity.banks.length}</span>,
    },
    {
      id: "mode",
      header: t("mode"),
      cell: (activity) => (
        <span className="text-neutral-muted">
          {practiceTypes[activity.practiceType]} {modes[activity.mode]}
        </span>
      ),
    },
    {
      id: "status",
      header: t("status"),
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
              ? t("statuses.published")
              : activity.status === "ARCHIVED"
                ? t("statuses.archived")
                : t("statuses.draft")}
          </span>
          {activity.status !== "ARCHIVED" && (
            <span
              className={`rounded-full px-2.5 py-1 text-body-sm font-semibold ${
                activity.readiness.ready
                  ? "bg-success-light text-success"
                  : "text-accent-text"
              }`}
            >
              {activity.readiness.ready
                ? t("readiness.ready")
                : t("readiness.needsAttention")}
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
        showLabel: t("rows"),
        perPageLabel: "",
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
}
