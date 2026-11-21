import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TeacherListToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Responsive layout for Teacher list controls.
 *
 * Feature components retain ownership of state, queries and domain behavior;
 * this component only aligns their search, filter and action controls.
 */
export function TeacherListToolbar({
  search,
  filters,
  actions,
  className,
}: TeacherListToolbarProps) {
  return (
    <div
      data-slot="teacher-list-toolbar"
      className={cn(
        "flex flex-col gap-3 p-5 xl:flex-row xl:items-center bg-card rounded-lg shadow-sm border-2 border-ink shadow-pop",
        className,
      )}
    >
      {search ? (
        <div
          data-slot="teacher-list-toolbar-search"
          className="relative w-full xl:w-72 xl:shrink-0"
        >
          {search}
        </div>
      ) : null}

      {filters ? (
        <div
          data-slot="teacher-list-toolbar-filters"
          className="flex flex-wrap sm:flex-wrap-initial items-center gap-2"
        >
          {filters}
        </div>
      ) : null}

      {actions ? (
        <div
          data-slot="teacher-list-toolbar-actions"
          className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:[&>*]:flex-none max-sm:[&>*]:flex-1 xl:ml-auto xl:justify-end"
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
