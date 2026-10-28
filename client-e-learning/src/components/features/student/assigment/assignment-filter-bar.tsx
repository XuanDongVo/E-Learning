import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AssignmentFilter } from "./types";

interface AssignmentFilterBarProps {
  currentFilter: AssignmentFilter;
  onFilterChange: (filter: AssignmentFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<AssignmentFilter, number>;
}

const TABS: { value: AssignmentFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "SUBMITTED", label: "Submitted" },
];

export function AssignmentFilterBar({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
}: AssignmentFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      {/* Status tabs */}
      <div
        className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto pb-1 sm:pb-0"
        role="tablist"
        aria-label="Assignment status"
      >
        {TABS.map((t) => {
          const isActive = currentFilter === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 border-foreground bg-card px-3.5 sm:px-4 text-xs sm:text-sm font-bold shadow-pop-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-pop active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer",
                isActive && "bg-primary text-foreground shadow-pop",
              )}
              onClick={() => onFilterChange(t.value)}
            >
              {t.label}
              <span
                className={cn(
                  "grid h-6 min-w-[24px] place-items-center rounded-full bg-muted px-1.5 text-xs",
                  isActive && "bg-card text-foreground",
                )}
              >
                {counts[t.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="flex w-full sm:w-auto sm:max-w-xs flex-1 items-center gap-2 min-h-[46px] rounded-full border-2 border-foreground bg-card px-4 shadow-pop-sm focus-within:shadow-pop">
        <Search size={18} className="shrink-0 text-muted-foreground" />
        <Input
          aria-label="Search assignments"
          placeholder="Search assignments…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}

