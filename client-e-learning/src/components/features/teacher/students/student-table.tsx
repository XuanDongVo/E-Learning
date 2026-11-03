"use client";

import { Link } from "@/i18n/navigation";
import { MoreVertical, Users } from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table/data-table";
import type { StudentTableProps } from "@/types/student";
import type { StudentSummary } from "@/types/student";

export function StudentTable({
  students,
  isLoading,
  page,
  totalElements,
  totalPages,
  pageSize,
  selectedIds,
  onToggle,
  onToggleAll,
  onStatusChange,
  onView,
  onPageChange,
  onPageSizeChange,
}: StudentTableProps) {
  const t = useTranslations("teacher.students");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const allSelected =
    students.length > 0 &&
    students.every((student) => selectedIds.includes(student.id));

  const columns: DataTableColumn<StudentSummary>[] = [
    {
      id: "selection",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleAll}
          aria-label={t("selectAll")}
        />
      ),
      width: "3rem",
      className: "px-5",
      headerClassName: "px-5",
      cell: (student) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(student.id)}
          onChange={() => onToggle(student.id)}
          aria-label={t("selectStudent", { name: student.fullName })}
        />
      ),
    },
    {
      id: "student",
      header: t("table.student"),
      cell: (student) => (
        <Link
          href={`/teacher/students/${student.id}`}
          className="flex items-center gap-3 rounded-md outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-light font-extrabold text-primary">
            {student.fullName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(-2)
              .toUpperCase()}
          </div>

          <p className="text-body-sm">{student.fullName}</p>
        </Link>
      ),
    },
    {
      id: "contact",
      header: t("table.contact"),
      cell: (student) => (
        <div className="text-body-sm text-neutral-muted">
          <p>{student.email}</p>
          <p className="mt-1">{student.phone || t("table.noPhone")}</p>
        </div>
      ),
    },
    {
      id: "class",
      header: t("table.classAndGrade"),
      cell: (student) => {
        const activeClass = student.classes.find(
          (item) => item.status === "ACTIVE",
        );
        return activeClass ? (
          <div>
            <p className="font-bold">{activeClass.name}</p>
            <p className="text-body-sm text-neutral-muted">
              {activeClass.gradeName}
            </p>
          </div>
        ) : (
          <span className="rounded-full bg-warm-soft px-3 py-1 text-body-sm text-primary">
            {t("noActiveClass")}
          </span>
        );
      },
    },
    {
      id: "guardian",
      header: t("table.guardian"),
      cell: (student) =>
        student.primaryGuardian ? (
          <div className="text-body-sm">
            <p>{student.primaryGuardian.fullName}</p>
            <p className="mt-1 text-neutral-muted">
              {student.primaryGuardian.phone}
            </p>
          </div>
        ) : (
          <span className="text-body-sm text-neutral-muted">
            {t("table.noGuardian")}
          </span>
        ),
    },
    {
      id: "status",
      header: t("table.status"),
      cell: (student) => (
        <span className="inline-flex items-center gap-2 text-body-sm">
          <span
            className={`size-2 rounded-full ${
              student.accountStatus === "ACTIVE"
                ? "bg-success"
                : "bg-neutral-muted"
            }`}
          />
          {student.accountStatus === "ACTIVE" ? t("active") : t("locked")}
        </span>
      ),
    },
    {
      id: "actions",
      header: null,
      width: "3.5rem",
      className: "relative px-3",
      headerClassName: "px-3",
      cell: (student) => (
        <>
          <button
            type="button"
            onClick={(event) => {
              if (openMenu === student.id) {
                setOpenMenu(null);
                return;
              }
              const rect = event.currentTarget.getBoundingClientRect();
              setMenuPosition({
                top: Math.min(rect.bottom + 4, window.innerHeight - 140),
                left: Math.max(rect.right - 144, 8),
              });
              setOpenMenu(student.id);
            }}
            aria-label={`Actions for ${student.fullName}`}
            className="rounded-md p-2 text-neutral-muted hover:bg-background-app"
          >
            <MoreVertical className="size-4" />
          </button>
          {openMenu === student.id &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="fixed z-50 w-36 rounded-md border border-border-color bg-card-bg p-1 shadow-lg"
                style={menuPosition}
              >
                <button
                  type="button"
                  onClick={() => {
                    onView(student);
                    setOpenMenu(null);
                  }}
                  className="block w-full rounded px-3 py-2 text-left text-body-sm hover:bg-background-app"
                >
                  {t("table.viewDetails")}
                </button>
                <Link
                  href={`/teacher/students/${student.id}?edit=1`}
                  className="block rounded px-3 py-2 text-body-sm hover:bg-background-app"
                >
                  {t("table.edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(student);
                    setOpenMenu(null);
                  }}
                  className="block w-full rounded px-3 py-2 text-left text-body-sm hover:bg-background-app"
                >
                  {student.accountStatus === "ACTIVE"
                    ? t("table.lockAccount")
                    : t("table.activateAccount")}
                </button>
              </div>,
              document.body,
            )}
        </>
      ),
    },
  ];

  return (
    <DataTable
      data={students}
      columns={columns}
      getRowKey={(student) => student.id}
      isLoading={isLoading}
      loadingState={
        <div className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-10 text-center text-neutral-muted">
          {t("loading")}
        </div>
      }
      emptyState={
        <div className="rounded-[var(--radius-md)] border border-dashed border-border-color bg-card-bg p-10 text-center">
          <Users className="mx-auto size-8 text-primary" />
          <p className="mt-3 font-bold">{t("emptyTitle")}</p>
          <p className="mt-1 text-neutral-muted">{t("emptySubtitle")}</p>
        </div>
      }
      minWidth="760px"
      pagination={{
        page,
        totalPages,
        totalElements,
        pageSize,
        totalLabel: t("table.totalStudents", { total: totalElements }),
        showLabel: t("table.show"),
        perPageLabel: t("table.perPage"),
        previousLabel: t("table.previous"),
        nextLabel: t("table.next"),
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
}
