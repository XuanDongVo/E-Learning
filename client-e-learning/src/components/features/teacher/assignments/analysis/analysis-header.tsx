"use client";

import { ArrowLeft, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AssignmentAnalysisSummary } from "@/types/assignment-analysis";

export function AnalysisHeader({
  summary,
}: {
  summary: AssignmentAnalysisSummary | null;
}) {
  const t = useTranslations("teacher.analytics");
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => router.push("/teacher/assignments")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t("backToList")}</span>
        </Button>
        <BarChart3 className="h-5 w-5 shrink-0 text-primary" />
        <h1 className="truncate text-base font-semibold sm:text-lg">
          {t("title")}
          {summary?.title ? (
            <span className="text-muted-foreground"> · {summary.title}</span>
          ) : null}
        </h1>
      </div>
      {summary?.dueAt ? (
        <p className="hidden shrink-0 text-xs text-muted-foreground md:block">
          {t("dueAt")}: {new Date(summary.dueAt).toLocaleString()}
        </p>
      ) : null}
    </header>
  );
}
