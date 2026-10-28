import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Flame,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentAssignmentItem } from "./types";
import { ASSIGNMENT_STATUS_LABEL } from "./constants";

interface AssignmentCardProps {
  assignment: StudentAssignmentItem;
  index?: number;
}

const CARD_TONES = [
  {
    header: "bg-primary-soft border-primary/30",
    iconBg: "bg-primary text-primary-foreground",
  },
  {
    header: "bg-teal-soft border-teal/30",
    iconBg: "bg-teal text-white",
  },
  {
    header: "bg-pink-soft border-pink/30",
    iconBg: "bg-pink text-white",
  },
] as const;

function getCardTone(assignmentId: number | string, index = 0) {
  const numericId = typeof assignmentId === "number" ? assignmentId : Number(assignmentId);
  const seed = Number.isFinite(numericId) ? Math.abs(numericId) : index;
  return CARD_TONES[seed % CARD_TONES.length];
}

export function AssignmentCard({ assignment, index = 0 }: AssignmentCardProps) {
  const urgent = assignment.status !== "SUBMITTED" && assignment.dueInDays <= 2;
  const done = assignment.status === "SUBMITTED";
  const tone = getCardTone(assignment.id, index);

  return (
    <article
      className={cn(
        "relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-pop-lg",
        done && "bg-card/95",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-16 border-b-2 border-dashed",
          tone.header,
        )}
      />

      <div className="relative z-10 mb-2 flex items-start justify-between">
        <span
          className={cn(
            "grid h-12 w-12 place-items-center rounded-2xl border-2 border-foreground shadow-pop-sm -rotate-6",
            done
              ? "bg-accent text-foreground"
              : tone.iconBg,
          )}
        >
          {done ? (
            <Trophy size={22} />
          ) : assignment.status === "IN_PROGRESS" ? (
            <Zap size={22} />
          ) : (
            <ClipboardList size={22} />
          )}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border-1.5 border-foreground bg-card px-2.5 py-1 text-xs font-extrabold shadow-xs",
            done && "bg-success-soft text-foreground",
            urgent && "bg-primary text-foreground",
            !done && !urgent && assignment.status === "IN_PROGRESS" && "bg-accent-soft text-foreground",
          )}
        >
          {done ? (
            <>
              <CheckCircle2 size={14} className="text-success" />
              Submitted
            </>
          ) : urgent ? (
            <>
              <Flame size={14} className="text-primary-hover" />
              Due in {assignment.dueInDays} days
            </>
          ) : (
            ASSIGNMENT_STATUS_LABEL[assignment.status]
          )}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <h2 className="text-lg font-bold leading-snug mt-1">
          <Link
            href="/student/assignments/$assignmentId"
            className="hover:underline hover:decoration-2"
          >
            {assignment.title}
          </Link>
        </h2>

        <div className="my-3 flex flex-wrap gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-semibold text-muted-foreground">
            <ClipboardList size={13} />
            {assignment.questionCount} questions
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-semibold text-muted-foreground">
            <Clock3 size={13} />
            {assignment.timeLimitMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-semibold text-muted-foreground">
            <CalendarDays size={13} />
            {assignment.dueLabel}
          </span>
        </div>

        {/* Action Link Button */}
        <Link
          href="/student/assignments/$assignmentId"
          className={cn(
            "mt-auto flex min-h-[46px] items-center justify-between rounded-xl border-2 border-foreground px-4 text-sm font-extrabold shadow-[0_3px_0_var(--foreground)] transition-all hover:bg-primary-hover active:translate-y-1 active:shadow-none cursor-pointer",
            done
              ? "bg-card text-foreground hover:bg-muted"
              : "bg-primary text-foreground",
          )}
        >
          <span>
            {done
              ? "View details"
              : assignment.status === "IN_PROGRESS"
                ? "Continue"
                : "Start"}
          </span>
          <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}

