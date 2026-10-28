import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentAssignmentItem } from "./types";
import { STUDENT_ASSIGNMENTS_MOCK } from "./student-assignment.mock";
import { AssignmentStatusBadge } from "./assignment-status-badge";

interface StudentAssignmentIntroProps {
  assignmentId: string;
  assignmentData?: StudentAssignmentItem;
}

export function StudentAssignmentIntro({
  assignmentId,
  assignmentData,
}: StudentAssignmentIntroProps) {
  const assignment =
    assignmentData ??
    STUDENT_ASSIGNMENTS_MOCK.find((a) => String(a.id) === assignmentId);

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 py-16 text-center">
        <FileText size={36} className="text-muted-foreground" />
        <h1 className="text-2xl font-bold">Assignment not found</h1>
        <p className="text-sm text-muted-foreground">
          This assignment could not be found or has ended.
        </p>
        <Button variant="outline" asChild className="mt-2">
          <Link href="/student/assignments">
            <ArrowLeft size={16} />
            Back to assignments
          </Link>
        </Button>
      </div>
    );
  }

  const submitted = assignment.status === "SUBMITTED";

  return (
    <div className="min-w-0">
      <Button
        variant="ghost"
        asChild
        className="min-h-[44px] pl-0 text-sm text-muted-foreground hover:text-foreground"
      >
        <Link href="/student/assignments">
          <ArrowLeft size={16} />
          All assignments
        </Link>
      </Button>

      {/* Intro Heading */}
      <header className="border-b border-border pb-6 pt-3 mb-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            ENGLISH ASSIGNMENT
          </span>
          <AssignmentStatusBadge status={assignment.status} />
        </div>
        <h1 className="my-3 text-2xl sm:text-3xl font-extrabold leading-snug">
          {assignment.title}
        </h1>
        {assignment.teacherName && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <UserRound size={16} />
            {assignment.teacherName}
          </p>
        )}
      </header>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        {/* Left details */}
        <div className="space-y-7">
          {assignment.description && (
            <section>
              <h2 className="mb-2.5 text-lg font-bold">About this assignment</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {assignment.description}
              </p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold">Before you begin</h2>
            <ol className="grid gap-3.5">
              {(submitted
                ? [
                    "This assignment has already been submitted.",
                    "Submitted answers cannot be edited.",
                  ]
                : assignment.instructions && assignment.instructions.length > 0
                  ? assignment.instructions
                  : [
                      "Read each question carefully before answering.",
                      "You can review and check answers before submitting.",
                    ]
              ).map((instruction, i) => (
                <li key={instruction} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="grid h-7 w-7 min-w-[28px] place-items-center rounded-md border border-border bg-card text-xs font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-0.5 text-muted-foreground">{instruction}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex items-start gap-3 border-y border-border py-4">
            <ShieldCheck size={22} className="shrink-0 text-info mt-0.5" />
            <div>
              <strong className="block text-sm font-bold">
                Classwork assessment
              </strong>
              <p className="text-xs text-muted-foreground mt-0.5">
                No hints, retries or XP during this assignment.
              </p>
            </div>
          </div>
        </div>

        {/* Right card: Start panel */}
        <aside
          className="rounded-2xl border-2 border-foreground bg-card p-5 sm:p-6 shadow-pop"
          aria-label="Assignment details"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-info-soft text-info">
              <ClipboardList size={24} />
            </span>
            <h2 className="text-base font-bold">Assignment overview</h2>
          </div>

          <dl className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <ClipboardList size={16} />
                Questions
              </dt>
              <dd className="text-sm font-bold">{assignment.questionCount}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 size={16} />
                Time limit
              </dt>
              <dd className="text-sm font-bold">
                {assignment.timeLimitMinutes} minutes
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays size={16} />
                Due date
              </dt>
              <dd className="text-sm font-bold">{assignment.dueLabel}</dd>
            </div>
          </dl>

          {submitted ? (
            <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-success-soft p-3.5 text-foreground">
              <CheckCircle2 size={20} className="shrink-0 text-success" />
              <div>
                <strong className="block text-xs font-bold">
                  Assignment submitted
                </strong>
                <p className="text-xs text-muted-foreground">
                  Your answers have been securely recorded.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Review the instructions before opening the assignment.
              </p>
              {assignment.samplePaper ? (
                <Button
                  className="w-full min-h-[46px] justify-between rounded-xl font-bold bg-primary text-foreground hover:bg-primary-hover shadow-pop-sm"
                  asChild
                >
                  <Link href={`/student/assignments/${assignment.id}`}>
                    Start assignment
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full min-h-[46px] justify-between rounded-xl font-bold bg-primary text-foreground hover:bg-primary-hover shadow-pop-sm"
                >
                  <Link href={`/student/assignments/${assignment.id}`}>
                    {assignment.status === "IN_PROGRESS"
                      ? "Continue assignment"
                      : "Start assignment"}
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            <ShieldCheck size={14} />
            Verified assignment
          </div>
        </aside>
      </div>
    </div>
  );
}

