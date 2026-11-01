"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ANALYSIS_TABS, type AnalysisTab } from "./types";

export function AnalysisTabs({
  value,
  onChange,
}: {
  value: AnalysisTab;
  onChange: (tab: AnalysisTab) => void;
}) {
  const t = useTranslations("teacher.analytics.tabs");

  return (
    <div className="flex border-b border-border">
      {ANALYSIS_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors",
            value === tab
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(tab)}
          {value === tab ? (
            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
