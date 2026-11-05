import { CheckCircle2, Clock3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneForStatus, type StatusTone } from "@/components/ui/status-badge";
import type { StudentAssignmentItem } from "./types";
import { ASSIGNMENT_STATUS_LABEL } from "./constants";

interface AssignmentStatusBadgeProps {
  status: StudentAssignmentItem["status"];
  className?: string;
}

/** Soft surface styles aligned with shared StatusTone (keeps icon layout). */
const TONE_SOFT: Record<StatusTone, string> = {
  success: "bg-success-soft text-foreground",
  warning: "bg-amber-500/10 text-foreground",
  danger: "bg-rose-500/10 text-foreground",
  neutral: "bg-muted text-foreground",
  info: "bg-info-soft text-foreground",
};

export function AssignmentStatusBadge({
  status,
  className,
}: AssignmentStatusBadgeProps) {
  const tone = toneForStatus(status);
  const isSubmitted = status === "SUBMITTED";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold",
        TONE_SOFT[tone],
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
