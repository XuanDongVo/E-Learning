"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  ImageIcon,
  Volume2,
  Loader2,
} from "lucide-react";
import {
  questionDifficultyOptions,
  questionTypeOptions,
  type DraftQuestion,
  type QuestionMediaDraft,
  type QuestionOptionDraft,
  type QuestionType,
  type QuestionDifficulty,
} from "@/types/question";
import { makeOptions } from "./question-draft";

export type {
  DraftQuestion,
  QuestionType,
  QuestionMediaDraft,
  QuestionOptionDraft,
  QuestionDifficulty,
} from "@/types/question";
export type DraftOption = QuestionOptionDraft;
export type Difficulty = QuestionDifficulty;
export type QuestionMediaUploadResult = { id: number | string; url?: string };
export type QuestionMediaUploadHandler = (
  file: File,
) => Promise<QuestionMediaUploadResult>;

export const questionTypes = questionTypeOptions;
export const difficultyOptions = questionDifficultyOptions;

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10";

const selectClassName =
  "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10";

export function QuestionForm({
  question,
  onChange,
  onUploadMedia,
}: {
  question: DraftQuestion;
  onChange: (patch: Partial<DraftQuestion>) => void;
  onUploadMedia: QuestionMediaUploadHandler;
}) {
  const [pendingTypeChange, setPendingTypeChange] = useState<QuestionType | null>(null);
  // Per-kind upload state — only disables that specific attach button
  const [uploadingKind, setUploadingKind] = useState<"image" | "audio" | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const currentImage = question.media.find((m) => m.kind === "image");
  const currentAudio = question.media.find((m) => m.kind === "audio");

  // ── Options
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

  // ── Accepted answers
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

  // ── Question type change 
  const handleTypeSelect = (nextType: QuestionType) => {
    if (nextType === question.type) return;
    const hasData =
      question.options.some((o) => o.text.trim()) ||
      question.acceptedAnswers.some((a) => a.trim());
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "image" | "audio",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingKind(kind);
    try {
      const res = await onUploadMedia(file);

      const newMedia: QuestionMediaDraft = {
        id: String(res.id),
        name: file.name,
        kind,
        sizeLabel: `${Math.round(file.size / 1024)} KB`,
        url: res.url ?? URL.createObjectURL(file),
      };

      onChange({
        media: [...question.media.filter((m) => m.kind !== kind), newMedia],
      });
    } catch (err: any) {
      alert(err.message || "Failed to upload media. Please try again.");
    } finally {
      setUploadingKind(null);
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
              Changing question type to <b>{pendingTypeChange}</b> will reset your current choices
              and answers. Are you sure?
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

      {/* Question text */}
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
            ⚠️ Fill in the Blank questions require 4 underscores{" "}
            <code className="bg-amber-100 px-1 rounded">____</code> in the prompt text.
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

      {/* Optional Learning Mode hint */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Hint (Optional)</span>
        <textarea
          value={question.hint}
          onChange={(event) => onChange({ hint: event.target.value })}
          placeholder="Give a small clue without revealing the answer..."
          rows={2}
          maxLength={500}
          className={`${inputClassName} resize-y`}
        />
      </label>

      {/* ── Media Attachments ─────────────────────────────────────────────────── */}
      {/*
        Server-side PENDING lifecycle:
          • Upload → server stores media as PENDING
          • Save question with mediaIds → server marks them READY (linked to question)
          • Any PENDING media not saved → cron job deletes orphans
        Constraint: max 1 image + max 1 audio per question.
      */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Media Attachments
          </span>
          <span className="text-[10px] text-slate-400">Max: 1 image + 1 audio</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Image slot */}
          <MediaSlot
            kind="image"
            label="Image"
            icon={<ImageIcon size={14} />}
            accept="image/*"
            current={currentImage}
            isUploading={uploadingKind === "image"}
            inputRef={imageInputRef}
            onUpload={(e) => handleFileUpload(e, "image")}
            onRemove={() => currentImage && removeMedia(currentImage.id)}
          />

          {/* Audio slot */}
          <MediaSlot
            kind="audio"
            label="Audio"
            icon={<Volume2 size={14} />}
            accept="audio/*"
            current={currentAudio}
            isUploading={uploadingKind === "audio"}
            inputRef={audioInputRef}
            onUpload={(e) => handleFileUpload(e, "audio")}
            onRemove={() => currentAudio && removeMedia(currentAudio.id)}
          />
        </div>
      </div>
    </div>
  );
}

// ── MediaSlot sub-component ──────────────────────────────────────────────────

function MediaSlot({
  kind,
  label,
  icon,
  accept,
  current,
  isUploading,
  inputRef,
  onUpload,
  onRemove,
}: {
  kind: "image" | "audio";
  label: string;
  icon: React.ReactNode;
  accept: string;
  current: QuestionMediaDraft | undefined;
  isUploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  if (current) {
    // ── Attached state ────────────────────────────────────────────────────────
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5">
        {kind === "image" && current.url && (
          <img
            src={current.url}
            alt={current.name}
            className="h-20 w-full rounded-md object-cover border border-slate-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/200x80/e2e8f0/475569?text=Preview";
            }}
          />
        )}
        {kind === "audio" && current.url && (
          <audio controls src={current.url} className="h-8 w-full" />
        )}
        <div className="flex items-center justify-between gap-1">
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-600">
            {current.name}
          </span>
          <button
            type="button"
            onClick={onRemove}
            title="Remove media"
            className="shrink-0 rounded p-0.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
          >
            <X size={13} />
          </button>
        </div>
        {current.sizeLabel && (
          <span className="text-[10px] text-slate-400">{current.sizeLabel}</span>
        )}
      </div>
    );
  }

  // ── Empty slot ─────────────────────────────────────────────────────────────
  return (
    <label
      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-4 text-center transition cursor-pointer
        ${isUploading
          ? "border-primary/40 bg-primary/5 text-primary"
          : "border-slate-200 bg-white text-slate-400 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        }`}
    >
      {isUploading ? (
        <>
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-[11px] font-medium">Uploading...</span>
        </>
      ) : (
        <>
          <span className="text-slate-400">{icon}</span>
          <span className="text-[11px] font-semibold">Attach {label}</span>
          <span className="text-[10px] text-slate-400">
            {kind === "image" ? "PNG, JPG, GIF…" : "MP3, WAV, AAC…"}
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={isUploading}
        onChange={onUpload}
      />
    </label>
  );
}