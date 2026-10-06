"use client";

import Link from "next/link";
import { MoreVertical, Users } from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";
import type { StudentTableProps } from "@/types/student";

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
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  if (isLoading)
    return (
      <div className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-10 text-center text-neutral-muted">
        Loading students...
      </div>
    );
  if (!students.length)
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-border-color bg-card-bg p-10 text-center">
        <Users className="mx-auto size-8 text-primary" />
        <p className="mt-3 font-bold">No students found</p>
        <p className="mt-1 text-neutral-muted">
          Adjust your filters or add a student.
        </p>
      </div>
    );

  const allSelected = students.every((student) =>
    selectedIds.includes(student.id),
  );

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-border-color bg-card-bg">
      <table className="w-full min-w-[760px] text-left">
        <thead className="border-b border-border-color bg-background-app text-body-sm  tracking-wide text-neutral-muted">
          <tr className="border-b border-border-color bg-background-app">
            <th className="w-12 px-5 py-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all students"
              />
            </th>
            <th className="px-4 py-3 text-left text-label font-semibold text-neutral-muted">
              Student
            </th>
            <th className="px-4 py-3 text-left text-label font-semibold text-neutral-muted">
              Contact information
            </th>
            <th className="px-4 py-3 text-left text-label font-semibold text-neutral-muted">
              Class and grade
            </th>
            <th className="px-4 py-3 text-left text-label font-semibold text-neutral-muted">
              Primary guardian
            </th>
            <th className="px-4 py-3 text-left text-label font-semibold text-neutral-muted">
              Status
            </th>
            <th className="w-14 px-3 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {students.map((student) => {
            const activeClass = student.classes.find(
              (item) => item.status === "ACTIVE",
            );
            return (
              <tr key={student.id} className="hover:bg-background-app">
                <td className="px-5 py-4 align-middle">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => onToggle(student.id)}
                    aria-label={"Select " + student.fullName}
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-light font-extrabold text-primary">
                      {student.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(-2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-body-sm">{student.fullName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-body-sm text-neutral-muted">
                  <p>{student.email}</p>
                  <p className="mt-1">{student.phone || "No phone"}</p>
                </td>
                <td className="px-3 py-4">
                  {activeClass ? (
                    <div>
                      <p className="font-bold">{activeClass.name}</p>
                      <p className="text-body-sm text-neutral-muted">
                        {activeClass.gradeName}
                      </p>
                    </div>
                  ) : (
                    <span className="rounded-full bg-warm-soft px-3 py-1 text-body-sm text-primary">
                      No active class
                    </span>
                  )}
                </td>
                <td className="px-3 py-4 text-body-sm">
                  {student.primaryGuardian ? (
                    <div>
                      <p>{student.primaryGuardian.fullName}</p>
                      <p className="mt-1 text-neutral-muted">
                        {student.primaryGuardian.phone}
                      </p>
                    </div>
                  ) : (
                    <span className="text-neutral-muted">No guardian</span>
                  )}
                </td>
                <td className="px-3 py-4">
                  <span className="inline-flex items-center gap-2 text-body-sm">
                    <span
                      className={
                        "size-2 rounded-full " +
                        (student.accountStatus === "ACTIVE"
                          ? "bg-success"
                          : "bg-neutral-muted")
                      }
                    />
                    {student.accountStatus === "ACTIVE" ? "Active" : "Locked"}
                  </span>
                </td>
                <td className="relative px-3 py-4">
                  <button
                    type="button"
                    onClick={(event) => {
                      if (openMenu === student.id) {
                        setOpenMenu(null);
                        return;
                      }
                      const rect = event.currentTarget.getBoundingClientRect();
                      setMenuPosition({
                        top: Math.min(
                          rect.bottom + 4,
                          window.innerHeight - 140,
                        ),
                        left: Math.max(rect.right - 144, 8),
                      });
                      setOpenMenu(student.id);
                    }}
                    aria-label={"Actions for " + student.fullName}
                    className="rounded-md p-2 text-neutral-muted hover:bg-background-app"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                  {openMenu === student.id &&
                    typeof document !== "undefined" &&
                    createPortal(
                      <div
                        className="fixed z-50 w-36 rounded-md border border-border-color bg-card-bg p-1 shadow-lg"
                        style={{
                          top: menuPosition.top,
                          left: menuPosition.left,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onView(student);
                            setOpenMenu(null);
                          }}
                          className="block w-full rounded px-3 py-2 text-left text-body-sm hover:bg-background-app"
                        >
                          View details
                        </button>
                        <Link
                          href={"/teacher/students/" + student.id + "?edit=1"}
                          className="block rounded px-3 py-2 text-body-sm hover:bg-background-app"
                        >
                          Edit
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
                            ? "Lock account"
                            : "Activate account"}
                        </button>
                      </div>,
                      document.body,
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-1 border-t border-border-color px-5 py-4 text-body-sm">
        <div className="flex items-center gap-3">
          <b>Total: {totalElements} Students</b>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Show</span>

            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
              }}
              className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span className="text-xs text-slate-400">per page</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded border border-border-color px-3 py-2 text-neutral-muted disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={pageNum === page ? "page" : undefined}
                className={`size-9 rounded border ${
                  pageNum === page
                    ? "border-primary bg-primary font-bold text-primary-foreground"
                    : "border-border-color hover:bg-background-app"
                }`}
              >
                {pageNum}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded border border-border-color px-3 py-2 text-neutral-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
