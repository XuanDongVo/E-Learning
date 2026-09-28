"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, Loader2, RotateCcw } from "lucide-react";

import type { ContentView, CreateQuestionRequest, DraftQuestion } from "@/types/content";
import { contentService } from "@/services/content.service";
import { QuestionList } from "./question-list";
import { BulkSaveBar } from "./bulk-save-bar";
import {
  QuestionForm,
  isQuestionComplete,
  makeDraftQuestion,
} from "./question-form";
import { QuestionPreviewModal } from "./question-preview-modal";
import { toast } from "sonner";

// ── Auto-save config
const AUTOSAVE_DEBOUNCE_MS = 1000;
const NAVIGATE_AFTER_SAVE_MS = 1000;

type AutoSaveStatus = "idle" | "saving" | "saved";

export function BulkQuestionCreator({
  bankId,
  bankName = "Question Bank",
  onNavigate,
}: {
  bankId: number;
  bankName?: string;
  onNavigate: (view: ContentView, bankId: number) => void;
}) {
  const localStorageKey = `elearning_bulk_draft_bank_${bankId}`;

  // ── Questions state (initialised from localStorage) 
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) { /* ignore */ }
    }
    return [makeDraftQuestion()];
  });

  const [activeDraftId, setActiveDraftId] = useState<string>(
    questions[0]?.draftId ?? "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Auto-save to localStorage (debounced) ─────────────────────────────────
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Show "saving" immediately when questions change
    setAutoSaveStatus("saving");

    // Debounce the actual write + switch to "saved"
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(questions));
      } catch (_) { /* quota exceeded or private browsing */ }
      setAutoSaveStatus("saved");

      // Fade out the "saved" badge after 2 s
      autoSaveTimerRef.current = setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 2000);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [questions, localStorageKey]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const validCount = questions.filter(isQuestionComplete).length;
  const isAllValid = questions.length > 0 && validCount === questions.length;
  const activeQuestion = questions.find((q) => q.draftId === activeDraftId);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addOne = () => {
    const next = makeDraftQuestion();
    setQuestions((curr) => [...curr, next]);
    setActiveDraftId(next.draftId);
  };

  const addMany = (count: number) => {
    const created = Array.from({ length: count }, () => makeDraftQuestion());
    setQuestions((curr) => [...curr, ...created]);
    setActiveDraftId(created[0].draftId);
  };

  const updateActive = (patch: Partial<DraftQuestion>) => {
    if (!activeQuestion) return;
    setQuestions((curr) =>
      curr.map((q) =>
        q.draftId === activeQuestion.draftId ? { ...q, ...patch } : q,
      ),
    );
  };

  const duplicate = (draftId: string) => {
    const source = questions.find((q) => q.draftId === draftId);
    if (!source) return;
    const copy: DraftQuestion = {
      ...source,
      draftId: `draft-copy-${Date.now()}`,
      options: source.options.map((o) => ({ ...o })),
      acceptedAnswers: [...source.acceptedAnswers],
      media: source.media.map((m) => ({ ...m })),
    };
    setQuestions((curr) => {
      const idx = curr.findIndex((q) => q.draftId === draftId);
      const next = [...curr];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setActiveDraftId(copy.draftId);
  };

  const remove = (draftId: string) => {
    setQuestions((curr) => {
      if (curr.length <= 1) return curr;
      const idx = curr.findIndex((q) => q.draftId === draftId);
      const next = curr.filter((q) => q.draftId !== draftId);
      if (activeDraftId === draftId) {
        const fallback = next[Math.min(idx, next.length - 1)];
        setActiveDraftId(fallback?.draftId ?? "");
      }
      return next;
    });
  };

  const clearDraft = () => {
    if (!confirm("Reset all questions and clear the locally saved draft?")) return;
    if (typeof window !== "undefined") localStorage.removeItem(localStorageKey);
    const initial = [makeDraftQuestion()];
    setQuestions(initial);
    setActiveDraftId(initial[0].draftId);
  };

  const handleSave = async () => {
    setShowValidation(true);

    if (!isAllValid) {
      const firstInvalid = questions.find((q) => !isQuestionComplete(q));
      if (firstInvalid) setActiveDraftId(firstInvalid.draftId);
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateQuestionRequest[] = questions.map((q) => ({
        questionBankId: bankId,
        type: q.type,
        difficulty: q.difficulty,
        content: q.text.trim(),
        explanation: q.explanation?.trim() || undefined,
        options:
          q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE"
            ? q.options.map((opt) => ({
              content: opt.text.trim(),
              isCorrect: q.correctOptionIds.includes(opt.id),
            }))
            : undefined,
        answers:
          q.type === "TRUE_FALSE"
            ? [{ rawValue: q.trueFalseAnswer }]
            : q.type === "FILL_IN_BLANK" || q.type === "TYPE_ANSWER"
              ? q.acceptedAnswers.map((ans) => ({ rawValue: ans.trim() }))
              : undefined,
        // mediaIds: server will transition these from PENDING → READY
        mediaIds: q.media.map((m) => Number(m.id)).filter((id) => !isNaN(id)),
      }));

      await contentService.createQuestion(payload as any);

      if (typeof window !== "undefined") localStorage.removeItem(localStorageKey);

      toast.success("Question saved", {
        description: bankName ? `Saved in ${bankName}.` : undefined,
      });
      setTimeout(() => {
        onNavigate("bank", bankId);
      }, NAVIGATE_AFTER_SAVE_MS);
    } catch (err: any) {
      toast.error("Could not save questions", {
        description: err?.message || "Please try again.",
      });
      setIsSaving(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-2 text-page-title font-bold text-slate-900">
            Create questions for {bankName}
          </h1>
          <p className="mt-1 text-body-sm text-slate-400">
            Fill in all details. Changes are saved locally in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-save indicator */}
          <AutoSaveIndicator status={autoSaveStatus} />

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Eye size={15} className="text-indigo-600" /> Preview Exam
          </button>

          <button
            type="button"
            onClick={clearDraft}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <RotateCcw size={14} /> Clear Draft
          </button>
        </div>
      </div>

      {/* Validation banner */}
      {showValidation && !isAllValid && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <b>{questions.length - validCount} questions incomplete.</b> Please complete all
            required prompts, choices, and answers before saving.
          </span>
        </div>
      )}

      {/* ── Main split layout ── */}
      <div className="grid min-h-0 h-[calc(100vh-210px)] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)] lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left: question list */}
        <QuestionList
          questions={questions}
          activeDraftId={activeDraftId}
          showValidation={showValidation}
          onSelect={setActiveDraftId}
          onAddOne={addOne}
          onAddMany={addMany}
          onDuplicate={duplicate}
          onDelete={remove}
        />

        {/* Right: active question form */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          {activeQuestion ? (
            <>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Question{" "}
                  {questions.findIndex((q) => q.draftId === activeQuestion.draftId) + 1}
                </h2>
              </div>
              <QuestionForm question={activeQuestion} onChange={updateActive} />
            </>
          ) : (
            <p className="py-12 text-center text-body-sm text-slate-400">
              Select a question from the list, or add a new one.
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom save bar ── */}
      <BulkSaveBar
        total={questions.length}
        validCount={validCount}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* ── Preview modal ── */}
      {previewOpen && (
        <QuestionPreviewModal
          bankName={bankName}
          questions={questions}
          initialIndex={questions.findIndex((q) => q.draftId === activeDraftId)}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

// ── AutoSaveIndicator ─────────────────────────────────────────────────────────

function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === "idle") return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-300
        ${status === "saving"
          ? "bg-amber-50 text-amber-600"
          : "bg-emerald-50 text-emerald-600"
        }`}
    >
      {status === "saving" ? (
        <>
          <Loader2 size={11} className="animate-spin" />
          Saving…
        </>
      ) : (
        <>
          <CheckCircle2 size={11} />
          Saved locally
        </>
      )}
    </span>
  );
}
