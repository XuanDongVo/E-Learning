import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { AssignmentFilter } from "./types";

interface AssignmentFilterBarProps {
  currentFilter: AssignmentFilter;
  onFilterChange: (filter: AssignmentFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TABS: AssignmentFilter[] = ["TODO", "IN_PROGRESS", "SUBMITTED"];

export function AssignmentFilterBar({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: AssignmentFilterBarProps) {
  const t = useTranslations("student.assignments");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div role="group" aria-label={t("filterLabel")} className="flex max-w-full gap-2 overflow-x-auto py-1">
        {TABS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={currentFilter === value}
            onClick={() => onFilterChange(value)}
            className={cn(
              "student-control student-assignment-filter shrink-0 px-4",
              currentFilter === value ? "student-assignment-filter--active" : "student-control--quiet",
            )}
          >
            {value === "TODO"
              ? t("tabs.todo")
              : value === "IN_PROGRESS"
                ? t("tabs.inProgress")
                : t("tabs.submitted")}
          </button>
        ))}
      </div>
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="student-field student-assignment-search"
        />
      </div>
    </div>
  );
}
