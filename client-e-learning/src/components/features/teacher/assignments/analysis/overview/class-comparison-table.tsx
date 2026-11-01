"use client";

import { useTranslations } from "next-intl";
import type { ClassComparisonRow } from "@/types/assignment-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function pct(v: number | null) {
  return v == null ? "—" : `${(v * (v <= 1 ? 100 : 1)).toFixed(0)}%`;
}

/** Accepts either 0–1 or 0–100 rates from backend. */
function rateLabel(v: number | null) {
  if (v == null) return "—";
  const n = v <= 1 ? v * 100 : v;
  return `${n.toFixed(0)}%`;
}

export function ClassComparisonTable({
  rows,
  onSelectClass,
}: {
  rows: ClassComparisonRow[];
  onSelectClass?: (classId: number) => void;
}) {
  const t = useTranslations("teacher.analytics.classComparison");

  if (!rows.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2 pr-2 font-medium">{t("class")}</th>
              <th className="py-2 pr-2 font-medium">{t("assigned")}</th>
              <th className="py-2 pr-2 font-medium">{t("submissionRate")}</th>
              <th className="py-2 pr-2 font-medium">{t("average")}</th>
              <th className="py-2 pr-2 font-medium">{t("median")}</th>
              <th className="py-2 pr-2 font-medium">{t("accuracy")}</th>
              <th className="py-2 font-medium">{t("overallBand")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.classId} className="border-b border-border/60">
                <td className="py-2 pr-2">
                  {onSelectClass ? (
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => onSelectClass(row.classId)}
                    >
                      {row.className}
                    </button>
                  ) : (
                    row.className
                  )}
                </td>
                <td className="py-2 pr-2 tabular-nums">{row.assignedCount}</td>
                <td className="py-2 pr-2 tabular-nums">
                  {rateLabel(row.submissionRate)}
                  <span className="text-muted-foreground"> ({row.submittedCount})</span>
                </td>
                <td className="py-2 pr-2 tabular-nums">{rateLabel(row.averagePercent)}</td>
                <td className="py-2 pr-2 tabular-nums">{rateLabel(row.medianPercent)}</td>
                <td className="py-2 pr-2 tabular-nums">{rateLabel(row.accuracyPercent)}</td>
                <td className="py-2">
                  {row.overallBand ? t(`band.${row.overallBand}`) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
