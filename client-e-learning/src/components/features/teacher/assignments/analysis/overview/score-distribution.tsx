"use client";

import { useTranslations } from "next-intl";
import type { ScoreBucket } from "@/types/assignment-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ScoreDistribution({ buckets }: { buckets: ScoreBucket[] }) {
  const t = useTranslations("teacher.analytics.score");
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("distribution")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end gap-1">
          {buckets.map((b) => (
            <div
              key={`${b.fromPercent}-${b.toPercent}`}
              className="flex flex-1 flex-col items-center gap-1"
              title={`${b.fromPercent}–${b.toPercent}%: ${b.count}`}
            >
              <div
                className="w-full rounded-t bg-primary/80"
                style={{ height: `${(b.count / max) * 100}%`, minHeight: b.count ? 4 : 0 }}
              />
              <span className="text-[10px] text-muted-foreground">{b.fromPercent}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
