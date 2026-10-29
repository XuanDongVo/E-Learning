import { CheckCircle2, Clock3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentAssignmentItem } from "./types";
import { ASSIGNMENT_STATUS_LABEL } from "./constants";

interface AssignmentStatusBadgeProps {
  status: StudentAssignmentItem["status"];
  className?: string;
}

export function AssignmentStatusBadge({ status, className }: AssignmentStatusBadgeProps) {
  const isSubmitted = status === "SUBMITTED";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold",
        isSubmitted && "bg-success-soft text-foreground",
        isInProgress && "bg-info-soft text-foreground",
        !isSubmitted && !isInProgress && "bg-primary-soft text-foreground",
        className,
      )}
    >
      {isSubmitted ? (
        <CheckCircle2 size={14} className="text-success" />
      ) : isInProgress ? (
        <Clock3 size={14} />
      ) : (
        <FileText size={14} />
      )}{" "}
      {ASSIGNMENT_STATUS_LABEL[status]}
    </span>
  );
}

