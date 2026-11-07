import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, ClipboardList, Clock3, AlertTriangle } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { cn } from "@/lib/utils";
import { formatDueAt } from "@/utils/format";
import type { StudentAssignmentItem } from "./types";
import { AssignmentStatusBadge } from "./assignment-status-badge";

interface AssignmentCardProps {
  assignment: StudentAssignmentItem;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const t = useTranslations("student.assignments");
  const locale = useLocale();
  const submitted = assignment.status === "SUBMITTED";
  const inProgress = assignment.status === "IN_PROGRESS";
  const urgent =
    !submitted &&
    !assignment.late &&
    assignment.dueAt != null &&
    assignment.dueInDays >= 0 &&
    assignment.dueInDays <= 2;
  const href = submitted
    ? "/student/assignments/" + assignment.id + "/result"
    : "/student/assignments/" + assignment.id + "/intro";

  return (
    <PaperSurface as="article" className="student-assignment-card flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="student-assignment-card__icon" aria-hidden="true">
          <ClipboardList size={22} />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AssignmentStatusBadge status={assignment.status} />
          {assignment.late && (
            <span className="student-assignment-status student-assignment-status--overdue">
              <AlertTriangle size={14} aria-hidden="true" /> {t("status.late")}
            </span>
          )}
          {urgent && (
            <span className="student-assignment-status student-assignment-status--urgent">
              <Clock3 size={14} aria-hidden="true" />
              {assignment.dueInDays === 0
                ? t("status.dueToday")
                : t("status.dueSoon", { count: assignment.dueInDays })}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <p className="student-meta text-muted-foreground">{t("meta.assignedWork")}</p>
        <h2 className="student-card-title text-foreground">
          <Link href={href} className="student-assignment-title-link">
            {assignment.title}
          </Link>
        </h2>
        {assignment.description && (
          <p className="student-body line-clamp-2 text-muted-foreground">{assignment.description}</p>
        )}
      </div>

      <div className="student-assignment-card__details mt-auto flex flex-wrap gap-x-4 gap-y-2">
        <span className="student-meta student-assignment-detail">
          <ClipboardList size={15} aria-hidden="true" />
          {t("meta.questions", { count: assignment.questionCount })}
        </span>
        <span className="student-meta student-assignment-detail">
          <Clock3 size={15} aria-hidden="true" />
          {assignment.timeLimitMinutes == null
            ? t("meta.noTimeLimit")
            : t("meta.minutes", { count: assignment.timeLimitMinutes })}
        </span>
        <span className="student-meta student-assignment-detail">
          <CalendarDays size={15} aria-hidden="true" />
          {assignment.dueAt ? formatDueAt(assignment.dueAt, locale, "short") : t("meta.noDueDate")}
        </span>
      </div>

      <Link
        href={href}
        className={cn(
          "student-control student-assignment-action mt-1",
          submitted ? "student-control--secondary" : "student-control--action",
        )}
      >
        {submitted
          ? t("actions.viewResult")
          : inProgress
            ? t("actions.continue")
            : t("actions.viewIntro")}
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </PaperSurface>
  );
}
