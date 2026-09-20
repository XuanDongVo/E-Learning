import { ChevronRight, ArrowLeft } from "lucide-react";

import type { ContentView } from "@/types/content";
import { contentGrades, contentQuestionBanks, contentSections, contentTopics, contentUnits } from "@/mock/content";

interface ContentBreadcrumbsProps {
  view: ContentView;
  onNavigate: (view: ContentView) => void;
  onBack: () => void;
}

const breadcrumbs: Record<ContentView, { label: string; view?: ContentView }[]> = {
  overview: [{ label: "Content" }],
  unit: [
    { label: "Content", view: "overview" },
    { label: contentGrades[0] },
    { label: `${contentUnits[1].code} - ${contentUnits[1].name}` },
  ],
  section: [
    { label: "Content", view: "overview" },
    { label: contentGrades[0] },
    { label: contentUnits[1].code, view: "unit" },
    { label: contentSections[0].name },
  ],
  topic: [
    { label: "Content", view: "overview" },
    { label: contentGrades[0] },
    { label: contentUnits[1].code, view: "unit" },
    { label: contentSections[0].name, view: "section" },
    { label: contentTopics[0].name },
  ],
  bank: [
    { label: "Content", view: "overview" },
    { label: contentGrades[0] },
    { label: contentUnits[1].code, view: "unit" },
    { label: contentSections[0].name, view: "section" },
    { label: contentTopics[0].name, view: "topic" },
    { label: contentQuestionBanks[0].name },
  ],
  question: [
    { label: "Content", view: "overview" },
    { label: contentGrades[0] },
    { label: contentUnits[1].code, view: "unit" },
    { label: contentSections[0].name, view: "section" },
    { label: contentTopics[0].name, view: "topic" },
    { label: contentQuestionBanks[0].name, view: "bank" },
    { label: "Edit Question" },
  ],
};

export function ContentBreadcrumbs({ view, onNavigate, onBack }: ContentBreadcrumbsProps) {

    if (view === "overview") {
        return null;
    }

  return (
    <div className="mb-5 flex items-center gap-3 text-body-sm">
        <button className="flex items-center gap-1 text-primary" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={13} />
          Back
        </button>
      <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
        {breadcrumbs[view].map((item, index) => (
          <span className="flex shrink-0 items-center gap-1.5" key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight size={12} />}
            {item.view ? (
              <button className="text-slate-400 hover:text-primary" onClick={() => onNavigate(item.view!)}>
                {item.label}
              </button>
            ) : (
              <span className={index === breadcrumbs[view].length - 1 ? "font-semibold text-primary" : ""}>{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}