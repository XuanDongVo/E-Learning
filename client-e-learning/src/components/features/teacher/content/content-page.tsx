"use client";

import { useState } from "react";

import { ContentOverview } from "./content-overview";
import { UnitDetail } from "./unit-detail";
import { SectionDetail } from "./section-detail";
import { TopicDetail } from "./topic-detail";
import { QuestionBankDetail } from "./question-bank-detail";
import { QuestionEditor } from "./question-editor";
import type { ContentView } from "@/types/content";
import { ContentBreadcrumbs } from "./components/content-breadcrumbs";


export function ContentPage() {
  const [view, setView] = useState<ContentView>("overview");
  const [, setHistory] = useState<ContentView[]>([]);

  const navigate = (nextView: ContentView) => {
    setHistory((current) => [...current, view]);
    setView(nextView);
  };

  const goBack = () => {
    setHistory((current) => {
      const previous = current.at(-1) ?? "overview";
      setView(previous);
      return current.slice(0, -1);
    });
  };

  const renderView = () => {
    switch (view) {
      case "overview":
        return <ContentOverview onNavigate={navigate} />;

      case "unit":
        return <UnitDetail onNavigate={navigate} />;

      case "section":
        return <SectionDetail onNavigate={navigate} />;

      case "topic":
        return <TopicDetail onNavigate={navigate} />;

      case "bank":
        return <QuestionBankDetail onNavigate={navigate} />;

      case "question":
        return <QuestionEditor onNavigate={navigate} />;

      default:
        return <ContentOverview onNavigate={navigate} />;
    }
  };

  return (
    <div className="space-y-6">
      <ContentBreadcrumbs view={view} onNavigate={navigate} onBack={goBack} />
      {renderView()}
    </div>
  );
}