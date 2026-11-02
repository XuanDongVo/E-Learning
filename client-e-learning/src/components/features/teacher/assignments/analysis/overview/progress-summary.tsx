"use client";

import { useTranslations } from "next-intl";
import type { ProgressCounts } from "@/types/assignment-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KEYS: (keyof ProgressCounts)[] = [
  "assigned",
  "notStarted",
  "inProgress",
  "submitted",
  "timedOut",
  "late",
  "overdue",
];

export function ProgressSummary({ progress }: { progress: ProgressCounts }) {
  const t = useTranslations("teacher.analytics.progress");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {KEYS.map((key) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center"
            >
              <p className="text-lg font-semibold tabular-nums">{progress[key] as number}</p>
              <p className="text-xs text-muted-foreground">{t(key)}</p>
            </div>
          ))}
        </div>
        {progress.submissionRate != null ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("submissionRate")}:{" "}
            <span className="font-medium text-foreground">
              {(progress.submissionRate * 100).toFixed(0)}%
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
