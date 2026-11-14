"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { AlertTriangle, ArrowLeft, CheckCircle2, Eye, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import type { DraftQuestion } from "@/types/question";
import { QuestionList } from "./QuestionList";
import {
  QuestionForm,
  type QuestionMediaUploadHandler,
} from "./QuestionForm";
import { makeDraftQuestion } from "./question-draft";
import { isQuestionComplete } from "./question-validator";
import { GuidedDraftEditor } from "./GuidedDraftEditor";
import { PreviewExamDialog } from "./PreviewExamDialog";
import { QuestionImportReport } from "@/components/features/teacher/content/components/question-import-report";
import type { CsvValidationResult } from "@/types/question-import";

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
  importReport?: CsvValidationResult;
  onDraftCleared?: () => void;
  onBack?: () => void;
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
  importReport,
  onDraftCleared,
  onBack,
}: QuestionComposerProps) {
  const tErrors = useTranslations("errors");
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
  const [editorTab, setEditorTab] = useState<"question" | "guided">("question");
  const [clearDraftOpen, setClearDraftOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] =
    useState<AutoSaveStatus>("idle");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const timer = setTimeout(() => {
      setAutoSaveStatus("saving");
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
      clearTimeout(timer);
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
      guidedDefinition: source.guidedDefinition
        ? {
            ...source.guidedDefinition,
            steps: source.guidedDefinition.steps.map((step) => ({
              ...step,
              stepKey: `${step.stepKey}-copy-${Date.now()}`,
              options: step.options.map((option) => ({ ...option })),
              acceptedAnswers: [...step.acceptedAnswers],
            })),
          }
        : undefined,
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
    setClearDraftOpen(true);
  };

  const confirmClearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }

    const initial = [makeDraftQuestion()];

    setQuestions(initial);
    setActiveDraftId(initial[0].draftId);
    setShowValidation(false);
    setClearDraftOpen(false);
    onDraftCleared?.();

    toast.success("Draft cleared", {
      description: "All locally saved questions have been removed.",
    });
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
          getAppErrorMessage(error, tErrors as (key: string) => string),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {onBack && <button type="button" onClick={onBack} className="inline-flex size-9 items-center justify-center rounded-lg border-2 border-ink bg-card text-foreground shadow-pop-sm hover:bg-secondary" aria-label="Back"><ArrowLeft size={16} /></button>}
            <h1 className="text-page-title font-bold text-foreground">{title}</h1>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <AutoSaveIndicator status={autoSaveStatus} />

          {/* Button Preview Exam */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-muted active:translate-y-0"
          >
            <Eye size={15} className="text-primary" /> Preview Exam
          </button>

          {/* Button Clear Draft */}
          <button
            type="button"
            onClick={clearDraft}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-card px-3.5 py-2 text-xs font-bold text-destructive shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-destructive-soft active:translate-y-0"
          >
            <RotateCcw size={14} />
            Clear Draft
          </button>
          <button type="button" disabled={isSaving || !isAllValid} onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground shadow-pop-sm hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? "Saving…" : `Save all (${validCount}/${questions.length})`}
          </button>
        </div>
      </div>

      {importReport && <QuestionImportReport result={importReport} />}

      {/* Validation Warning Alert */}
      {showValidation && !isAllValid && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-ink bg-warning-soft px-4 py-3 text-xs font-bold text-warning shadow-pop-sm">
          <AlertTriangle size={17} className="shrink-0" />
          <span>
            <b>Còn {questions.length - validCount} câu chưa hoàn thiện.</b> Vui lòng nhập đầy đủ câu hỏi, phương án và đáp án trước khi lưu.
          </span>
        </div>
      )}

      {/* Main 2-Column Split Workspace */}
      <div className="grid min-h-0 h-[calc(100vh-210px)] grid-cols-1 overflow-hidden rounded-xl border-2 border-ink bg-card text-card-foreground shadow-pop lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left Column: Question Navigator */}
        <div className="border-b-2 border-border lg:border-b-0 lg:border-r-2">
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

        {/* Right Column: Active Question Form */}
        <div className="overflow-y-auto bg-background/50 p-4 sm:p-6">
          {activeQuestion ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Question{" "}
                  {questions.findIndex(
                    (question) => question.draftId === activeQuestion.draftId,
                  ) + 1}
                </h2>
                <span className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] font-bold text-muted-foreground">
                  {activeQuestion.type}
                </span>
              </div>
              <div className="flex gap-2 border-b border-border" role="tablist" aria-label="Question editor tabs">
                <button type="button" role="tab" aria-selected={editorTab === "question"} className={`border-b-2 px-3 py-2 text-body-sm font-bold ${editorTab === "question" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setEditorTab("question")}>Main question</button>
                <button type="button" role="tab" aria-selected={editorTab === "guided"} className={`border-b-2 px-3 py-2 text-body-sm font-bold ${editorTab === "guided" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setEditorTab("guided")}>Guided Reasoning{activeQuestion.guidedDefinition?.enabled ? ` (${activeQuestion.guidedDefinition.steps.length})` : ""}</button>
              </div>
              {editorTab === "question" ? (
                <div className="rounded-xl border-2 border-ink bg-card p-5 shadow-pop-sm">
                  <QuestionForm question={activeQuestion} onChange={updateActive} onUploadMedia={onUploadMedia} />
                </div>
              ) : <GuidedDraftEditor finalQuestionType={activeQuestion.type} value={activeQuestion.guidedDefinition} onChange={(guidedDefinition) => updateActive({ guidedDefinition })} />}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-xs font-semibold text-muted-foreground">
              Chọn một câu hỏi từ danh sách bên trái hoặc bấm tạo câu mới.
            </div>
          )}
        </div>
      </div>

      {/* Student-faithful local preview; it never creates a server Session. */}
      {previewOpen && (
        <PreviewExamDialog questions={questions} initialIndex={Math.max(0, questions.findIndex((question) => question.draftId === activeDraftId))} onClose={() => setPreviewOpen(false)} />
      )}

      {/* Clear Draft Confirmation Dialog */}
      {clearDraftOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-draft-title"
            className="w-full max-w-md rounded-2xl border-2 border-ink bg-card p-6 text-card-foreground shadow-pop"
          >
            <div className="flex items-start gap-3.5">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-destructive-soft text-destructive shadow-pop-sm">
                <RotateCcw size={18} />
              </div>

              <div className="min-w-0">
                <h2
                  id="clear-draft-title"
                  className="text-base font-black text-foreground"
                >
                  Xóa toàn bộ bản nháp?
                </h2>

                <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted-foreground">
                  Tất cả các câu hỏi lưu tạm trên trình duyệt này sẽ bị xóa sạch và đặt lại về 1 câu hỏi trống. Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t-2 border-border pt-4">
              <button
                type="button"
                onClick={() => setClearDraftOpen(false)}
                className="rounded-lg border-2 border-ink bg-card px-4 py-2 text-xs font-bold text-foreground shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-muted active:translate-y-0"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={confirmClearDraft}
                className="rounded-lg border-2 border-ink bg-destructive px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === "idle") return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1 text-[11px] font-bold shadow-pop-sm transition-all duration-300 ${
        status === "saving"
          ? "bg-warning-soft text-warning"
          : "bg-success-soft text-success"
      }`}
    >
      {status === "saving" ? (
        <>
          <Loader2 size={12} className="animate-spin text-warning" />
          Đang lưu nháp…
        </>
      ) : (
        <>
          <CheckCircle2 size={12} className="text-success" />
          Đã lưu trên máy
        </>
      )}
    </span>
  );
}
