"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type { ContentView } from "@/types/content";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { ContentOverview } from "./content-overview";
import { UnitDetail } from "./unit-detail";
import { SectionDetail } from "./section-detail";
import { TopicDetail } from "./topic-detail";
import { QuestionBankDetail } from "./question-bank-detail";
import { QuestionEditor } from "./question-editor";
import { BulkQuestionCreator } from "./components/bulk-create-question";
import { ImportQuestions } from "./components/import-question";

type ContentRoutePageProps = { view: ContentView; id?: number };

const contentPaths: Record<Exclude<ContentView, "overview" | "bulk-create" | "import">, string> = {
  unit: "/teacher/content/units",
  section: "/teacher/content/sections",
  topic: "/teacher/content/topics",
  bank: "/teacher/content/question-banks",
  question: "/teacher/content/questions",
};

function QuestionRouteBreadcrumb({ questionId, bankId }: { questionId: number; bankId?: number }) {
  const questionQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestion(questionId),
    queryFn: async () => (await contentService.getQuestion(questionId)).data,
  });
  const resolvedBankId = bankId ?? questionQuery.data?.questionBankId;
  const bankQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestionBank(resolvedBankId ?? 0),
    queryFn: async () => (await contentService.getQuestionBank(resolvedBankId!)).data,
    enabled: Boolean(resolvedBankId),
  });
  const topicQuery = useQuery({
    queryKey: QUERY_KEYS.contentTopic(bankQuery.data?.topicId ?? 0),
    queryFn: async () => (await contentService.getTopic(bankQuery.data!.topicId)).data,
    enabled: Boolean(bankQuery.data?.topicId),
  });
  const sectionQuery = useQuery({
    queryKey: QUERY_KEYS.contentSection(topicQuery.data?.sectionId ?? 0),
    queryFn: async () => (await contentService.getSection(topicQuery.data!.sectionId)).data,
    enabled: Boolean(topicQuery.data?.sectionId),
  });
  const unitQuery = useQuery({
    queryKey: QUERY_KEYS.contentUnit(sectionQuery.data?.unitId ?? 0),
    queryFn: async () => (await contentService.getUnit(sectionQuery.data!.unitId)).data,
    enabled: Boolean(sectionQuery.data?.unitId),
  });
  const bankHref = resolvedBankId ? `/teacher/content/question-banks/${resolvedBankId}` : "/teacher/content/question-banks";

  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/teacher/content" className="rounded hover:text-primary hover:underline">Content</Link>
      {unitQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/units/${unitQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{unitQuery.data.name}</Link></>}
      {sectionQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/sections/${sectionQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{sectionQuery.data.name}</Link></>}
      {topicQuery.data && <><span aria-hidden="true">/</span><Link href={`/teacher/content/topics/${topicQuery.data.id}`} className="max-w-[180px] truncate rounded hover:text-primary hover:underline">{topicQuery.data.name}</Link></>}
      <span aria-hidden="true">/</span><Link href={bankHref} className="max-w-[220px] truncate rounded hover:text-primary hover:underline">{bankQuery.data?.name ?? "Question Bank"}</Link>
      <span aria-hidden="true">/</span><span aria-current="page" className="font-semibold text-foreground">Edit Question</span>
    </nav>
  );
}

export function ContentRoutePage({ view, id }: ContentRoutePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const source = searchParams.get("source") === "global" ? "global" : "content";

  const navigate = (nextView: ContentView, nextId?: number, bankName?: string) => {
    if (nextView === "overview") {
      router.push("/teacher/content");
      return;
    }
    if (nextView === "bulk-create") {
      if (!nextId) return;
      router.push(`/teacher/content/question-banks/${nextId}?mode=bulk-create&source=${source}`);
      return;
    }
    if (nextView === "import") {
      const bankId = nextId ?? id;
      if (!bankId) return;
      router.push(`/teacher/content/question-banks/${bankId}?mode=import&source=${source}`);
      return;
    }

    const resolvedId = nextView === "bank" && !nextId
      ? Number(searchParams.get("bankId")) || undefined
      : nextId ?? (nextView === view ? id : undefined);
    const basePath = contentPaths[nextView];
    if (!basePath) return;
    if (!resolvedId) {
      router.push("/teacher/content");
      return;
    }

    if (nextView === "question") {
      const params = new URLSearchParams();
      // When navigating from a bank, the current route id is the bank id.
      const currentBankId = Number(searchParams.get("bankId")) || (view === "bank" ? id : undefined);
      if (currentBankId) params.set("bankId", String(currentBankId));
      if (bankName) params.set("bankName", bankName);
      if (source === "global") params.set("source", "global");
      const query = params.toString();
      router.push(`${basePath}/${resolvedId}${query ? `?${query}` : ""}`);
      return;
    }

    const query = nextView === "bank" && source === "global" ? "?source=global" : "";
    router.push(`${basePath}/${resolvedId}${query}`);
  };

  if (view === "overview") return <div className="space-y-6"><ContentOverview onNavigate={navigate} /></div>;
  if (!id) return <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">Missing content identifier.</div>;
  if (view === "unit") return <div className="space-y-6"><UnitDetail unitId={id} onNavigate={navigate} /></div>;
  if (view === "section") return <div className="space-y-6"><SectionDetail sectionId={id} onNavigate={navigate} /></div>;
  if (view === "topic") return <div className="space-y-6"><TopicDetail topicId={id} onNavigate={navigate} /></div>;
  if (view === "bank") {
    if (mode === "bulk-create") return <div className="space-y-6"><BulkQuestionCreator bankId={id} bankName="" onNavigate={navigate} /></div>;
    if (mode === "import") return <div className="space-y-6"><ImportQuestions onNavigate={navigate} /></div>;
    return <div className="space-y-6"><QuestionBankDetail bankId={id} onNavigate={navigate} /></div>;
  }

  const bankId = Number(searchParams.get("bankId")) || undefined;
  const bankName = searchParams.get("bankName") ?? undefined;
  return <div className="space-y-6"><QuestionRouteBreadcrumb questionId={id} bankId={bankId} /><QuestionEditor questionId={id} bankName={bankName} onNavigate={navigate} /></div>;
}
