import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";

import { AssignmentStatusBadge } from "./AssignmentStatusBadge";

type Assignment = {
  id: number;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  grade: { name: string; displayOrder: number };
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
    return <SkeletonList count={5} />;
  }

  if (assignments.length === 0) {
    return <RegionState variant="empty" />;
  }

  return (
    <div className="divide-y divide-border">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="grid items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40 lg:grid-cols-[minmax(260px,1.5fr)_0.7fr_0.8fr_1.2fr_auto]"
        >
          <Link
            href={`/teacher/assignments/${assignment.id}`}
            className="min-w-0"
          >
            <p className="truncate text-body font-bold">
              {assignment.name}{" "}
              <AssignmentStatusBadge status={assignment.status} />
            </p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              {assignment.grade.name} · {assignment.questionCount} questions
            </p>
          </Link>

          <span className="text-body-sm font-semibold">
            {assignment.grade.name}
          </span>

          <span className="text-body-sm text-muted-foreground">
            {new Date(assignment.dueAt).toLocaleDateString("en-US")}
          </span>

          <div className="flex flex-wrap items-center gap-2 text-body-sm">
            {assignment.status !== "DRAFT" ? (
              <Link
                href={`/teacher/assignments/${assignment.id}/results`}
                className="rounded-md border border-border px-2.5 py-1 font-medium text-primary hover:bg-muted"
              >
                Results
              </Link>
            ) : (
              <span className="text-muted-foreground">Draft</span>
            )}
          </div>

          <Link
            href={`/teacher/assignments/${assignment.id}`}
            className="justify-self-end text-muted-foreground"
            aria-label="Open assignment"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
