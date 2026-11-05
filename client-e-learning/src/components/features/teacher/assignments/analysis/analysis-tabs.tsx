"use client";

import { useTranslations } from "next-intl";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Info,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { AnalysisTab } from "./types";
import { ANALYSIS_TABS } from "./types";

const TAB_ICONS: Record<AnalysisTab, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  questions: HelpCircle,
  sections: BookOpen,
  students: Users,
  classes: GraduationCap,
};

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
    <div className="flex flex-col gap-2 border-b border-border bg-background sm:flex-row sm:items-end sm:justify-between">
      {/* Danh sách các Tab (Hỗ trợ scroll ngang mượt mà trên mobile) */}
      <nav
        role="tablist"
        aria-label="Phân tích bài tập"
        className="-mb-px flex gap-1 overflow-x-auto pb-0.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        {ANALYSIS_TABS.map((tab) => {
          const active = tab === value;
          const Icon = TAB_ICONS[tab] || BarChart3;

          return (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(tab)}
              className={`group relative flex shrink-0 items-start gap-2.5 rounded-t-lg border-b-2 px-3.5 py-2.5 text-left transition-all duration-150 ${
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span
                className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-md transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
              </span>

              <div className="min-w-0 pr-1">
                <span
                  className={`block text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                    active ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {labels[tab].title}
                </span>
                <span className="block text-[11px] font-normal text-muted-foreground/80 line-clamp-1">
                  {labels[tab].subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Ghi chú chỉ số phân tích ở góc phải */}
      <div className="hidden pb-2.5 sm:flex sm:items-center">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
          <Info className="size-3.5 text-primary shrink-0" />
          <span>{t("metricsInfo")}</span>
        </span>
      </div>
    </div>
  );
}
