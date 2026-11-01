"use client";

import type { AnalysisTab } from "./types";
import { ANALYSIS_TABS } from "./types";

const LABELS: Record<AnalysisTab, { title: string; subtitle: string }> = {
  overview: { title: "Tổng quan", subtitle: "Cả lớp làm thế nào?" },
  questions: { title: "Theo câu hỏi", subtitle: "Câu nào sai nhiều, sai vì sao?" },
  sections: { title: "Theo phần", subtitle: "Yếu dạng bài nào?" },
  students: { title: "Học sinh", subtitle: "Em nào cần chú ý?" },
  classes: { title: "Theo lớp", subtitle: "Lớp nào khác lớp nào?" },
};

export function AnalysisTabs({
  value,
  onChange,
}: {
  value: AnalysisTab;
  onChange: (tab: AnalysisTab) => void;
}) {
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
              <span className="block text-sm font-semibold">{LABELS[tab].title}</span>
              <span className="block text-[11px] font-normal opacity-80">{LABELS[tab].subtitle}</span>
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <span className="inline-flex size-4 items-center justify-center rounded-full border text-[10px]">i</span>
        Cách tính chỉ số
      </button>
    </div>
  );
}
