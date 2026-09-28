"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Eye, RotateCcw } from "lucide-react";

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

export function BulkQuestionCreator({
  bankId = 1,
  bankName = "Question Bank",
  onNavigate,
}: {
  bankId?: number;
  bankName?: string;
  onNavigate: (view: ContentView) => void;
}) {
  const localStorageKey = `elearning_bulk_draft_bank_${bankId}`;

  // Initialize from LocalStorage if available
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        // Fallback to initial
      }
    }
    return [makeDraftQuestion()];
  });

  const [activeDraftId, setActiveDraftId] = useState<string>(
    questions[0]?.draftId ?? "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Auto-save to LocalStorage whenever questions change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(questions));
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [questions, localStorageKey]);

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
    const created = Array.from({ length: count }, () => makeDraftQuestion());
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
      media: source.media.map((item) => ({ ...item })),
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
      const next = current.filter((question) => question.draftId !== draftId);
      if (activeDraftId === draftId) {
        const fallback = next[Math.min(index, next.length - 1)];
        setActiveDraftId(fallback?.draftId ?? "");
      }
      return next;
    });
  };

  const clearDraft = () => {
    if (confirm("Reset all questions and clear local auto-saved draft?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(localStorageKey);
      }
      const initial = [makeDraftQuestion()];
      setQuestions(initial);
      setActiveDraftId(initial[0].draftId);
    }
  };

  const handleSave = async () => {
    setShowValidation(true);

    if (!isAllValid) {
      const firstInvalid = questions.find((q) => !isQuestionComplete(q));
      if (firstInvalid) {
        setActiveDraftId(firstInvalid.draftId);
      }
      return;
    }

    setIsSaving(true);

    try {
      const payloadArray: CreateQuestionRequest[] = questions.map((q) => ({
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
        mediaIds: q.media.map((m) => Number(m.id)).filter((id) => !isNaN(id)),
      }));

      await contentService.createQuestion(payloadArray as any);

      // Clear local auto-save draft upon successful save
      if (typeof window !== "undefined") {
        localStorage.removeItem(localStorageKey);
      }

      onNavigate("bank");
    } catch (err: any) {
      alert(err.message || "Failed to save questions in bulk.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-2 text-page-title font-bold text-slate-900">
            Create questions for {bankName}
          </h1>
          <p className="mt-1 text-body-sm text-slate-400">
            Auto-saving changes to your browser. Fill in all details before saving to server.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {showValidation && !isAllValid && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <b>{questions.length - validCount} questions incomplete.</b> Please complete all required prompts, choices, and answers to save.
          </span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="grid min-h-0 h-[calc(100vh-200px)] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 lg:grid-cols-[280px_minmax(0,1fr)] lg:h-[calc(100vh-210px)]">
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
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(100vh-210px)]">
          {activeQuestion ? (
            <>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Question{" "}
                  {questions.findIndex(
                    (q) => q.draftId === activeQuestion.draftId,
                  ) + 1}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  Auto-saved locally
                </span>
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

      {/* Save Bar */}
      <BulkSaveBar
        total={questions.length}
        validCount={validCount}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* TOEIC / Study4 Style Preview Modal */}
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
