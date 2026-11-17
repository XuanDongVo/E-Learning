"use client";

import { ArrowRight, Clock3, Lightbulb, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import type { ActivitySessionHistoryItem } from "@/types/student/activity-session";

export function ActivityHistoryList({
  items,
  label,
}: {
  items: ActivitySessionHistoryItem[];
  label: (key: string, values?: Record<string, number>) => string;
}) {
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <ol className="relative space-y-3 border-l-2 border-dashed border-border pl-5 sm:pl-7">
      {items.map((session) => (
        <li key={session.sessionId} className="relative">
          <span
            className="absolute -left-[1.9rem] top-6 grid size-5 place-items-center rounded-full border-2 border-primary bg-card text-primary sm:-left-[2.4rem]"
            aria-hidden="true"
          >
            <Clock3 className="size-3" />
          </span>
          <PaperSurface as="article" interactive className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="student-card-title text-foreground">
                    {label("session", { id: session.sessionId })}
                  </h3>
                  <span className="student-chip">{label(`modes.${session.mode}`)}</span>
                  <span className="student-chip">{label(`statuses.${session.status}`)}</span>
                </div>
                <p className="student-meta text-muted-foreground">
                  {dateFormatter.format(new Date(session.completedAt))}
                </p>
                <div className="student-meta flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-4 text-success" aria-hidden="true" />
                    {label("questions", {
                      correct: session.finalCorrectCount,
                      total: session.totalQuestions,
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lightbulb className="size-4 text-warning" aria-hidden="true" />
                    {label("hints", { count: session.hintUsedCount })}
                  </span>
                  {session.earnedXp != null && (
                    <span className="font-bold text-primary">
                      {label("xp", { count: session.earnedXp })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                <span className="student-section-title text-foreground !text-sm">
                  {session.score == null
                    ? label("noScore")
                    : label("score", { score: Math.round(session.score) })}
                </span>
                <Link
                  href={`/student/activity-sessions/${session.sessionId}/review`}
                  aria-label={label("openReview", { id: session.sessionId })}
                  className="student-control student-control--secondary inline-flex items-center gap-2 px-4"
                >
                  {label("openHistory")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </PaperSurface>
        </li>
      ))}
    </ol>
  );
}
