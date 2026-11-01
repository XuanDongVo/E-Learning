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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentAssignmentsProps {
  initialAssignments?: StudentAssignmentItem[];
}

function AssignmentListSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="pt-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StudentAssignments({ initialAssignments = [] }: StudentAssignmentsProps) {
  const t = useTranslations("student.assignments");
  const tf = useTranslations("feedback");
  const [filter, setFilter] = useState<AssignmentFilter>("TODO");
  const [query, setQuery] = useState("");

  const {
    data: assignments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.studentAssignments(filter),
    queryFn: () => studentAssignmentService.getAssignments(filter),
    initialData:
      filter === "TODO" && initialAssignments.length > 0 ? initialAssignments : undefined,
  });

  const records = useMemo(() => {
    const search = query.trim().toLowerCase();
    return assignments.filter(
      (assignment) => search === "" || assignment.title.toLowerCase().includes(search),
    );
  }, [assignments, query]);

  const todoCount = filter === "TODO" ? assignments.length : 0;
  const counts: Record<AssignmentFilter, number> = {
    TODO: filter === "TODO" ? assignments.length : 0,
    IN_PROGRESS: filter === "IN_PROGRESS" ? assignments.length : 0,
    SUBMITTED: filter === "SUBMITTED" ? assignments.length : 0,
  };

  return (
    <div className="grid gap-5 sm:gap-6">
      <AssignmentHero todoCount={todoCount} />

      <AssignmentFilterBar
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={query}
        onSearchChange={setQuery}
        counts={counts}
      />

      {isLoading && <AssignmentListSkeleton />}

      {isError && (
        <RegionState
          variant="error"
          title={t("loadFailed")}
          action={
            <Button type="button" variant="secondary" onClick={() => void refetch()}>
              {tf("retry")}
            </Button>
          }
        />
      )}

      {!isLoading && !isError && (
        <>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground" aria-live="polite">
            {t("count", { count: records.length })}
          </p>

          {records.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {records.map((assignment, index) => (
                <AssignmentCard key={assignment.id} assignment={assignment} index={index} />
              ))}
            </div>
          ) : (
            <AssignmentEmptyState
              onClearFilters={() => {
                setQuery("");
                setFilter("TODO");
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
