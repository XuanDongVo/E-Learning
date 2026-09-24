"use client";

import { useState } from "react";
import { ContentOverview } from "./content-overview";
import { UnitDetail } from "./unit-detail";
import { SectionDetail } from "./section-detail";
import { TopicDetail } from "./topic-detail";
import { QuestionBankDetail } from "./question-bank-detail";
import { QuestionEditor } from "./question-editor";
import type { ContentView } from "@/types/content";
import { BulkCreateQuestions } from "./components/bulk-create-question";
import { ImportQuestions } from "./components/import-question";

interface ContentLocation {
  view: ContentView;
  id?: number;
}

export function ContentPage() {
  const [location, setLocation] = useState<ContentLocation>({
    view: "overview",
  });
  const [, setHistory] = useState<ContentLocation[]>([]);
  const navigate = (view: ContentView, id?: number) => {
    setHistory((current) => [...current, location]);
    setLocation({ view, id });
  };
  const goBack = () =>
    setHistory((current) => {
      const previous = current.at(-1) ?? { view: "overview" as ContentView };
      setLocation(previous);
      return current.slice(0, -1);
    });
  const content = (() => {
    switch (location.view) {
      case "overview":
        return <ContentOverview onNavigate={navigate} />;
      case "unit":
        return location.id ? (
          <UnitDetail unitId={location.id} onNavigate={navigate} />
        ) : null;
      case "section":
        return location.id ? (
          <SectionDetail sectionId={location.id} onNavigate={navigate} />
        ) : null;
      case "topic":
        return location.id ? (
          <TopicDetail topicId={location.id} onNavigate={navigate} />
        ) : null;
      case "bank":
        return (
          <QuestionBankDetail
            bankId={location.id}
            onNavigate={(view) => navigate(view)}
          />
        );
      case "question":
        return <QuestionEditor onNavigate={(view) => navigate(view)} />;
      case "bulk-create":
        return <BulkCreateQuestions onNavigate={(view) => navigate(view)} />;
      case "import":
        return <ImportQuestions onNavigate={(view) => navigate(view)} />;
    }
  })();
  return (
    <div className="space-y-6">
      {location.view !== "overview" && (
        <button onClick={goBack} className="text-sm font-medium text-primary">
          Back to previous
        </button>
      )}
      {content}
    </div>
  );
}
