"use client";

import { useTranslations } from "next-intl";
import type { ScoreSummary as ScoreSummaryType } from "@/types/assignment-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function pct(v: number | null) {
  return v == null ? "—" : `${v.toFixed(0)}%`;
}

export function ScoreSummaryCard({ score }: { score: ScoreSummaryType }) {
  const t = useTranslations("teacher.analytics.score");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {t("gradedCount", { count: score.gradedAttemptCount })}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["average", score.averagePercent],
              ["median", score.medianPercent],
              ["highest", score.highestPercent],
              ["lowest", score.lowestPercent],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">{t(key)}</p>
              <p className="text-lg font-semibold tabular-nums">{pct(value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
