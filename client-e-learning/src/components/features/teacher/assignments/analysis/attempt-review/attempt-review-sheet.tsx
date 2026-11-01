"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { RegionState } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { assignmentAnalysisService } from "@/services/assignment/assignment-analysis.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { AttemptReviewQuestion, QuestionOutcomeStatus } from "@/types/assignment-analysis";

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function OutcomeBadge({ status }: { status: QuestionOutcomeStatus }) {
  const t = useTranslations("teacher.analytics.review");
  const styles: Record<QuestionOutcomeStatus, string> = {
    CORRECT: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
    INCORRECT: "bg-rose-50 text-rose-700 border-rose-200",
    UNANSWERED: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {t(`outcome.${status}`)}
    </span>
  );
}

function QuestionBlock({ q }: { q: AttemptReviewQuestion }) {
  const t = useTranslations("teacher.analytics.review");
  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            #{q.position}
            {q.sectionTitle ? ` · ${q.sectionTitle}` : ""}
            {q.isExample ? ` · ${t("example")}` : ""}
          </p>
          <p className="text-sm font-medium">{q.prompt || t("noPrompt")}</p>
          <p className="text-xs text-muted-foreground">{q.questionType}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <OutcomeBadge status={q.outcome} />
          <span className="text-xs tabular-nums text-muted-foreground">
            {q.earnedPoints}/{q.possiblePoints}
          </span>
        </div>
      </div>
      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="mb-1 font-medium text-muted-foreground">{t("studentAnswer")}</p>
          <pre className="whitespace-pre-wrap break-all font-sans">
            {q.studentAnswer == null
              ? "—"
              : typeof q.studentAnswer === "string"
                ? q.studentAnswer
                : JSON.stringify(q.studentAnswer, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="mb-1 font-medium text-muted-foreground">{t("correctAnswer")}</p>
          <pre className="whitespace-pre-wrap break-all font-sans">
            {q.correctAnswer == null
              ? "—"
              : typeof q.correctAnswer === "string"
                ? q.correctAnswer
                : JSON.stringify(q.correctAnswer, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function AttemptReviewSheet({
  assignmentId,
  studentId,
  open,
  onOpenChange,
}: {
  assignmentId: number;
  studentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("teacher.analytics.review");
  const enabled = open && studentId != null;

  const query = useQuery({
    queryKey: QUERY_KEYS.teacherAssignmentAttemptReview(assignmentId, studentId ?? 0),
    queryFn: () => assignmentAnalysisService.getAttemptReview(assignmentId, studentId!),
    enabled,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        {!enabled ? null : query.isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : query.isError ? (
          <div className="mt-4">
            <RegionState
              variant="error"
              title={t("loadError")}
              action={
                <button type="button" className="text-sm text-primary" onClick={() => query.refetch()}>
                  {t("retry")}
                </button>
              }
            />
          </div>
        ) : query.data ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border p-3 text-sm space-y-1">
              <p className="font-semibold">{query.data.studentName}</p>
              <p className="text-muted-foreground">
                {query.data.className} · {query.data.lifecycleStatus}
                {query.data.deadlineState !== "NONE" ? ` · ${query.data.deadlineState}` : ""}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">
                  {query.data.scorePercent != null
                    ? `${query.data.scorePercent}%`
                    : "—"}{" "}
                  ({query.data.earnedPoints}/{query.data.possiblePoints})
                </Badge>
                <Badge variant="outline">{formatDuration(query.data.durationSeconds)}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              {query.data.questions.map((q) => (
                <QuestionBlock key={q.questionId} q={q} />
              ))}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
