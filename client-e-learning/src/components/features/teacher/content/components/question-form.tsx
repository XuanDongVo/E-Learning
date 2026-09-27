"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, Plus, Trash2, AlertTriangle, X } from "lucide-react";
import {
  questionDifficultyOptions,
  questionTypeOptions,
  type ContentDifficulty,
  type DraftQuestion,
  type QuestionOptionDraft,
  type QuestionType,
} from "@/types/content";
import { contentService } from "@/services/content.service";

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
    type: "SINGLE_CHOICE",
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
  if (question.type === "FILL_IN_BLANK") {
    if (!question.text.includes("____")) return false;
    return question.acceptedAnswers.some((answer) => answer.trim().length > 0);
  }
  if (question.type === "TYPE_ANSWER") {
    return question.acceptedAnswers.some((answer) => answer.trim().length > 0);
  }
  return true;
}

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10";

const selectClassName =
  "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10";

export function QuestionForm({
  question,
  onChange,
}: {
  question: DraftQuestion;
  onChange: (patch: Partial<DraftQuestion>) => void;
}) {
  const [pendingTypeChange, setPendingTypeChange] = useState<QuestionType | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);


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

  const handleTypeSelect = (nextType: QuestionType) => {
    if (nextType === question.type) return;
    // Prompt warning if user has non-empty text/options
    const hasData = question.options.some((o) => o.text.trim()) || question.acceptedAnswers.some((a) => a.trim());
    if (hasData) {
      setPendingTypeChange(nextType);
    } else {
      applyTypeChange(nextType);
    }
  };

  const applyTypeChange = (nextType: QuestionType) => {
    const patch: Partial<DraftQuestion> = { type: nextType };
    if (nextType === "SINGLE_CHOICE" || nextType === "MULTIPLE_CHOICE") {
      const options = makeOptions(4);
      patch.options = options;
      patch.correctOptionIds = options[0]?.id ? [options[0].id] : [];
    } else if (nextType === "TRUE_FALSE") {
      patch.trueFalseAnswer = "TRUE";
    } else if (nextType === "FILL_IN_BLANK" || nextType === "TYPE_ANSWER") {
      patch.acceptedAnswers = [""];
    }
    onChange(patch);
    setPendingTypeChange(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const res = await contentService.uploadMedia(file);
      if (!res.data) throw new Error("Upload failed");
      const mediaId = String(res.data.id);
      const kind = file.type.startsWith("audio") ? "audio" : "image";
      onChange({
        media: [
          ...question.media,
          { id: mediaId, name: file.name, kind, sizeLabel: `${Math.round(file.size / 1024)} KB` },
        ],
      });
    } catch (err) {
      alert("Failed to upload media file.");
    } finally {
      setIsUploadingMedia(false);
      event.target.value = "";
    }
  };

  const removeMedia = (mediaId: string) => {
    onChange({ media: question.media.filter((item) => item.id !== mediaId) });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Type Change Warning Modal */}
      {pendingTypeChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-slate-800">Change Question Type?</h3>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Changing question type to <b>{pendingTypeChange}</b> will reset your current choices and answers. Are you sure?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingTypeChange(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => applyTypeChange(pendingTypeChange)}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Type + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Type</span>
          <div className="relative">
            <select
              className={selectClassName}
              value={question.type}
              onChange={(event) => handleTypeSelect(event.target.value as QuestionType)}
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

      {/* Question text with Fill In Blank Helper */}
      <label className="block">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Question</span>
          {question.type === "FILL_IN_BLANK" && (
            <button
              type="button"
              onClick={() => {
                const text = question.text;
                onChange({ text: text + (text ? " " : "") + "____" });
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              + Insert Blank (____)
            </button>
          )}
        </div>
        <textarea
          value={question.text}
          onChange={(event) => onChange({ text: event.target.value })}
          placeholder={
            question.type === "FILL_IN_BLANK"
              ? "e.g. She ____ to school yesterday."
              : "Enter your question prompt..."
          }
          rows={3}
          className={`${inputClassName} resize-y`}
        />
        {question.type === "FILL_IN_BLANK" && !question.text.includes("____") && (
          <p className="mt-1 text-xs text-amber-600 font-medium">
            ⚠️ Fill in the Blank questions require 4 underscores <code className="bg-amber-100 px-1 rounded">____</code> in the prompt text.
          </p>
        )}
      </label>

      {/* Choice questions */}
      {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {question.type === "SINGLE_CHOICE"
                ? "Options (select one correct)"
                : "Options (select one or more correct)"}
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
                  className={`flex items-center gap-2.5 rounded-lg border p-2 transition ${isCorrect ? "border-primary bg-primary-light/40" : "border-slate-200"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nextCorrectOptionIds =
                        question.type === "SINGLE_CHOICE"
                          ? [option.id]
                          : isCorrect
                            ? question.correctOptionIds.filter((id) => id !== option.id)
                            : [...question.correctOptionIds, option.id];
                      onChange({ correctOptionIds: nextCorrectOptionIds });
                    }}
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${isCorrect ? "border-primary bg-primary" : "border-slate-300"
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
          <span className="mb-2 block text-xs font-medium text-slate-500">Correct Answer</span>
          <div className="grid grid-cols-2 gap-2">
            {(["TRUE", "FALSE"] as const).map((value) => {
              const isSelected = question.trueFalseAnswer === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ trueFalseAnswer: value })}
                  className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-bold transition ${isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Text Answers (Fill in blank / Type answer) */}
      {(question.type === "FILL_IN_BLANK" || question.type === "TYPE_ANSWER") && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Accepted Answers</span>
            <button
              type="button"
              onClick={addAcceptedAnswer}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
            >
              <Plus size={12} /> Add alternative answer
            </button>
          </div>

          <div className="space-y-2">
            {question.acceptedAnswers.map((answer, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={answer}
                  onChange={(e) => updateAcceptedAnswer(index, e.target.value)}
                  placeholder={`Accepted answer ${index + 1}`}
                  className={inputClassName}
                />
                <button
                  type="button"
                  disabled={question.acceptedAnswers.length <= 1}
                  onClick={() => removeAcceptedAnswer(index)}
                  className="shrink-0 rounded-md p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Explanation (Optional)</span>
        <textarea
          value={question.explanation}
          onChange={(event) => onChange({ explanation: event.target.value })}
          placeholder="Explain why the answer is correct..."
          rows={2}
          className={`${inputClassName} resize-y`}
        />
      </label>

      {/* Media Attachments */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Media Attachments</span>
          <label className="cursor-pointer text-xs font-bold text-primary hover:underline">
            {isUploadingMedia ? "Uploading..." : "+ Attach Media"}
            <input
              type="file"
              accept="image/*,audio/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploadingMedia}
            />
          </label>
        </div>

        {question.media.length > 0 && (
          <div className="space-y-2">
            {question.media.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              >
                <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                  {item.name} ({item.kind})
                </span>
                <button
                  type="button"
                  onClick={() => removeMedia(item.id)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}