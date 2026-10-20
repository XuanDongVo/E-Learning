"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ContentView } from "@/types/content";
import { ContentOverview } from "./content-overview";
import { UnitDetail } from "./unit-detail";
import { SectionDetail } from "./section-detail";
import { TopicDetail } from "./topic-detail";
import { QuestionBankDetail } from "./question-bank-detail";
import { QuestionEditor } from "./question-editor";
import { BulkQuestionCreator } from "./components/bulk-create-question";
import { ImportQuestions } from "./components/import-question";

type ContentRoutePageProps = {
  view: ContentView;
  id?: number;
};

const contentPaths: Record<Exclude<ContentView, "overview" | "bulk-create" | "import">, string> = {
  unit: "/teacher/content/units",
  section: "/teacher/content/sections",
  topic: "/teacher/content/topics",
  bank: "/teacher/content/question-banks",
  question: "/teacher/content/questions",
};

export function ContentRoutePage({ view, id }: ContentRoutePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const navigate = (nextView: ContentView, nextId?: number, bankName?: string) => {
    if (nextView === "overview") {
      router.push("/teacher/content");
      return;
    }

    if (nextView === "bulk-create") {
      if (!nextId) return;
      router.push(`/teacher/content/question-banks/${nextId}?mode=bulk-create`);
      return;
    }

    if (nextView === "import") {
      const bankId = nextId ?? id;
      if (!bankId) return;
      router.push(`/teacher/content/question-banks/${bankId}?mode=import`);
      return;
    }

    if (nextView === "bank" && !nextId && view === "question") {
      return;
    }

    const basePath = contentPaths[nextView];
    if (!basePath) return;

    if (nextId) {
      const query = nextView === "question" && bankName
        ? `?bankName=${encodeURIComponent(bankName)}`
        : "";
      router.push(`${basePath}/${nextId}${query}`);
      return;
    }

    router.push(basePath);
  };

  const renderRoute = () => {
    if (view === "overview") {
      return <ContentOverview onNavigate={navigate} />;
    }

    if (!id) {
      return (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Missing content identifier.
        </div>
      );
    }

    if (view === "unit") {
      return <UnitDetail unitId={id} onNavigate={navigate} />;
    }

    if (view === "section") {
      return <SectionDetail sectionId={id} onNavigate={navigate} />;
    }

    if (view === "topic") {
      return <TopicDetail topicId={id} onNavigate={navigate} />;
    }

    if (view === "bank") {
      if (mode === "bulk-create") {
        return (
          <BulkQuestionCreator
            bankId={id}
            bankName=""
            onNavigate={navigate}
          />
        );
      }

      if (mode === "import") {
        return <ImportQuestions onNavigate={navigate} />;
      }

      return <QuestionBankDetail bankId={id} onNavigate={navigate} />;
    }

    const bankName = searchParams.get("bankName") ?? undefined;
    return (
      <QuestionEditor
        questionId={id}
        bankName={bankName}
        onNavigate={navigate}
      />
    );
  };

  return <div className="space-y-6">{renderRoute()}</div>;
}
