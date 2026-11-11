"use client";

import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TAB_ITEMS, type HubTab } from "./vocabulary-hub-types";

interface VocabularyHubHeaderProps {
  currentTab: HubTab;
  dueCount: number;
  onSelectTab: (tab: HubTab) => void;
  progress?: {
    learned: number;
    total: number;
  };
  streakXp?: number;
}

export function VocabularyHubHeader({
  currentTab,
  dueCount,
  onSelectTab,
}: VocabularyHubHeaderProps) {
  return (
    <header className="student-vocab-hub-header flex flex-wrap items-center gap-3 py-3">
      <div className="flex items-center">
        <Link
          href="/student/vocabulary"
          aria-label="Quay lại tất cả bộ từ"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--student-mustard)] text-[var(--student-ink)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-white hover:shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>

      <nav
        role="tablist"
        aria-label="Chế độ học từ vựng"
        className="student-vocab-hub-tabs inline-flex min-w-0 items-center justify-center gap-1 p-1"
      >
        {TAB_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = currentTab === key;

          return (
            <button
              type="button"
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(key)}
              className={`student-vocab-hub-tab inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-4 py-2 student-control ${
                isActive ? "student-filter-active" : "student-control--quiet"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>

              {key === "review" && dueCount > 0 && (
                <span
                  className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {dueCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="h-9 w-9 shrink-0" aria-hidden="true" />
    </header>
  );
}
