"use client";

import { useTranslations } from "next-intl";
import type { AnalysisTab } from "./types";
import { ANALYSIS_TABS } from "./types";

export function AnalysisTabs({
  value,
  onChange,
}: {
  value: AnalysisTab;
  onChange: (tab: AnalysisTab) => void;
}) {
  const t = useTranslations("teacher.analytics");
  const labels: Record<AnalysisTab, { title: string; subtitle: string }> = {
    overview: { title: t("tabs.overview"), subtitle: t("tabs.overviewHint") },
    questions: { title: t("tabs.questions"), subtitle: t("tabs.questionsHint") },
    sections: { title: t("tabs.sections"), subtitle: t("tabs.sectionsHint") },
    students: { title: t("tabs.students"), subtitle: t("tabs.studentsHint") },
    classes: { title: t("tabs.classes"), subtitle: t("tabs.classesHint") },
  };

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border">
      <nav className="flex flex-wrap gap-1">
        {ANALYSIS_TABS.map((tab) => {
          const active = tab === value;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`min-w-[7.5rem] px-3 pb-3 pt-1 text-left transition-colors ${
                active
                  ? "border-b-2 border-primary text-foreground"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="block text-sm font-semibold">{labels[tab].title}</span>
              <span className="block text-[11px] font-normal opacity-80">{labels[tab].subtitle}</span>
            </button>
          );
        })}
      </nav>
      <span className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <span className="inline-flex size-4 items-center justify-center rounded-full border text-[10px]">i</span>
        {t("metricsInfo")}
      </span>
    </div>
  );
}
