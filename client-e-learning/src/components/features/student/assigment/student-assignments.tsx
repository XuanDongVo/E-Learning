"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { AssignmentFilter, StudentAssignmentItem } from "./types";
import { AssignmentHero } from "./assignment-hero";
import { AssignmentFilterBar } from "./assignment-filter-bar";
import { AssignmentCard } from "./assignment-card";
import { AssignmentEmptyState } from "./assignment-empty-state";
import { studentAssignmentService } from "@/services/student/student-assignment.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { RegionState } from "@/components/feedback";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";
import { RefreshCw } from "lucide-react";

interface StudentAssignmentsProps {
  initialAssignments?: StudentAssignmentItem[];
}

export function StudentAssignments({ initialAssignments = [] }: StudentAssignmentsProps) {
  const t = useTranslations("student.assignments");
  const tf = useTranslations("feedback");
  const [filter, setFilter] = useState<AssignmentFilter>("TODO");
  const [query, setQuery] = useState("");

  // TODO includes IN_PROGRESS per backend policy; fetch it independently for an honest hero count.
  const todoQuery = useQuery({
    queryKey: QUERY_KEYS.studentAssignments("TODO"),
    queryFn: () => studentAssignmentService.getAssignments("TODO"),
    initialData: initialAssignments.length > 0 ? initialAssignments : undefined,
  });
  const selectedQuery = useQuery({
    queryKey: QUERY_KEYS.studentAssignments(filter),
    queryFn: () => studentAssignmentService.getAssignments(filter),
    enabled: filter !== "TODO",
  });
  const activeQuery = filter === "TODO" ? todoQuery : selectedQuery;
  const assignments = activeQuery.data ?? [];

  const records = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return assignments.filter((item) => search === "" || item.title.toLocaleLowerCase().includes(search));
  }, [assignments, query]);

  const todoCount = todoQuery.isSuccess ? todoQuery.data.length : null;
  const canClear = query.trim().length > 0 || filter !== "TODO";

  return (
    <section className="student-assignments space-y-6" aria-label={t("hero.title")}>
      <AssignmentHero todoCount={todoCount} />

      <AssignmentFilterBar
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      {activeQuery.isLoading ? (
        <SkeletonGrid />
      ) : activeQuery.isError ? (
        <RegionState
          variant="error"
          title={t("loadFailed")}
          action={
            <button type="button" className="student-control student-control--secondary inline-flex items-center gap-2 px-4" onClick={() => void activeQuery.refetch()}>
              <RefreshCw size={16} aria-hidden="true" /> {tf("retry")}
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="student-meta text-muted-foreground" aria-live="polite">
            {t("count", { count: records.length })}
          </p>
          {records.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {records.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <AssignmentEmptyState
              hasSearch={query.trim().length > 0}
              canClear={canClear}
              onClearFilters={() => {
                setQuery("");
                setFilter("TODO");
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}
