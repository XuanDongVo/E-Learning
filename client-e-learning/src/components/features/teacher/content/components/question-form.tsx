"use client";

"use client";

import { ChevronDown, CheckCircle2, ImagePlus, Music, Plus, Trash2, X } from "lucide-react";
import {
  questionDifficultyOptions,
  questionTypeOptions,
  type ContentDifficulty,
  type DraftQuestion,
  type QuestionOptionDraft,
  type QuestionType,
} from "@/types/content";

export type { DraftQuestion, QuestionType } from "@/types/content";
export type DraftOption = QuestionOptionDraft;
export type Difficulty = ContentDifficulty;
export const questionTypes = questionTypeOptions;
export const difficultyOptions = questionDifficultyOptions;

export function makeOptions(count: number): DraftOption[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String.fromCharCode(65 + index),
    text: "",
  }));
}

export function makeDraftQuestion(overrides?: Partial<DraftQuestion>): DraftQuestion {
  const options = overrides?.options ?? makeOptions(4);
  return {
    draftId: `draft-${Math.random().toString(36).slice(2, 9)}`,
    type: "MULTIPLE_CHOICE",
    difficulty: "EASY",
    text: "",
    options,
    correctOptionIds: options[0]?.id ? [options[0].id] : [],
    trueFalseAnswer: "TRUE",
    acceptedAnswers: [""],
    media: [],
    explanation: "",
    ...overrides,
  };
}

export function isQuestionComplete(question: DraftQuestion): boolean {
  if (!question.text.trim()) return false;
  if (question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") {
    const filled = question.options.every((option) => option.text.trim().length > 0);
    const correctCount = question.correctOptionIds.filter((id) =>
      question.options.some((option) => option.id === id),
    ).length;
    const hasValidCorrectCount =
      question.type === "SINGLE_CHOICE" ? correctCount === 1 : correctCount > 0;
    return filled && hasValidCorrectCount;
  }
  if (question.type === "FILL_IN_BLANK" || question.type === "TYPE_ANSWER") {
    return question.acceptedAnswers.some((answer) => answer.trim().length > 0);
  }
  return true; // TRUE_FALSE always has a default answer
}

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10";

const selectClassName =
  "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10";

/**
 * Field-level editor for a single question's content, answer, media and
 * explanation. Used as the detail panel in BulkQuestionCreator, and
 * intended to be reused for a standalone "edit existing question" screen
 * later — this component owns no list/navigation concerns of its own.
 */
export function QuestionForm({
  question,
  onChange,
}: {
  question: DraftQuestion;
  onChange: (patch: Partial<DraftQuestion>) => void;
}) {
  const updateOption = (optionId: string, text: string) => {
    onChange({
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, text } : option,
      ),
    });
  };

  const addOption = () => {
    if (question.options.length >= 8) return;
    const id = String.fromCharCode(65 + question.options.length);
    onChange({ options: [...question.options, { id, text: "" }] });
  };

  const removeOption = (optionId: string) => {
    if (question.options.length <= 2) return;
    const remaining = question.options.filter((option) => option.id !== optionId);
    const normalized = remaining.map((option, index) => ({
      ...option,
      id: String.fromCharCode(65 + index),
    }));
    const remainingCorrectIds = question.correctOptionIds.filter(
      (id) => id !== optionId,
    );
    onChange({
      options: normalized,
      correctOptionIds: remainingCorrectIds
        .map((id) => {
          const oldIndex = remaining.findIndex((option) => option.id === id);
          return oldIndex === -1 ? "" : String.fromCharCode(65 + oldIndex);
        })
        .filter(Boolean),
    });
  };

  const updateAcceptedAnswer = (index: number, value: string) => {
    onChange({
      acceptedAnswers: question.acceptedAnswers.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    });
  };

  const addAcceptedAnswer = () => {
    onChange({ acceptedAnswers: [...question.acceptedAnswers, ""] });
  };

  const removeAcceptedAnswer = (index: number) => {
    if (question.acceptedAnswers.length <= 1) return;
    onChange({
      acceptedAnswers: question.acceptedAnswers.filter((_, answerIndex) => answerIndex !== index),
    });
  };

  const handleTypeChange = (nextType: QuestionType) => {
    const patch: Partial<DraftQuestion> = { type: nextType };
    if (
      (nextType === "SINGLE_CHOICE" || nextType === "MULTIPLE_CHOICE") &&
      question.options.length === 0
    ) {
      const options = makeOptions(4);
      patch.options = options;
      patch.correctOptionIds = options[0]?.id ? [options[0].id] : [];
    }
    if ((nextType === "FILL_IN_BLANK" || nextType === "TYPE_ANSWER") && question.acceptedAnswers.length === 0) {
      patch.acceptedAnswers = [""];
    }
    onChange(patch);
  };

  const addMedia = (kind: "image" | "audio") => {
    // Placeholder entry — wire this to a real file picker + upload call.
    const name = kind === "image" ? "image.jpg" : "audio.mp3";
    onChange({
      media: [
        ...question.media,
        { id: `media-${Math.random().toString(36).slice(2, 7)}`, name, kind, sizeLabel: "—" },
      ],
    });
  };

  const removeMedia = (mediaId: string) => {
    onChange({ media: question.media.filter((item) => item.id !== mediaId) });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Type + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Type</span>
          <div className="relative">
            <select
              className={selectClassName}
              value={question.type}
              onChange={(event) => handleTypeChange(event.target.value as QuestionType)}
            >
              {questionTypes.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Difficulty</span>
          <div className="relative">
            <select
              className={selectClassName}
              value={question.difficulty}
              onChange={(event) => onChange({ difficulty: event.target.value as Difficulty })}
            >
              {difficultyOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </label>
      </div>

      {/* Question text */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Question</span>
        <textarea
          value={question.text}
          onChange={(event) => onChange({ text: event.target.value })}
          placeholder="Enter your question..."
          rows={3}
          className={`${inputClassName} resize-y`}
        />
      </label>

      {/* Choice questions */}
      {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {question.type === "SINGLE_CHOICE"
                ? "Options (choose one)"
                : "Options (choose one or more)"}
            </span>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-hover"
            >
              <Plus size={12} /> Add option
            </button>
          </div>

          <div className="space-y-2">
            {question.options.map((option) => {
              const isCorrect = question.correctOptionIds.includes(option.id);
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
                    onClick={() => {
                      const nextCorrectOptionIds =
                        question.type === "SINGLE_CHOICE"
                          ? [option.id]
                          : isCorrect
                            ? question.correctOptionIds.filter((id) => id !== option.id)
                            : [...question.correctOptionIds, option.id];
                      onChange({ correctOptionIds: nextCorrectOptionIds });
                    }}
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                      isCorrect ? "border-primary bg-primary" : "border-slate-300"
                    }`}
                  >
                    {isCorrect && <span className="h-2 w-2 rounded-full bg-white" />}
                  </button>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">
                    {option.id}
                  </span>
                  <input
                    value={option.text}
                    onChange={(event) => updateOption(option.id, event.target.value)}
                    placeholder={`Option ${option.id}`}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  />
                  {isCorrect && (
                    <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-primary sm:flex">
                      <CheckCircle2 size={13} /> Correct
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove option ${option.id}`}
                    disabled={question.options.length <= 2}
                    onClick={() => removeOption(option.id)}
                    className="shrink-0 rounded-md p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* True / False */}
      {question.type === "TRUE_FALSE" && (
        <div>
          <span className="mb-2 block text-xs font-medium text-slate-500">Correct answer</span>
          <div className="grid grid-cols-2 gap-2">
            {(["TRUE", "FALSE"] as const).map((value) => {
              const isSelected = question.trueFalseAnswer === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ trueFalseAnswer: value })}
                  className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition ${
                    isSelected ? "border-primary bg-primary-light/40" : "border-slate-200 hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
                      isSelected ? "border-primary bg-primary" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-slate-700"}`}>
                    {value === "TRUE" ? "True" : "False"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fill in the blank / Type answer */}
      {(question.type === "FILL_IN_BLANK" || question.type === "TYPE_ANSWER") && (
        <div>
          <span className="mb-2 block text-xs font-medium text-slate-500">Accepted answers</span>
          <div className="space-y-2">
            {question.acceptedAnswers.map((answer, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                  {index + 1}
                </div>
                <input
                  value={answer}
                  onChange={(event) => updateAcceptedAnswer(index, event.target.value)}
                  placeholder="Accepted answer"
                  className={inputClassName}
                />
                <button
                  type="button"
                  disabled={question.acceptedAnswers.length <= 1}
                  onClick={() => removeAcceptedAnswer(index)}
                  className="shrink-0 rounded-md p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:pointer-events-none disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAcceptedAnswer}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-hover"
          >
            <Plus size={12} /> Add accepted answer
          </button>
        </div>
      )}

      {/* Media — lives on the question itself, not a batch-wide setting */}
      <div>
        <span className="mb-2 block text-xs font-medium text-slate-500">Media (optional)</span>

        {question.media.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {question.media.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-body-sm"
              >
                {item.kind === "image" ? (
                  <ImagePlus size={15} className="shrink-0 text-slate-400" />
                ) : (
                  <Music size={15} className="shrink-0 text-slate-400" />
                )}
                <span className="min-w-0 flex-1 truncate text-slate-600">{item.name}</span>
                {item.sizeLabel && <span className="shrink-0 text-xs text-slate-400">{item.sizeLabel}</span>}
                <button
                  type="button"
                  aria-label="Remove media"
                  onClick={() => removeMedia(item.id)}
                  className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addMedia("image")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-primary/50 hover:text-primary"
          >
            <ImagePlus size={14} /> Add image
          </button>
          <button
            type="button"
            onClick={() => addMedia("audio")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-primary/50 hover:text-primary"
          >
            <Music size={14} /> Add audio
          </button>
        </div>
      </div>

      {/* Explanation */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Explanation (optional)</span>
        <textarea
          value={question.explanation}
          onChange={(event) => onChange({ explanation: event.target.value })}
          placeholder="Explain why the answer is correct..."
          rows={2}
          className={`${inputClassName} resize-y`}
        />
      </label>
    </div>
  );
}