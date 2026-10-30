"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AssignmentFilter, StudentAssignmentItem } from "./types";
import { AssignmentHero } from "./assignment-hero";
import { AssignmentFilterBar } from "./assignment-filter-bar";
import { AssignmentCard } from "./assignment-card";
import { AssignmentEmptyState } from "./assignment-empty-state";
import { studentAssignmentService } from "@/services/student/student-assignment.service";
import { QUERY_KEYS } from "@/services/query-keys";

interface StudentAssignmentsProps {
  initialAssignments?: StudentAssignmentItem[];
}

export function StudentAssignments({ initialAssignments = [] }: StudentAssignmentsProps) {
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
    initialData: filter === "TODO" && initialAssignments.length > 0
      ? initialAssignments
      : undefined,
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

      {isLoading && (
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          Loading assignments…
        </p>
      )}

      {isError && (
        <div
          className="rounded-xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
          role="alert"
        >
          <p>Unable to load assignments.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground" aria-live="polite">
            {records.length} {records.length === 1 ? "assignment" : "assignments"}
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
