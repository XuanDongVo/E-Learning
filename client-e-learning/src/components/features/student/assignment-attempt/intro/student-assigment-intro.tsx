import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileQuestion,
  GraduationCap,
  Play,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AttemptIntroResponse } from "@/types/student/assignment-attempt";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { formatDueAt } from "@/utils/format";
import { cn } from "@/lib/utils";

export interface StudentAssignmentIntroProps {
  data: AttemptIntroResponse;
  onBack?: () => void;
  onStart?: () => void;
  onResume?: () => void;
  onViewResult?: () => void;
  busy?: boolean;
}

export function StudentAssignmentIntro({
  data,
  onBack,
  onStart,
  onResume,
  onViewResult,
  busy = false,
}: StudentAssignmentIntroProps) {
  const locale = useLocale();
  const t = useTranslations("student.assignmentAttempt.intro");
  const runtimeT = useTranslations("student.assignmentAttempt");
  const {
    assignmentTitle,
    gradeName,
    questionCount,
    timeLimitMinutes,
    dueAt,
    attemptStatus,
    late,
  } = data;

  const isNotStarted = attemptStatus == null;
  const isInProgress = attemptStatus === "IN_PROGRESS";
  const isSubmitted = attemptStatus === "SUBMITTED";
  const isTimedOut = attemptStatus === "TIMED_OUT";
  const isFinished = isSubmitted || isTimedOut;
  const statusName = isInProgress
    ? t("status.inProgress")
    : isSubmitted
      ? t("status.submitted")
      : isTimedOut
        ? t("status.timedOut")
        : t("status.notStarted");

  const details = [
    { icon: FileQuestion, label: t("questionLabel"), value: t("questionCount", { count: questionCount }) },
    { icon: Clock3, label: t("timeLimit"), value: timeLimitMinutes != null ? t("timeLimitValue", { minutes: timeLimitMinutes }) : t("noTimeLimit") },
    { icon: GraduationCap, label: t("grade"), value: gradeName || t("metadataUnavailable") },
    { icon: CalendarDays, label: t("dueAt"), value: dueAt ? formatDueAt(dueAt, locale, "long") : t("noDueDate") },
  ];

  const rules = [
    { title: t("rules.oneAttemptTitle"), description: t("rules.oneAttempt") },
    { title: t("rules.autoSaveTitle"), description: t("rules.autoSave") },
    { title: t("rules.noHintsTitle"), description: t("rules.noHints") },
    { title: t("rules.stayOnScreenTitle"), description: t("rules.stayOnScreen") },
    { title: t("rules.singleTabTitle"), description: t("rules.singleTab") },
    { title: t("rules.warningTitle"), description: t("rules.warning") },
    { title: t("rules.submitTitle"), description: t("rules.submit") },
  ];

  const action = isNotStarted ? onStart : isInProgress ? onResume : onViewResult;
  const actionText = isNotStarted ? t("start") : isInProgress ? t("resume") : t("viewResult");
  const ActionIcon = isNotStarted ? Play : isInProgress ? Zap : ArrowRight;

  return (
    <section className="student-assignment-intro space-y-6" aria-label={assignmentTitle}>
      <button type="button" onClick={onBack} className="student-control student-control--quiet student-assignment-back inline-flex items-center gap-2 px-4">
        <ArrowLeft size={17} aria-hidden="true" /> {runtimeT("backToAssignments")}
      </button>

      {late && !isFinished && (
        <div className="student-assignment-overdue flex items-start gap-3 p-4" role="alert">
          <ShieldAlert size={21} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="student-label">{t("overdueTitle")}</p>
            <p className="student-body">{t("overdueDescription")}</p>
          </div>
        </div>
      )}

      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-assignment-intro-hero p-6 sm:p-8">
        <div className="space-y-3">
          <p className="student-meta text-primary">{t("eyebrow")}</p>
          <span className={cn("student-assignment-status", "student-assignment-status--" + (isSubmitted ? "submitted" : isTimedOut ? "overdue" : isInProgress ? "in-progress" : "todo"))}>
            {isFinished ? <CheckCircle2 size={15} aria-hidden="true" /> : <ClipboardList size={15} aria-hidden="true" />}
            {statusName}
          </span>
          <ScrapbookHeading as="h1" className="student-page-title break-words text-foreground">
            {assignmentTitle}
          </ScrapbookHeading>
          <p className="student-body max-w-2xl text-muted-foreground">{t("description")}</p>
        </div>
      </PaperSurface>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="student-assignment-info p-4">
            <Icon size={19} className="text-primary" aria-hidden="true" />
            <p className="student-meta mt-2 text-muted-foreground">{label}</p>
            <p className="student-label mt-1 break-words text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <PaperSurface as="section" variant="lined" className="student-assignment-rules p-5 sm:p-6" aria-labelledby="student-assignment-rules-title">
        <ScrapbookHeading as="h2" id="student-assignment-rules-title" className="student-section-title mb-4 text-foreground">
          {t("rules.title")}
        </ScrapbookHeading>
        <ul className="space-y-3">
          {rules.map(({ title, description }) => (
            <li key={title} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              <p className="student-body text-foreground">
                <strong>{title}</strong>{" "}
                {description}
              </p>
            </li>
          ))}
        </ul>
      </PaperSurface>

      <div className="student-assignment-footer flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="student-body text-muted-foreground">
          {isNotStarted
            ? t("actionDescription.notStarted")
            : isInProgress
              ? t("actionDescription.inProgress")
              : isSubmitted
                ? t("actionDescription.submitted")
                : t("actionDescription.timedOut")}
        </p>
        <button
          type="button"
          disabled={busy || !action}
          onClick={action}
          className={cn("student-control student-assignment-action shrink-0 px-6", isFinished ? "student-control--secondary" : "student-control--action")}
        >
          <ActionIcon size={18} aria-hidden="true" />
          {actionText}
        </button>
      </div>
    </section>
  );
}
