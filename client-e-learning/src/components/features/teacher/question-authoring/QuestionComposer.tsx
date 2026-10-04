"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import type { DraftQuestion } from "@/types/question";
import { QuestionList } from "./QuestionList";
import { BulkSaveBar } from "./BulkSaveBar";
import {
  QuestionForm,
  isQuestionComplete,
  makeDraftQuestion,
  type QuestionMediaUploadHandler,
} from "./QuestionForm";
import { QuestionPreviewModal } from "./QuestionPreviewModal";

const AUTOSAVE_DEBOUNCE_MS = 1000;

export interface QuestionComposerProps {
  title: string;
  description?: string;
  storageKey: string;
  initialQuestions?: DraftQuestion[];
  onUploadMedia: QuestionMediaUploadHandler;
  onSave: (questions: DraftQuestion[]) => Promise<void>;
  onSaveSuccess?: () => void;
  successDescription?: string;
}

type AutoSaveStatus = "idle" | "saving" | "saved";

export function QuestionComposer({
  title,
  description = "Fill in all details. Changes are saved locally in your browser.",
  storageKey,
  initialQuestions,
  onUploadMedia,
  onSave,
  onSaveSuccess,
  successDescription,
}: QuestionComposerProps) {
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Ignore malformed local drafts.
      }
    }

    return initialQuestions?.length ? initialQuestions : [makeDraftQuestion()];
  });

  const [activeDraftId, setActiveDraftId] = useState(
    questions[0]?.draftId ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] =
    useState<AutoSaveStatus>("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setAutoSaveStatus("saving");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(questions));
      } catch {
        // Ignore storage quota/private mode failures.
      }

      setAutoSaveStatus("saved");

      autoSaveTimerRef.current = setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 2000);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [questions, storageKey]);

  const validCount = questions.filter(isQuestionComplete).length;
  const isAllValid = questions.length > 0 && validCount === questions.length;
  const activeQuestion = questions.find(
    (question) => question.draftId === activeDraftId,
  );

  const addOne = () => {
    const next = makeDraftQuestion();
    setQuestions((current) => [...current, next]);
    setActiveDraftId(next.draftId);
  };

  const addMany = (count: number) => {
    const created = Array.from(
      { length: count },
      () => makeDraftQuestion(),
    );
    setQuestions((current) => [...current, ...created]);
    setActiveDraftId(created[0].draftId);
  };

  const updateActive = (patch: Partial<DraftQuestion>) => {
    if (!activeQuestion) return;

    setQuestions((current) =>
      current.map((question) =>
        question.draftId === activeQuestion.draftId
          ? { ...question, ...patch }
          : question,
      ),
    );
  };

  const duplicate = (draftId: string) => {
    const source = questions.find((question) => question.draftId === draftId);
    if (!source) return;

    const copy: DraftQuestion = {
      ...source,
      draftId: `draft-copy-${Date.now()}`,
      options: source.options.map((option) => ({ ...option })),
      acceptedAnswers: [...source.acceptedAnswers],
      media: source.media.map((media) => ({ ...media })),
    };

    setQuestions((current) => {
      const index = current.findIndex(
        (question) => question.draftId === draftId,
      );
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });

    setActiveDraftId(copy.draftId);
  };

  const remove = (draftId: string) => {
    setQuestions((current) => {
      if (current.length <= 1) return current;

      const index = current.findIndex(
        (question) => question.draftId === draftId,
      );
      const next = current.filter(
        (question) => question.draftId !== draftId,
      );

      if (activeDraftId === draftId) {
        const fallback = next[Math.min(index, next.length - 1)];
        setActiveDraftId(fallback?.draftId ?? "");
      }

      return next;
    });
  };

  const clearDraft = () => {
    if (!confirm("Reset all questions and clear the locally saved draft?")) {
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }

    const initial = [makeDraftQuestion()];
    setQuestions(initial);
    setActiveDraftId(initial[0].draftId);
    setShowValidation(false);
  };

  const handleSave = async () => {
    setShowValidation(true);

    if (!isAllValid) {
      const firstInvalid = questions.find(
        (question) => !isQuestionComplete(question),
      );
      if (firstInvalid) {
        setActiveDraftId(firstInvalid.draftId);
      }
      return;
    }

    setIsSaving(true);

    try {
      await onSave(questions);

      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }

      toast.success("Questions saved", {
        description: successDescription,
      });

      onSaveSuccess?.();
    } catch (error: unknown) {
      toast.error("Could not save questions", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-2 text-page-title font-bold text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-body-sm text-slate-400">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <AutoSaveIndicator status={autoSaveStatus} />

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Eye size={15} className="text-indigo-600" /> Preview Exam
          </button>

          <button
            type="button"
            onClick={clearDraft}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <RotateCcw size={14} /> Clear Draft
          </button>
        </div>
      </div>

      {showValidation && !isAllValid && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <b>{questions.length - validCount} questions incomplete.</b>{" "}
            Please complete all required prompts, choices, and answers before
            saving.
          </span>
        </div>
      )}

      <div className="grid min-h-0 h-[calc(100vh-210px)] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)] lg:grid-cols-[280px_minmax(0,1fr)]">
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

        <div className="overflow-y-auto p-4 sm:p-5">
          {activeQuestion ? (
            <>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Question{" "}
                  {questions.findIndex(
                    (question) =>
                      question.draftId === activeQuestion.draftId,
                  ) + 1}
                </h2>
              </div>

              <QuestionForm
                question={activeQuestion}
                onChange={updateActive}
                onUploadMedia={onUploadMedia}
              />
            </>
          ) : (
            <p className="py-12 text-center text-body-sm text-slate-400">
              Select a question from the list, or add a new one.
            </p>
          )}
        </div>
      </div>

      <BulkSaveBar
        total={questions.length}
        validCount={validCount}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {previewOpen && (
        <QuestionPreviewModal
          title={title}
          questions={questions}
          initialIndex={Math.max(
            0,
            questions.findIndex(
              (question) => question.draftId === activeDraftId,
            ),
          )}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

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
