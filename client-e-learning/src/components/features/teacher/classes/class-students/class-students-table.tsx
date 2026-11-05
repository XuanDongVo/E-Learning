"use client";

import { ArrowLeftRight, Eye, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table/data-table";
import { RegionState } from "@/components/feedback";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { getInitials } from "@/utils/format";
import type { StudentSummary } from "@/types/teacher/student";
import type { ClassStudentsTableProps } from "./types";

export function ClassStudentsTable({
  students,
  isLoading,
  error,
  pagination,
  onView,
  onTransfer,
  onRemove,
  removePending,
}: ClassStudentsTableProps) {
  const t = useTranslations("teacher.classes.classStudents");

  const columns: DataTableColumn<StudentSummary>[] = [
    {
      id: "student",
      header: t("columnStudent"),
      cell: (student) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
            {getInitials(student.fullName)}
          </span>
          <div>
            <p className="text-sm font-extrabold text-foreground">
              {student.fullName}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: t("columnEmail"),
      cell: (student) => (
        <span className="font-medium text-muted-foreground">
          {student.email}
        </span>
      ),
    },
    {
      id: "phone",
      header: t("columnPhone"),
      cell: (student) => (
        <span className="font-medium text-muted-foreground">
          {student.phone || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: t("columnStatus"),
      cell: (student) => (
        <StatusBadge
          status={student.accountStatus === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
          label={
            student.accountStatus === "ACTIVE"
              ? t("statusActive")
              : t("statusLocked")
          }
        />
      ),
    },
    {
      id: "actions",
      header: t("columnActions"),
      align: "right",
      cell: (student) => (
        <TooltipProvider delay={200}>
          <div className="flex items-center justify-end gap-1">
            <ActionTooltip label={t("view")} onClick={() => onView(student)}>
              <Eye className="size-4" />
            </ActionTooltip>
            <ActionTooltip
              label={t("transfer")}
              onClick={() => onTransfer(student)}
            >
              <ArrowLeftRight className="size-4" />
            </ActionTooltip>
            <ActionTooltip
              label={t("remove")}
              onClick={() => onRemove(student)}
              disabled={removePending}
              destructive
            >
              <Trash2 className="size-4" />
            </ActionTooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <DataTable
      data={students}
      columns={columns}
      getRowKey={(student) => student.id}
      isLoading={isLoading}
      loadingState={<SkeletonTable columns={5} />}
      emptyState={
        <RegionState
          variant="empty"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      }
      errorState={error}
      pagination={pagination}
    />
  );
}

function ActionTooltip({
  children,
  label,
  onClick,
  disabled = false,
  destructive = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className={
              destructive
                ? "size-8 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                : "size-8 text-muted-foreground hover:text-foreground"
            }
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
