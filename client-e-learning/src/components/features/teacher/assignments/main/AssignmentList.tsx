import { CalendarClock, ChevronRight } from "lucide-react";
import Link from "next/link";

import { AssignmentStatusBadge } from "./AssignmentStatusBadge";

type Assignment = {
  id: number;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  gradeLevel: number;
  questionCount: number;
  dueAt: string;
};

type Props = {
  assignments: Assignment[];
  isLoading: boolean;
};

export function AssignmentList({
  assignments,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <p className="p-8 text-center text-body-sm text-muted-foreground">
        Loading assignments...
      </p>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="p-10 text-center">
        <CalendarClock className="mx-auto size-8 text-primary" />

        <p className="mt-3 text-body font-bold">
          No assignments yet
        </p>

        <p className="mt-1 text-body-sm text-muted-foreground">
          Create an assignment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {assignments.map((assignment) => (
        <Link
          key={assignment.id}
          href={`/teacher/assignments/${assignment.id}`}
          className="grid items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40 lg:grid-cols-[minmax(260px,1.5fr)_0.7fr_0.8fr_1.2fr_20px]"
        >
          <div className="min-w-0">
            <p className="truncate text-body font-bold">
              {assignment.name}

              <AssignmentStatusBadge
                status={assignment.status}
              />
            </p>

            <p className="mt-1 text-body-sm text-muted-foreground">
              Grade {assignment.gradeLevel} ·{" "}
              {assignment.questionCount} questions
            </p>
          </div>

          <span className="text-body-sm font-semibold">
            Grade {assignment.gradeLevel}
          </span>

          <span className="text-body-sm text-muted-foreground">
            {new Date(
              assignment.dueAt,
            ).toLocaleDateString("en-US")}
          </span>

          <div className="text-body-sm text-muted-foreground">
            No submission data
          </div>

          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}