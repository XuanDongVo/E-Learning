import { useMemo, useState } from "react";
import type { AssignmentFilter, StudentAssignmentItem } from "./types";
import { STUDENT_ASSIGNMENTS_MOCK } from "./student-assignment.mock";
import { AssignmentHero } from "./assignment-hero";
import { AssignmentFilterBar } from "./assignment-filter-bar";
import { AssignmentCard } from "./assignment-card";
import { AssignmentEmptyState } from "./assignment-empty-state";

interface StudentAssignmentsProps {
  initialAssignments?: StudentAssignmentItem[];
}

export function StudentAssignments({
  initialAssignments = STUDENT_ASSIGNMENTS_MOCK,
}: StudentAssignmentsProps) {
  const [filter, setFilter] = useState<AssignmentFilter>("TODO");
  const [query, setQuery] = useState("");

  const assignments = initialAssignments;

  const records = useMemo(() => {
    const search = query.trim().toLowerCase();
    return assignments.filter(
      (a) =>
        (filter === "TODO" || a.status === filter) &&
        (search === "" || a.title.toLowerCase().includes(search)),
    );
  }, [assignments, filter, query]);

  const todoCount = useMemo(
    () => assignments.filter((a) => a.status !== "SUBMITTED").length,
    [assignments],
  );

  const counts: Record<AssignmentFilter, number> = useMemo(
    () => ({
      TODO: assignments.filter((a) => a.status === "TODO").length,
      IN_PROGRESS: assignments.filter((a) => a.status === "IN_PROGRESS").length,
      SUBMITTED: assignments.filter((a) => a.status === "SUBMITTED").length,
    }),
    [assignments],
  );

  return (
    <div className="grid gap-5 sm:gap-6">
      {/* Hero Banner */}
      <AssignmentHero todoCount={todoCount} />

      {/* Filter Tabs & Search Bar */}
      <AssignmentFilterBar
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={query}
        onSearchChange={setQuery}
        counts={counts}
      />

      {/* Result Count Caption */}
      <p className="text-xs sm:text-sm font-semibold text-muted-foreground" aria-live="polite">
        {records.length} {records.length === 1 ? "assignment" : "assignments"}
      </p>

      {/* Grid of Assignments or Empty State */}
      {records.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.map((assignment, index) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              index={index}
            />
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
    </div>
  );
}
