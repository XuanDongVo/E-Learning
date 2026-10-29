import { useEffect, useMemo, useState } from "react";
import type { AssignmentFilter, StudentAssignmentItem } from "./types";
import { AssignmentHero } from "./assignment-hero";
import { AssignmentFilterBar } from "./assignment-filter-bar";
import { AssignmentCard } from "./assignment-card";
import { AssignmentEmptyState } from "./assignment-empty-state";
import { studentAssignmentService } from "@/services/student/student-assignment.service";

interface StudentAssignmentsProps {
  initialAssignments?: StudentAssignmentItem[];
}

export function StudentAssignments({ initialAssignments = [] }: StudentAssignmentsProps) {
  const [filter, setFilter] = useState<AssignmentFilter>("TODO");
  const [query, setQuery] = useState("");
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>(initialAssignments);
  const [loading, setLoading] = useState(initialAssignments.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    studentAssignmentService
      .getAssignments(filter)
      .then((data) => {
        if (!active) return;
        setAssignments(data);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load assignments.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter]);

  const records = useMemo(() => {
    const search = query.trim().toLowerCase();
    return assignments.filter(
      (assignment) => search === "" || assignment.title.toLowerCase().includes(search),
    );
  }, [assignments, query]);

  const todoCount = useMemo(
    () => (filter === "TODO" ? assignments.length : 0),
    [assignments, filter],
  );

  const counts: Record<AssignmentFilter, number> = useMemo(
    () => ({
      TODO: filter === "TODO" ? assignments.length : 0,
      IN_PROGRESS: filter === "IN_PROGRESS" ? assignments.length : 0,
      SUBMITTED: filter === "SUBMITTED" ? assignments.length : 0,
    }),
    [assignments, filter],
  );

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

      {loading && (
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          Loading assignments…
        </p>
      )}

      {error && (
        <p className="rounded-xl border-2 border-destructive bg-destructive-soft px-4 py-3 text-sm font-semibold" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
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
