"use client";

import { useState } from "react";

import type { ContentView, DraftQuestion } from "@/types/content";
import { QuestionList } from "./question-list";
import { BulkSaveBar } from "./bulk-save-bar";
import {
  QuestionForm,
  isQuestionComplete,
  makeDraftQuestion,
} from "./question-form";

export function BulkQuestionCreator({
  bankName = "Past Simple - Basic",
  onNavigate,
}: {
  bankName?: string;
  onNavigate: (view: ContentView) => void;
}) {
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => [
    makeDraftQuestion(),
  ]);
  const [activeDraftId, setActiveDraftId] = useState<string>(
    questions[0].draftId,
  );
  const [isSaving, setIsSaving] = useState(false);

  const validCount = questions.filter(isQuestionComplete).length;
  const activeQuestion = questions.find(
    (question) => question.draftId === activeDraftId,
  );

  // Adding a question immediately selects it and opens the form ready to
  // type into — no "add row, then click it to start editing" step.
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

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: POST /api/v1/question-banks/{bankId}/questions/bulk
    // Body: { questions: questions.map(toApiPayload) }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onNavigate("bank");
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="mt-3 text-page-title font-bold text-slate-900">
          Create questions for {bankName}
        </h1>
        <p className="mt-1 text-body-sm text-slate-400">
          Add questions to the list and fill in the details for each one.
        </p>
      </div>

      <div className="grid gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <div
          className="
  grid min-h-0
  h-[calc(100vh-150px)]
  grid-cols-1
  overflow-hidden
  rounded-xl
  border border-slate-200

  lg:grid-cols-[280px_minmax(0,1fr)]
  lg:h-[calc(100vh-180px)]
"
        >
          <QuestionList
            questions={questions}
            activeDraftId={activeDraftId}
            onSelect={setActiveDraftId}
            onAddOne={addOne}
            onAddMany={addMany}
            onDuplicate={duplicate}
            onDelete={remove}
          />
        </div>

        <div className="p-4 sm:p-5">
          {activeQuestion ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Question{" "}
                  {questions.findIndex(
                    (q) => q.draftId === activeQuestion.draftId,
                  ) + 1}
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

      <BulkSaveBar
        total={questions.length}
        validCount={validCount}
        isSaving={isSaving}
        onSaveDraft={handleSave}
        onSave={handleSave}
      />
    </>
  );
}
