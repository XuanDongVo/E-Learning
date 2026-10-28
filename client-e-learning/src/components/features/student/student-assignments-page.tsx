"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FileText,
  Flame,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  STUDENT_ASSIGNMENTS,
  type StudentAssignmentPreview,
  type StudentAssignmentStatus,
} from "@/mock/student-assignments";
import { cn } from "@/lib/utils";

type AssignmentFilter = "ALL" | StudentAssignmentStatus;

const FILTERS: { value: AssignmentFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "SUBMITTED", label: "Submitted" },
];

function PipoMascot({ mood = "wave", size = 116 }: { mood?: "wave" | "think" | "celebrate"; size?: number }) {
  const smile = mood === "celebrate" ? "M78 105Q90 132 103 105Z" : mood === "think" ? "M84 108Q90 102 96 108" : "M79 105Q90 125 102 105Z";

  return (
    <div className="relative shrink-0" aria-label="Pipo mascot" role="img">
      <svg width={size} height={size} viewBox="0 0 180 180" fill="none" aria-hidden="true">
        <g stroke="#2b2220" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M90 39V20" />
          <path d="M89 27C67 30 62 9 63 8C85 5 92 15 89 27Z" fill="#2f9a5e" />
          <path d="M92 25C91 5 108 2 120 5C117 21 106 29 92 25Z" fill="#2f9a5e" />
          <path d="M34 98C4 77 3 112 29 119Z" fill="#f0652f" />
          <path d="M146 96C163 67 179 77 166 108L146 119Z" fill="#f0652f" />
          <path d="M56 149L52 163Q67 172 77 160L79 149M105 148L104 162Q119 173 130 162L125 148" fill="#f0652f" />
          <path d="M89 35C112 35 119 41 137 63C167 100 161 142 135 152C112 165 64 165 42 151C15 136 21 100 41 69C58 46 67 35 89 35Z" fill="#f0652f" />
          <ellipse cx="90" cy="128" rx="35" ry="24" fill="#fffdf8" />
          <ellipse cx="63" cy="85" rx="15" ry="18" fill="#fffdf8" />
          <ellipse cx="117" cy="85" rx="15" ry="18" fill="#fffdf8" />
          <ellipse cx="65" cy="87" rx="7" ry="10" fill="#2b2220" stroke="none" />
          <ellipse cx="119" cy="87" rx="7" ry="10" fill="#2b2220" stroke="none" />
          <circle cx="67" cy="82" r="3" fill="#fffdf8" stroke="none" />
          <circle cx="121" cy="82" r="3" fill="#fffdf8" stroke="none" />
          <ellipse cx="46" cy="106" rx="9" ry="5" fill="#f6a8a8" stroke="none" />
          <ellipse cx="136" cy="106" rx="9" ry="5" fill="#f6a8a8" stroke="none" />
          <path d={smile} fill={mood === "think" ? "none" : "#2b2220"} strokeLinecap="round" />
          {mood === "celebrate" && <path d="M25 38L31 25L38 36L50 29L47 43M137 34L148 25L149 39L162 40" stroke="#f0a81c" strokeWidth="4" />}
        </g>
      </svg>
    </div>
  );
}

function getDueInfo(dueAt: string, now: number) {
  const dueTime = new Date(dueAt).getTime();
  const difference = dueTime - now;
  const days = Math.ceil(difference / (24 * 60 * 60 * 1000));

  if (difference < 0) {
    return { label: "Past due", days, urgent: false, overdue: true };
  }
  if (days <= 2) {
    return { label: days <= 1 ? "Due today" : "Due tomorrow", days, urgent: true, overdue: false };
  }
  return {
    label: `Due ${new Date(dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    days,
    urgent: false,
    overdue: false,
  };
}

function AssignmentStatusIcon({ status }: { status: StudentAssignmentStatus }) {
  if (status === "SUBMITTED") return <CheckCircle2 size={14} />;
  if (status === "IN_PROGRESS") return <Clock3 size={14} />;
  return <FileText size={14} />;
}

function AssignmentCard({ assignment, now }: { assignment: StudentAssignmentPreview; now: number }) {
  const due = getDueInfo(assignment.dueAt, now);
  const submitted = assignment.status === "SUBMITTED";
  const inProgress = assignment.status === "IN_PROGRESS";

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-border-color bg-card-bg p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
        submitted && "bg-card-bg/90",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          submitted ? "bg-success-soft text-success" : inProgress ? "bg-info-soft text-info" : "bg-primary-light text-primary",
        )}>
          {submitted ? <Trophy size={23} /> : inProgress ? <Zap size={23} /> : <ClipboardList size={23} />}
        </div>
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
          submitted ? "bg-success-soft text-success" : inProgress ? "bg-info-soft text-info" : due.urgent ? "bg-accent/20 text-accent-foreground" : due.overdue ? "bg-destructive/10 text-destructive" : "bg-secondary text-neutral-muted",
        )}>
          {submitted ? <CheckCircle2 size={14} /> : due.urgent && !inProgress ? <Flame size={14} /> : <AssignmentStatusIcon status={assignment.status} />}
          {submitted ? "Submitted" : inProgress ? "In progress" : due.label}
        </span>
      </div>

      <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-bold text-neutral-dark">
        <BookOpen size={13} />{assignment.unitName}
      </span>
      <h2 className="mt-3 text-lg font-extrabold leading-snug text-neutral-dark">{assignment.title}</h2>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-neutral-muted">
        <span className="inline-flex items-center gap-1.5"><ClipboardList size={15} />{assignment.questionCount} questions</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 size={15} />{assignment.timeLimitMinutes} min</span>
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />{due.label}</span>
      </div>

      {inProgress && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-bold">
            <span className="text-primary">In progress</span>
            <span className="text-neutral-muted">{assignment.progressPercent ?? 0}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${assignment.progressPercent ?? 0}%` }} />
          </div>
        </div>
      )}

      <div className="mt-auto pt-5">
        <button
          type="button"
          disabled
          title="Assignment detail and attempt flows are outside this preview."
          className={cn(
            "flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold opacity-75",
            submitted ? "border border-border-color bg-secondary text-neutral-dark" : "bg-primary text-primary-foreground",
          )}
        >
          {submitted ? "View details (preview only)" : inProgress ? "Continue (preview only)" : "Start (preview only)"}
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}

export function StudentAssignmentsPage() {
  const [filter, setFilter] = useState<AssignmentFilter>("ALL");
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("all");
  const [now] = useState(() => Date.now());

  const units = useMemo(() => [...new Set(STUDENT_ASSIGNMENTS.map((assignment) => assignment.unitName))], []);
  const filteredAssignments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return STUDENT_ASSIGNMENTS.filter((assignment) => {
      const matchesStatus = filter === "ALL" || assignment.status === filter;
      const matchesUnit = unit === "all" || assignment.unitName === unit;
      const matchesQuery = !normalizedQuery ||
        assignment.title.toLocaleLowerCase().includes(normalizedQuery) ||
        assignment.unitName.toLocaleLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesUnit && matchesQuery;
    });
  }, [filter, query, unit]);

  const todoCount = STUDENT_ASSIGNMENTS.filter((assignment) => assignment.status !== "SUBMITTED").length;
  const countFor = (value: AssignmentFilter) => value === "ALL"
    ? STUDENT_ASSIGNMENTS.length
    : STUDENT_ASSIGNMENTS.filter((assignment) => assignment.status === value).length;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 pb-24 sm:px-6 lg:space-y-7 lg:px-8 lg:py-8">
      <header className="relative flex flex-col overflow-hidden rounded-3xl border border-border-color bg-card-bg p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-7">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/5" aria-hidden="true" />
        <div className="relative z-10 order-2 flex-1 sm:order-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-primary"><Sparkles size={15} />Your assignments</span>
          <h1 className="mt-2 max-w-2xl text-2xl font-extrabold tracking-tight text-neutral-dark sm:text-3xl">
            {todoCount > 0 ? <>You have <span className="text-primary">{todoCount} assignments</span> waiting!</> : "All done — great job!"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-muted sm:text-base">Pick one, focus, and show what you know. Your next step starts here.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-primary-light px-3 py-1.5 text-primary">{todoCount} to do</span>
            <span className="rounded-full bg-success-soft px-3 py-1.5 text-success">{STUDENT_ASSIGNMENTS.length - todoCount} submitted</span>
          </div>
        </div>
        <div className="relative z-10 order-1 mx-auto sm:order-2 sm:mx-0">
          <PipoMascot mood={todoCount > 0 ? "wave" : "celebrate"} size={124} />
        </div>
      </header>

      <section aria-label="Filter assignments" className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-1 rounded-2xl border border-border-color bg-secondary p-1" role="tablist" aria-label="Assignment status">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                onClick={() => setFilter(item.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors sm:px-4",
                  filter === item.value ? "bg-card-bg text-neutral-dark shadow-sm" : "text-neutral-muted hover:text-neutral-dark",
                )}
              >
                {item.label}
                <span className={cn("rounded-md px-1.5 py-0.5 text-xs", filter === item.value ? "bg-primary-light text-primary" : "bg-card-bg/70 text-neutral-muted")}>{countFor(item.value)}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-muted" />
            <Input
              aria-label="Search assignments"
              placeholder="Search assignments…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-xl border-border-color bg-card-bg pl-10 text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" aria-label="Filter by unit">
          <span className="mr-1 text-xs font-extrabold uppercase tracking-wide text-neutral-muted">Units</span>
          {["all", ...units].map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={unit === item}
              onClick={() => setUnit(item)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                unit === item ? "border-primary bg-primary-light text-primary" : "border-border-color bg-card-bg text-neutral-muted hover:border-primary/40 hover:text-neutral-dark",
              )}
            >
              <BookOpen size={13} />{item === "all" ? "All units" : item}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-muted" aria-live="polite">
          {filteredAssignments.length} {filteredAssignments.length === 1 ? "assignment" : "assignments"}
        </p>
        {(query || unit !== "all" || filter !== "ALL") && (
          <button type="button" className="text-sm font-bold text-primary hover:underline" onClick={() => { setQuery(""); setUnit("all"); setFilter("ALL"); }}>
            Clear filters
          </button>
        )}
      </div>

      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAssignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} now={now} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border-color bg-card-bg px-6 py-12 text-center">
          <PipoMascot mood="think" size={108} />
          <h2 className="mt-3 text-lg font-extrabold text-neutral-dark">No assignments found</h2>
          <p className="mt-1 max-w-sm text-sm text-neutral-muted">Try another title or unit, or clear your filters to see all assignments.</p>
          <button type="button" onClick={() => { setQuery(""); setUnit("all"); setFilter("ALL"); }} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            Clear filters
          </button>
        </div>
      )}

      <p className="flex items-center justify-center gap-2 pb-2 text-xs font-medium text-neutral-muted"><span className="h-1.5 w-1.5 rounded-full bg-success" />Sample assignments · Dates and statuses are for preview only.</p>
    </main>
  );
}
