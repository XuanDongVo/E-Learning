"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Copy,
  LayoutGrid,
  Plus,
  Rows3,
  Trash2,
} from "lucide-react";

import type { ContentView } from "@/types/content";
import { Badge } from "./badge";

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "TYPE_ANSWER";
type Difficulty = "EASY" | "MEDIUM" | "HARD";
type BulkMode = "expanded" | "compact";

type DraftOption = { id: string; text: string };

type DraftQuestion = {
  draftId: string;
  type: QuestionType;
  difficulty: Difficulty;
  text: string;
  options: DraftOption[];
  correctOptionId: string;
  explanation: string;
};

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_IN_BLANK", label: "Fill in the Blank" },
  { value: "TYPE_ANSWER", label: "Type Answer" },
];

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

const selectClassName =
  "h-9 rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

function makeOptions(count: number, existing: DraftOption[] = []): DraftOption[] {
  return Array.from({ length: count }, (_, index) => {
    const id = String.fromCharCode(65 + index);
    return existing.find((option) => option.id === id) ?? { id, text: "" };
  });
}

function makeQuestion(defaults: { type: QuestionType; difficulty: Difficulty; optionCount: number }): DraftQuestion {
  const options = makeOptions(defaults.optionCount);
  return {
    draftId: `draft-${Math.random().toString(36).slice(2, 9)}`,
    type: defaults.type,
    difficulty: defaults.difficulty,
    text: "",
    options,
    correctOptionId: options[0]?.id ?? "A",
    explanation: "",
  };
}

function isQuestionComplete(question: DraftQuestion): boolean {
  if (!question.text.trim()) return false;
  if (question.type === "MULTIPLE_CHOICE") {
    const filled = question.options.every((option) => option.text.trim().length > 0);
    const hasCorrect = question.options.some((option) => option.id === question.correctOptionId);
    return filled && hasCorrect;
  }
  return true;
}

export function BulkCreateQuestions({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  const [mode, setMode] = useState<BulkMode>("expanded");
  const [defaultType, setDefaultType] = useState<QuestionType>("MULTIPLE_CHOICE");
  const [defaultDifficulty, setDefaultDifficulty] = useState<Difficulty>("EASY");
  const [defaultOptionCount, setDefaultOptionCount] = useState(4);

  const [questions, setQuestions] = useState<DraftQuestion[]>(() => [
    makeQuestion({ type: "MULTIPLE_CHOICE", difficulty: "EASY", optionCount: 4 }),
  ]);
  const [activeDraftId, setActiveDraftId] = useState<string>(questions[0]?.draftId ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const validCount = useMemo(
    () => questions.filter(isQuestionComplete).length,
    [questions],
  );
  const incompleteCount = questions.length - validCount;

  const addQuestion = () => {
    const next = makeQuestion({
      type: defaultType,
      difficulty: defaultDifficulty,
      optionCount: defaultOptionCount,
    });
    setQuestions((current) => [...current, next]);
    setActiveDraftId(next.draftId);
  };

  const duplicateQuestion = (draftId: string) => {
    const source = questions.find((question) => question.draftId === draftId);
    if (!source) return;
    const copy: DraftQuestion = {
      ...source,
      draftId: `draft-${Math.random().toString(36).slice(2, 9)}`,
      options: source.options.map((option) => ({ ...option })),
    };
    setQuestions((current) => {
      const index = current.findIndex((question) => question.draftId === draftId);
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const removeQuestion = (draftId: string) => {
    setQuestions((current) => {
      if (current.length <= 1) return current;
      const next = current.filter((question) => question.draftId !== draftId);
      if (activeDraftId === draftId) setActiveDraftId(next[0]?.draftId ?? "");
      return next;
    });
  };

  const updateQuestion = (draftId: string, patch: Partial<DraftQuestion>) => {
    setQuestions((current) =>
      current.map((question) =>
        question.draftId === draftId ? { ...question, ...patch } : question,
      ),
    );
  };

  const updateOption = (draftId: string, optionId: string, text: string) => {
    setQuestions((current) =>
      current.map((question) =>
        question.draftId === draftId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId ? { ...option, text } : option,
              ),
            }
          : question,
      ),
    );
  };

  const handleSave = async (publish: boolean) => {
    setIsSaving(true);
    // TODO: POST /api/v1/question-banks/{bankId}/questions/bulk
    // Body: { questions: questions.map(toApiPayload), status: publish ? "PUBLISHED" : "DRAFT" }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onNavigate("bank");
  };

  const activeQuestion = questions.find((question) => question.draftId === activeDraftId) ?? questions[0];

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3">
        {/* <button
          type="button"
          onClick={() => onNavigate("bank")}
          className="inline-flex w-fit items-center gap-1.5 text-body-sm font-medium text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={15} />
          Back to Past Simple - Basic
        </button> */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-page-title font-bold text-slate-900">Create questions</h1>
            <p className="mt-1 text-body-sm text-slate-400">
              Create multiple questions and save them together.
            </p>
          </div>

          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setMode("expanded")}
              className={`flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium transition ${
                mode === "expanded" ? "bg-primary-light text-primary" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid size={14} />
              Expanded
            </button>
            <button
              type="button"
              onClick={() => setMode("compact")}
              className={`flex items-center gap-1.5 border-l border-slate-200 px-3 py-2 text-body-sm font-medium transition ${
                mode === "compact" ? "bg-primary-light text-primary" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Rows3 size={14} />
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Default settings */}
      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-5">
        <h2 className="text-sm font-bold text-slate-900">Default settings</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Applied to new questions you add below. Change any question individually afterwards.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Type</span>
            <div className="relative">
              <select
                className={`${selectClassName} w-full appearance-none`}
                value={defaultType}
                onChange={(event) => setDefaultType(event.target.value as QuestionType)}
              >
                {questionTypes.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Difficulty</span>
            <div className="relative">
              <select
                className={`${selectClassName} w-full appearance-none`}
                value={defaultDifficulty}
                onChange={(event) => setDefaultDifficulty(event.target.value as Difficulty)}
              >
                {difficultyOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Options</span>
            <div className="relative">
              <select
                className={`${selectClassName} w-full appearance-none`}
                value={defaultOptionCount}
                onChange={(event) => setDefaultOptionCount(Number(event.target.value))}
              >
                {[2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </label>
        </div>
      </section>

      {mode === "expanded" ? (
        <div className="flex flex-col gap-4">
          {questions.map((question, index) => (
            <ExpandedQuestionCard
              key={question.draftId}
              index={index}
              question={question}
              complete={isQuestionComplete(question)}
              onUpdate={(patch) => updateQuestion(question.draftId, patch)}
              onUpdateOption={(optionId, text) => updateOption(question.draftId, optionId, text)}
              onDuplicate={() => duplicateQuestion(question.draftId)}
              onRemove={() => removeQuestion(question.draftId)}
              canRemove={questions.length > 1}
            />
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary-light/20 py-3.5 text-body-sm font-semibold text-primary transition hover:border-primary hover:bg-primary-light/40"
          >
            <Plus size={16} />
            Add another question
          </button>
        </div>
      ) : (
        <CompactBulkEditor
          questions={questions}
          activeDraftId={activeQuestion?.draftId ?? ""}
          onSelect={setActiveDraftId}
          onUpdate={updateQuestion}
          onUpdateOption={updateOption}
          onAdd={addQuestion}
          onRemove={removeQuestion}
          canRemove={questions.length > 1}
        />
      )}

      {/* Footer summary + save */}
      <div className="sticky bottom-4 mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-body-sm">
          <span className="font-semibold text-slate-800">{questions.length} questions</span>
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle2 size={14} /> {validCount} valid
          </span>
          {incompleteCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <AlertTriangle size={14} /> {incompleteCount} incomplete
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-body-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save as draft
          </button>
          <button
            type="button"
            disabled={isSaving || validCount === 0}
            onClick={() => handleSave(true)}
            className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : `Save ${validCount || ""} questions`}
          </button>
        </div>
      </div>
    </>
  );
}

function ExpandedQuestionCard({
  index,
  question,
  complete,
  onUpdate,
  onUpdateOption,
  onDuplicate,
  onRemove,
  canRemove,
}: {
  index: number;
  question: DraftQuestion;
  complete: boolean;
  onUpdate: (patch: Partial<DraftQuestion>) => void;
  onUpdateOption: (optionId: string, text: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">Question {index + 1}</span>
          {complete ? (
            <Badge tone="green">Ready</Badge>
          ) : (
            <Badge tone="gray">Incomplete</Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <select
              className={`${selectClassName} appearance-none pr-7 text-xs`}
              value={question.difficulty}
              onChange={(event) => onUpdate({ difficulty: event.target.value as Difficulty })}
            >
              {difficultyOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button
            type="button"
            aria-label="Duplicate question"
            title="Duplicate"
            onClick={onDuplicate}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            aria-label="Remove question"
            title="Remove"
            disabled={!canRemove}
            onClick={onRemove}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:pointer-events-none disabled:opacity-30"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <textarea
        value={question.text}
        onChange={(event) => onUpdate({ text: event.target.value })}
        placeholder="Enter your question..."
        rows={2}
        className={`${inputClassName} mb-3 resize-none`}
      />

      {question.type === "MULTIPLE_CHOICE" && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isCorrect = question.correctOptionId === option.id;
            return (
              <div
                key={option.id}
                className={`flex items-center gap-2.5 rounded-lg border p-2 transition ${
                  isCorrect ? "border-primary bg-primary-light/40" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  aria-label={`Set option ${option.id} as correct`}
                  onClick={() => onUpdate({ correctOptionId: option.id })}
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                    isCorrect ? "border-primary bg-primary" : "border-slate-300"
                  }`}
                >
                  {isCorrect && <span className="h-2 w-2 rounded-full bg-white" />}
                </button>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                  {option.id}
                </span>
                <input
                  value={option.text}
                  onChange={(event) => onUpdateOption(option.id, event.target.value)}
                  placeholder={`Option ${option.id}`}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>
            );
          })}
        </div>
      )}

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Explanation (optional)</span>
        <input
          value={question.explanation}
          onChange={(event) => onUpdate({ explanation: event.target.value })}
          placeholder="Explain why the answer is correct"
          className={inputClassName}
        />
      </label>
    </section>
  );
}

function CompactBulkEditor({
  questions,
  activeDraftId,
  onSelect,
  onUpdate,
  onUpdateOption,
  onAdd,
  onRemove,
  canRemove,
}: {
  questions: DraftQuestion[];
  activeDraftId: string;
  onSelect: (draftId: string) => void;
  onUpdate: (draftId: string, patch: Partial<DraftQuestion>) => void;
  onUpdateOption: (draftId: string, optionId: string, text: string) => void;
  onAdd: () => void;
  onRemove: (draftId: string) => void;
  canRemove: boolean;
}) {
  const active = questions.find((question) => question.draftId === activeDraftId);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Spreadsheet-style list */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="w-10 p-2.5">#</th>
                <th className="p-2.5">Question</th>
                <th className="w-24 p-2.5">Correct</th>
                <th className="w-20 p-2.5">Status</th>
                <th className="w-10 p-2.5" />
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => {
                const isActive = question.draftId === activeDraftId;
                const complete = isQuestionComplete(question);
                const correctOption = question.options.find((option) => option.id === question.correctOptionId);
                return (
                  <tr
                    key={question.draftId}
                    onClick={() => onSelect(question.draftId)}
                    className={`cursor-pointer border-b border-slate-100 transition ${
                      isActive ? "bg-primary-light/40" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-2.5 font-mono text-slate-400">{index + 1}</td>
                    <td className="max-w-[240px] truncate p-2.5 text-slate-700">
                      {question.text || <span className="text-slate-300">Untitled question</span>}
                    </td>
                    <td className="p-2.5 text-slate-500">{correctOption?.text || "—"}</td>
                    <td className="p-2.5">
                      {complete ? (
                        <Badge tone="green">Ready</Badge>
                      ) : (
                        <Badge tone="gray">Draft</Badge>
                      )}
                    </td>
                    <td className="p-2.5" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        disabled={!canRemove}
                        onClick={() => onRemove(question.draftId)}
                        aria-label="Remove question"
                        className="rounded p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:pointer-events-none disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-2 border-t border-slate-100 py-3 text-body-sm font-semibold text-primary transition hover:bg-primary-light/30"
        >
          <Plus size={15} />
          Add row
        </button>
      </section>

      {/* Detail panel for the selected row */}
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
        {active ? (
          <>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Question detail</h3>

            <textarea
              value={active.text}
              onChange={(event) => onUpdate(active.draftId, { text: event.target.value })}
              placeholder="Enter your question..."
              rows={2}
              className={`${inputClassName} mb-3 resize-none`}
            />

            {active.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                {active.options.map((option) => {
                  const isCorrect = active.correctOptionId === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 rounded-lg border p-2 transition ${
                        isCorrect ? "border-primary bg-primary-light/40" : "border-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Set option ${option.id} as correct`}
                        onClick={() => onUpdate(active.draftId, { correctOptionId: option.id })}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                          isCorrect ? "border-primary bg-primary" : "border-slate-300"
                        }`}
                      >
                        {isCorrect && <span className="h-2 w-2 rounded-full bg-white" />}
                      </button>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                        {option.id}
                      </span>
                      <input
                        value={option.text}
                        onChange={(event) => onUpdateOption(active.draftId, option.id, event.target.value)}
                        placeholder={`Option ${option.id}`}
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Explanation (optional)</span>
              <input
                value={active.explanation}
                onChange={(event) => onUpdate(active.draftId, { explanation: event.target.value })}
                placeholder="Explain why the answer is correct"
                className={inputClassName}
              />
            </label>
          </>
        ) : (
          <p className="py-8 text-center text-body-sm text-slate-400">Select a row to edit its detail.</p>
        )}
      </aside>
    </div>
  );
}