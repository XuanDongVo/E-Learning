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
        "grid min-w-0 grid-cols-1 gap-3 rounded-lg border-2 border-ink bg-card p-4 shadow-pop lg:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[18rem_minmax(0,1fr)_auto] 2xl:items-end",
        className,
      )}
    >
      {search ? (
        <div
          data-slot="teacher-list-toolbar-search"
          className="relative min-w-0 w-full lg:col-start-1 lg:row-start-1 2xl:col-start-1 2xl:row-start-1"
        >
          {search}
        </div>
      ) : null}

      {filters ? (
        <div
          data-slot="teacher-list-toolbar-filters"
          className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:col-span-2 lg:row-start-2 2xl:col-span-1 2xl:col-start-2 2xl:row-start-1"
        >
          {filters}
        </div>
      ) : null}

      {actions ? (
        <div
          data-slot="teacher-list-toolbar-actions"
          className="flex min-w-0 w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:self-end lg:col-start-2 lg:row-start-1 2xl:col-start-3 2xl:row-start-1"
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
