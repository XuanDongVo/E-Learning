"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Image as ImageIcon,
  Music,
} from "lucide-react";
import { toast } from "sonner";

import {
  type ContentView,
  type QuestionOptionDraft,
  type QuestionMediaDraft,
} from "@/types/content";

import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { Badge } from "./components/badge";
import { QuestionForm, isQuestionComplete, makeDraftQuestion } from "./components/question-form";

const NAVIGATE_AFTER_SAVE_MS = 900;

export function QuestionEditor({
  questionId,
  bankName,
  onNavigate,
}: {
  questionId?: number;
  bankName?: string;
  onNavigate: (view: ContentView, id?: number, bankName?: string) => void;
}) {
  const client = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Question Form State
  const [draft, setDraft] = useState(() => makeDraftQuestion());
  // Fetch question if questionId is provided
  const questionQuery = useQuery({
    queryKey: QUERY_KEYS.contentQuestion(questionId!),
    queryFn: async () => {
      const data = (await contentService.getQuestion(questionId!)).data;
      return data;
    },
    enabled: !!questionId,
  });

  // Populate state when questionQuery loads
  useEffect(() => {
    if (questionQuery.data) {
      const q = questionQuery.data;

      const loadedOptions: QuestionOptionDraft[] = (q.options && q.options.length > 0)
        ? q.options.map((opt, i) => ({
          id: String.fromCharCode(65 + i),
          text: opt.content,
        }))
        : [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" },
        ];

      const loadedCorrectIds: string[] = (q.options && q.options.length > 0)
        ? q.options
          .map((opt, i) => (opt.isCorrect ? String.fromCharCode(65 + i) : null))
          .filter(Boolean) as string[]
        : ["A"];

      const loadedTf: "TRUE" | "FALSE" =
        q.answers && q.answers.length > 0 && q.answers[0].rawValue === "FALSE" ? "FALSE" : "TRUE";

      const loadedAccepted: string[] =
        q.answers && q.answers.length > 0 ? q.answers.map((a) => a.rawValue) : [""];

      const loadedMedia: QuestionMediaDraft[] =
        q.media && q.media.length > 0
          ? q.media.map((m) => ({
            id: String(m.mediaId || m.id),
            name: `Media #${m.mediaId || m.id}`,
            kind: (m.mediaType && m.mediaType.toLowerCase().includes("audio")) ? "audio" : "image",
          }))
          : [];

      setDraft({
        draftId: String(q.id),
        type: q.type,
        difficulty: q.difficulty,
        text: q.content,
        options: loadedOptions,
        correctOptionIds: loadedCorrectIds,
        trueFalseAnswer: loadedTf,
        acceptedAnswers: loadedAccepted,
        media: loadedMedia,
        explanation: q.explanation ?? "",
      });
    }
  }, [questionQuery.data]);

  const handleSave = async () => {
    if (!questionId) {
      toast.error("No question ID specified for editing.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        type: draft.type,
        difficulty: draft.difficulty,
        content: draft.text.trim(),
        explanation: draft.explanation.trim() || undefined,
        options:
          draft.type === "SINGLE_CHOICE" || draft.type === "MULTIPLE_CHOICE"
            ? draft.options.map((opt) => ({
              content: opt.text.trim(),
              isCorrect: draft.correctOptionIds.includes(opt.id),
            }))
            : undefined,
        answers:
          draft.type === "TRUE_FALSE"
            ? [{ rawValue: draft.trueFalseAnswer }]
            : draft.type === "FILL_IN_BLANK" || draft.type === "TYPE_ANSWER"
              ? draft.acceptedAnswers.map((ans) => ({ rawValue: ans.trim() }))
              : undefined,
        mediaIds: draft.media.map((m) => Number(m.id)).filter((id) => !isNaN(id)),
      };

      await contentService.updateQuestion(questionId, payload);


      await client.invalidateQueries({
        queryKey: ["content", "questions"],
        refetchType: "all",
      });
      await client.invalidateQueries({
        queryKey: QUERY_KEYS.contentQuestion(questionId),
        refetchType: "all",
      });

      toast.success("Question saved", {
        description: bankName ? `Updated in ${bankName}.` : undefined,
      });
      setTimeout(() => {
        onNavigate("bank", questionQuery.data?.questionBankId);
      }, NAVIGATE_AFTER_SAVE_MS);
    } catch (err: any) {
      toast.error("Could not save changes", {
        description: err?.message || "Please try again.",
      });
      setIsSaving(false);
    }
  };

  const isReady = isQuestionComplete(draft);

  if (questionQuery.isLoading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading question data...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* <div className="mb-2 flex items-center gap-2">
            <button
              onClick={() => onNavigate("bank")}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft size={14} /> Back to Bank
            </button>
            <span className="text-slate-300">·</span>
            <Badge tone="blue">{draft.type}</Badge>
            <Badge tone={isReady ? "green" : "gray"}>
              {isReady ? "Ready" : "Incomplete"}
            </Badge>
          </div> */}

          <h1 className="text-page-title font-bold text-slate-900">
            Edit Question #{questionId}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Update prompt, options, answers, and media attachments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("bank")}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
          <QuestionForm
            question={draft}
            onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-5 lg:self-start">
          <QuestionPreviewCard draft={draft} />
          <CompletionChecklistCard draft={draft} />
          {questionQuery.data && <MetadataCard question={questionQuery.data} bankName={bankName} />}
        </aside>
      </div>
    </>
  );
}

// Sidebar: live preview
function QuestionPreviewCard({ draft }: { draft: ReturnType<typeof makeDraftQuestion> }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        Student preview
      </h3>

      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
        {draft.media.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {draft.media.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500"
              >
                {item.kind === "audio" ? <Music size={12} /> : <ImageIcon size={12} />}
                {item.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm font-medium text-slate-800">
          {draft.text.trim() || (
            <span className="italic text-slate-300">Your question prompt will appear here…</span>
          )}
        </p>

        {(draft.type === "SINGLE_CHOICE" || draft.type === "MULTIPLE_CHOICE") && (
          <div className="mt-3 space-y-1.5">
            {draft.options.map((option) => {
              const isCorrect = draft.correctOptionIds.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600"
                    }`}
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-inset ring-slate-200">
                    {option.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {option.text.trim() || <span className="italic text-slate-300">Empty option</span>}
                  </span>
                  {isCorrect && <CheckCircle2 size={13} className="shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        {draft.type === "TRUE_FALSE" && (
          <div className="mt-3 flex gap-2">
            {(["TRUE", "FALSE"] as const).map((value) => (
              <span
                key={value}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium ${draft.trueFalseAnswer === value
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500"
                  }`}
              >
                {value === "TRUE" ? "True" : "False"}
              </span>
            ))}
          </div>
        )}

        {(draft.type === "FILL_IN_BLANK" || draft.type === "TYPE_ANSWER") && (
          <div className="mt-3 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-400">
            Student types an answer here
          </div>
        )}
      </div>

      {draft.explanation.trim() && (
        <p className="mt-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-500">Explanation: </span>
          {draft.explanation}
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sidebar: completion checklist — the same logic isQuestionComplete() uses,
// broken into individual conditions so a teacher can see exactly what's
// missing instead of a single opaque Ready/Incomplete badge.
// ---------------------------------------------------------------------------

function CompletionChecklistCard({ draft }: { draft: ReturnType<typeof makeDraftQuestion> }) {
  const items = getCompletionItems(draft);
  const doneCount = items.filter((item) => item.done).length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Ready to save
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {doneCount}/{items.length}
        </span>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-xs">
            {item.done ? (
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            ) : (
              <Circle size={15} className="mt-0.5 shrink-0 text-slate-300" />
            )}
            <span className={item.done ? "text-slate-500" : "text-slate-700"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function getCompletionItems(draft: ReturnType<typeof makeDraftQuestion>) {
  const items: { label: string; done: boolean }[] = [
    { label: "Question prompt is filled in", done: draft.text.trim().length > 0 },
  ];

  if (draft.type === "SINGLE_CHOICE" || draft.type === "MULTIPLE_CHOICE") {
    items.push(
      {
        label: "At least 2 options have text",
        done: draft.options.filter((o) => o.text.trim().length > 0).length >= 2,
      },
      {
        label: draft.type === "SINGLE_CHOICE" ? "Exactly one correct option selected" : "At least one correct option selected",
        done:
          draft.type === "SINGLE_CHOICE"
            ? draft.correctOptionIds.length === 1
            : draft.correctOptionIds.length >= 1,
      },
    );
  }

  if (draft.type === "FILL_IN_BLANK" || draft.type === "TYPE_ANSWER") {
    items.push({
      label: "At least one accepted answer provided",
      done: draft.acceptedAnswers.some((a) => a.trim().length > 0),
    });
  }

  if (draft.type === "FILL_IN_BLANK") {
    items.push({
      label: "Prompt contains a ____ blank marker",
      done: draft.text.includes("____"),
    });
  }

  return items;
}

// Sidebar: metadata — read-only reference info, not editable here.
function MetadataCard({ question, bankName }: { question: any; bankName?: string }) {
  const formatDate = (value?: string) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        Details
      </h3>
      <dl className="space-y-2 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-400">Question ID</dt>
          <dd className="font-medium text-slate-700">#{question.id}</dd>
        </div>
        {question.questionBankId !== undefined && (
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">Question bank</dt>
            <dd className="font-medium text-slate-700">#{bankName}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-slate-400">Created</dt>
          <dd className="font-medium text-slate-700">{formatDate(question.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-400">Last updated</dt>
          <dd className="font-medium text-slate-700">{formatDate(question.updatedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}