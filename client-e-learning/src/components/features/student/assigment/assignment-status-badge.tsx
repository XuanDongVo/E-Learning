import { CheckCircle2, Clock3, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { StudentAssignmentItem } from "./types";

interface AssignmentStatusBadgeProps {
  status: StudentAssignmentItem["status"];
  className?: string;
}

export function AssignmentStatusBadge({ status, className }: AssignmentStatusBadgeProps) {
  const t = useTranslations("student.assignments");
  const isSubmitted = status === "SUBMITTED";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <span
      className={cn(
        "student-assignment-status",
        isSubmitted
          ? "student-assignment-status--submitted"
          : isInProgress
            ? "student-assignment-status--in-progress"
            : "student-assignment-status--todo",
        className,
      )}
    >
      {isSubmitted ? (
        <CheckCircle2 size={15} aria-hidden="true" />
      ) : isInProgress ? (
        <Clock3 size={15} aria-hidden="true" />
      ) : (
        <FileText size={15} aria-hidden="true" />
      )}
      {isSubmitted ? t("status.submitted") : isInProgress ? t("status.inProgress") : t("status.todo")}
    </span>
  );
}
