"use client";

import { ArrowRight, Clock3, Lightbulb, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StudentDataList } from "@/components/student-ui/data-list/student-data-list";
import { StudentDataListItem } from "@/components/student-ui/data-list/student-data-list-item";
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
    <StudentDataList density="comfortable">
      {items.map((session) => (
        <StudentDataListItem
          key={session.sessionId}
          leading={<Clock3 className="size-4" aria-hidden="true" />}
          content={
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-sm font-bold text-foreground">
                {label("session", { id: session.sessionId })}
              </h3>
              <span className="student-chip">{label(`modes.${session.mode}`)}</span>
              <span className="student-chip">{label(`statuses.${session.status}`)}</span>
            </div>
          }
          metadata={
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                {dateFormatter.format(new Date(session.completedAt))}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="size-3.5 text-success" aria-hidden="true" />
                  {label("questions", {
                    correct: session.finalCorrectCount,
                    total: session.totalQuestions,
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Lightbulb className="size-3.5 text-warning" aria-hidden="true" />
                  {label("hints", { count: session.hintUsedCount })}
                </span>
                {session.earnedXp != null && (
                  <span className="font-semibold text-primary">
                    {label("xp", { count: session.earnedXp })}
                  </span>
                )}
              </div>
            </div>
          }
          trailing={
            <span className="whitespace-nowrap text-sm font-bold text-foreground">
              {session.score == null
                ? label("noScore")
                : label("score", { score: Math.round(session.score) })}
            </span>
          }
          actions={
            <Link
              href={`/student/activity-sessions/${session.sessionId}/review`}
              aria-label={label("openReview", { id: session.sessionId })}
              className="student-control student-control--secondary inline-flex min-h-11 items-center gap-1.5 px-3"
            >
              <span className="hidden sm:inline">{label("openHistory")}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
      ))}
    </StudentDataList>
  );
}
