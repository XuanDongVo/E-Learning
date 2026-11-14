"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Eye, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getAppErrorMessage, toAppError } from "@/lib/errors/app-error";
import { contentService } from "@/services/content.service";
import { guidedDefinitionService } from "@/services/content/guided-definition.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentView,
  QuestionMediaDraft,
  QuestionOptionDraft,
  QuestionResponse,
} from "@/types/content";
import type {
  GuidedDefinition,
  GuidedDefinitionDraftState,
  GuidedDefinitionIssue,
} from "@/types/guided-reasoning";
import { GuidedDraftEditor } from "@/components/features/teacher/question-authoring/GuidedDraftEditor";
import { PreviewExamDialog } from "@/components/features/teacher/question-authoring/PreviewExamDialog";

import {
  QuestionForm,
  isQuestionComplete,
  makeDraftQuestion,
} from "./components/question-form";

type EditorTab = "question" | "guided";

function toDraft(question: QuestionResponse) {
  const options: QuestionOptionDraft[] = question.options?.length
    ? question.options.map((option, index) => ({
        id: String.fromCharCode(65 + index),
        text: option.content,
      }))
    : ["A", "B", "C", "D"].map((id) => ({ id, text: "" }));

  const correctOptionIds = question.options?.length
    ? question.options.flatMap((option, index) =>
        option.isCorrect ? [String.fromCharCode(65 + index)] : [],
      )
    : ["A"];

  const media: QuestionMediaDraft[] = question.media?.map((item) => ({
    id: String(item.mediaId || item.id),
    name: `Media #${item.mediaId || item.id}`,
    kind: item.mediaType?.toLowerCase().includes("audio") ? "audio" : "image",
  })) ?? [];

  return makeDraftQuestion({
    draftId: String(question.id),
    type: question.type,
    difficulty: question.difficulty,
    text: question.content,
    options,
    correctOptionIds,
    trueFalseAnswer:
      question.answers?.[0]?.rawValue === "FALSE" ? "FALSE" : "TRUE",
    acceptedAnswers: question.answers?.length
      ? question.answers.map((answer) => answer.rawValue)
      : [""],
    media,
    explanation: question.explanation ?? "",
    hint: question.hint ?? "",
  });
}

export function QuestionEditor({
  questionId,
  bankName,
  onNavigate,
}: {
  questionId?: number;
  bankName?: string;
  onNavigate: (view: ContentView, id?: number, bankName?: string) => void;
}) {
  const questionQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestion(questionId!),
    queryFn: async () => (await contentService.getQuestion(questionId!)).data,
    enabled: Boolean(questionId),
  });

  if (questionQuery.isLoading) {
    return <div className="p-8 text-center text-body-sm text-muted-foreground">Loading question…</div>;
  }

  if (!questionId || !questionQuery.data) {
    return <div className="p-8 text-center text-body-sm text-muted-foreground">Question could not be loaded.</div>;
  }

  return (
    <QuestionEditorWorkspace
      key={questionId}
      question={questionQuery.data}
      bankName={bankName}
      onNavigate={onNavigate}
    />
  );
}

function QuestionEditorWorkspace({
  question,
  bankName,
  onNavigate,
}: {
  question: QuestionResponse;
  bankName?: string;
  onNavigate: (view: ContentView, id?: number, bankName?: string) => void;
}) {
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => toDraft(question));
  const [tab, setTab] = useState<EditorTab>("question");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isReady = isQuestionComplete(draft);

  const saveQuestion = async () => {
    if (!isReady) {
      toast.error("Complete the required question fields before saving.");
      return;
    }

    setSaving(true);
    try {
      await contentService.updateQuestion(question.id, {
        type: draft.type,
        difficulty: draft.difficulty,
        content: draft.text.trim(),
        explanation: draft.explanation.trim() || undefined,
        hint: draft.hint?.trim() || undefined,
        options:
          draft.type === "SINGLE_CHOICE" || draft.type === "MULTIPLE_CHOICE"
            ? draft.options.map((option) => ({
                content: option.text.trim(),
                isCorrect: draft.correctOptionIds.includes(option.id),
              }))
            : undefined,
        answers:
          draft.type === "TRUE_FALSE"
            ? [{ rawValue: draft.trueFalseAnswer }]
            : draft.type === "FILL_IN_BLANK" || draft.type === "TYPE_ANSWER"
              ? draft.acceptedAnswers.map((answer) => ({ rawValue: answer.trim() }))
              : undefined,
        mediaIds: draft.media.map((item) => Number(item.id)).filter(Number.isFinite),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestion(question.id) }),
        queryClient.invalidateQueries({ queryKey: ["content", "questions"] }),
      ]);
      toast.success("Question saved", {
        description: bankName ? `Updated in ${bankName}.` : undefined,
      });
    } catch (error) {
      toast.error("Could not save question", {
        description: getAppErrorMessage(error, tErrors as (key: string) => string),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("bank", question.questionBankId, bankName)}
            className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-card text-foreground shadow-pop-sm transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to question bank"
          >
            <ArrowLeft size={18} aria-hidden />
          </button>
            <p className="text-sm text-muted-foreground pt-1">{bankName ?? "Question bank"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-border bg-card px-4 text-body-sm font-semibold text-foreground shadow-pop-sm transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Eye size={16} aria-hidden /> Preview Exam
          </button>
          <button
            type="button"
            onClick={saveQuestion}
            disabled={saving || !isReady}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-ink bg-primary px-4 text-body-sm font-bold text-primary-foreground shadow-pop-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={16} aria-hidden /> {saving ? "Saving…" : "Save question"}
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border-2 border-ink bg-card shadow-pop">
        <div className="flex border-b-2 border-border px-3 pt-3">
          <TabButton active={tab === "question"} onClick={() => setTab("question")}>Main Question</TabButton>
          <TabButton active={tab === "guided"} onClick={() => setTab("guided")}>Guided Reasoning</TabButton>
        </div>
        <div className="p-5 md:p-6">
          {tab === "question" ? (
            <QuestionForm
              question={draft}
              onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
            />
          ) : (
            <PersistedGuidedTab questionId={question.id} finalQuestionType={draft.type} />
          )}
        </div>
      </section>

      {previewOpen && (
        <PreviewExamDialog
          questions={[draft]}
          initialIndex={0}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

function TabButton({ active, children, onClick }: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-0.5 border-b-2 px-4 py-3 text-body-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </button>
  );
}

function PersistedGuidedTab({ questionId, finalQuestionType }: {
  questionId: number;
  finalQuestionType: ReturnType<typeof makeDraftQuestion>["type"];
}) {
  const definitionQuery = useQuery({
    queryKey: QUERY_KEYS.guidedDefinition(questionId),
    queryFn: async () => (await guidedDefinitionService.get(questionId)).data,
    retry: false,
  });

  if (definitionQuery.isLoading) {
    return <div className="py-8 text-center text-body-sm text-muted-foreground">Loading guided definition…</div>;
  }

  if (definitionQuery.isError && toAppError(definitionQuery.error).code !== "GUIDED_DEFINITION_NOT_FOUND") {
    return <p role="alert" className="rounded-lg border border-destructive bg-destructive-soft p-4 text-body-sm text-destructive">Could not load Guided Reasoning. Refresh and try again.</p>;
  }

  return (
    <PersistedGuidedForm
      key={definitionQuery.data?.version ?? "new"}
      questionId={questionId}
      finalQuestionType={finalQuestionType}
      initial={definitionQuery.data}
    />
  );
}

function PersistedGuidedForm({ questionId, finalQuestionType, initial }: {
  questionId: number;
  finalQuestionType: ReturnType<typeof makeDraftQuestion>["type"];
  initial?: GuidedDefinition;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<GuidedDefinitionDraftState | undefined>(() => initial && {
    enabled: true,
    introContent: initial.introContent ?? "",
    steps: initial.steps,
  });
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [issues, setIssues] = useState<GuidedDefinitionIssue[]>([]);
  const enabled = draft?.enabled ?? false;
  const dirty = Boolean(draft) && JSON.stringify({
    introContent: draft.introContent,
    steps: draft.steps,
  }) !== JSON.stringify(initial && {
    introContent: initial.introContent ?? "",
    steps: initial.steps,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guidedDefinition(questionId) });

  const save = async () => {
    setSaving(true);
    try {
      if (!enabled) {
        if (initial) await guidedDefinitionService.remove(questionId);
        toast.success(initial ? "Guided Reasoning removed" : "No Guided Reasoning to save");
      } else if (draft) {
        await guidedDefinitionService.saveDraft(questionId, {
          expectedVersion: initial?.version ?? 0,
          introContent: draft.introContent.trim() || null,
          steps: draft.steps,
        });
        setIssues([]);
        toast.success("Guided draft saved");
      }
      await refresh();
    } catch (error) {
      toast.error("Could not save Guided Reasoning", { description: toAppError(error).message });
    } finally {
      setSaving(false);
    }
  };

  const validate = async () => {
    if (!initial || dirty) return;
    setValidating(true);
    try {
      const response = await guidedDefinitionService.validate(questionId, initial.version);
      await refresh();
      const result = response.data;
      setIssues(result?.issues ?? []);
      if (result?.ready) {
        toast.success("Guided Reasoning is ready");
      } else {
        toast.error("Guided draft still needs attention");
      }
    } catch (error) {
      toast.error("Guided validation failed", { description: toAppError(error).message });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-body-sm text-muted-foreground">
          {enabled && initial?.status === "READY" && !dirty
            ? "Ready for students"
            : enabled
              ? "Draft — save then validate when the steps are complete."
              : "Guided Reasoning will be removed when you save."}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={validate} disabled={!initial || dirty || validating} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border-2 border-border bg-card px-3 text-body-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40">
            <Check size={15} aria-hidden /> {validating ? "Validating…" : "Validate ready"}
          </button>
          <button type="button" onClick={save} disabled={saving} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border-2 border-ink bg-primary px-3 text-body-sm font-bold text-primary-foreground shadow-pop-sm disabled:cursor-not-allowed disabled:opacity-40">
            <Save size={15} aria-hidden /> {saving ? "Saving…" : "Save guided draft"}
          </button>
        </div>
      </div>
      {issues.length > 0 && (
        <p role="alert" className="rounded-lg border border-destructive bg-destructive-soft px-3 py-2 text-body-sm text-destructive">
          {issues.slice(0, 3).map((issue) => `${issue.path}: ${issue.code}`).join(" · ")}
        </p>
      )}
      <GuidedDraftEditor value={draft} onChange={setDraft} finalQuestionType={finalQuestionType} />
    </div>
  );
}
