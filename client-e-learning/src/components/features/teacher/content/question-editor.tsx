"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  questionDifficultyOptions,
  questionTypeOptions,
  type ContentDifficulty,
  type ContentView,
  type QuestionOptionDraft,
  type QuestionType,
} from "@/types/content";

import { Badge } from "./components/badge";

const questionTypes = questionTypeOptions;
const difficultyOptions = questionDifficultyOptions;

const initialOptions: QuestionOptionDraft[] = [
  {
    id: "A",
    text: "go",
  },
  {
    id: "B",
    text: "went",
  },
  {
    id: "C",
    text: "goes",
  },
  {
    id: "D",
    text: "going",
  },
];

const inputClassName =
  "w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2.5 text-sm text-[var(--neutral-dark)] outline-none transition-all placeholder:text-[var(--neutral-subtle)] hover:border-slate-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";

const selectClassName =
  "h-10 w-full appearance-none rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-3 pr-9 text-sm text-[var(--neutral-dark)] outline-none transition-all hover:border-slate-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";

const sectionClassName =
  "rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-5";

// NOTE: this component is now the single-question detail/edit surface,
// opened from a row in QuestionBankDetail's table ("Question #N → Edit").
// Creating new questions in bulk happens in BulkCreateQuestions instead —
// see QuestionBankDetail's "Add questions" menu. Logic below is unchanged
// from the original; only header copy reflects the new role.
export function QuestionEditor({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  const [type, setType] = useState<QuestionType>("SINGLE_CHOICE");
  const [difficulty, setDifficulty] = useState<ContentDifficulty>("EASY");

  const [questionText, setQuestionText] = useState(
    "She ____ to school yesterday.",
  );

  const [options, setOptions] = useState<QuestionOptionDraft[]>(initialOptions);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>(["B"]);

  const [trueFalseAnswer, setTrueFalseAnswer] = useState<"TRUE" | "FALSE">(
    "TRUE",
  );

  const [correctAnswers, setCorrectAnswers] = useState<string[]>(["went"]);

  const [explanation, setExplanation] = useState(
    "The past simple is used for completed actions in the past.",
  );

  const [isSaving, setIsSaving] = useState(false);

  const selectedTypeLabel =
    questionTypes.find((item) => item.value === type)?.label ?? "Question";

  const addOption = () => {
    const nextIndex = options.length;

    if (nextIndex >= 8) {
      return;
    }

    const id = String.fromCharCode(65 + nextIndex);

    setOptions((current) => [
      ...current,
      {
        id,
        text: "",
      },
    ]);
  };

  const updateOption = (id: string, text: string) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === id
          ? {
              ...option,
              text,
            }
          : option,
      ),
    );
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      return;
    }

    const remaining = options.filter((option) => option.id !== id);

    const normalized = remaining.map((option, index) => ({
      ...option,
      id: String.fromCharCode(65 + index),
    }));

    const remainingCorrectOptionIds = correctOptionIds.filter(
      (optionId) => optionId !== id,
    );

    setOptions(normalized);

    setCorrectOptionIds(
      remainingCorrectOptionIds
        .map((optionId) => {
          const oldCorrectIndex = remaining.findIndex(
            (option) => option.id === optionId,
          );
          return oldCorrectIndex === -1
            ? ""
            : String.fromCharCode(65 + oldCorrectIndex);
        })
        .filter(Boolean),
    );
  };

  const addAcceptedAnswer = () => {
    setCorrectAnswers((current) => [...current, ""]);
  };

  const updateAcceptedAnswer = (index: number, value: string) => {
    setCorrectAnswers((current) =>
      current.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    );
  };

  const removeAcceptedAnswer = (index: number) => {
    if (correctAnswers.length <= 1) {
      return;
    }

    setCorrectAnswers((current) =>
      current.filter((_, answerIndex) => answerIndex !== index),
    );
  };

  const handleTypeChange = (nextType: QuestionType) => {
    setType(nextType);

    if (nextType === "SINGLE_CHOICE" || nextType === "MULTIPLE_CHOICE") {
      setCorrectOptionIds(options[0]?.id ? [options[0].id] : []);
    }

    if (nextType === "TRUE_FALSE") {
      setTrueFalseAnswer("TRUE");
    }

    if (nextType === "FILL_IN_BLANK") {
      setCorrectAnswers((current) => (current.length > 0 ? current : [""]));
    }

    if (nextType === "TYPE_ANSWER") {
      setCorrectAnswers((current) => (current.length > 0 ? current : [""]));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // TODO:
    // Build request payload and call PUT /api/v1/questions/{questionId}
    // here — editing a single existing question, not bulk authoring.

    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSaving(false);
    onNavigate("bank");
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-body-sm font-medium text-[var(--neutral-subtle)]">
            <span>Past Simple - Basic</span>

            <Badge tone="blue">{selectedTypeLabel}</Badge>
          </div>

          <h1 className="text-page-title font-bold text-[var(--neutral-dark)]">
            Edit Question
          </h1>

          <p className="mt-1 text-sm text-[var(--neutral-muted)]">
            Update this question&apos;s content, answer and settings.
          </p>
        </div>

        <button
          type="button"
          className="
            inline-flex h-10 shrink-0 items-center justify-center gap-2
            rounded-lg border border-[var(--border-color)]
            bg-[var(--card-bg)] px-3.5
            text-sm font-medium text-[var(--primary)]
            transition-all
            hover:border-[var(--primary)]
            hover:bg-[var(--primary-light)]
          "
        >
          <Eye size={15} />
          Preview
        </button>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.7fr)]">
        {/* Left Column */}
        <section className={sectionClassName}>
          <div className="mb-5 border-b border-[var(--border-color)] pb-4">
            <h2 className="text-base font-bold text-[var(--neutral-dark)]">
              Question Details
            </h2>

            <p className="mt-1 text-sm text-[var(--neutral-muted)]">
              Configure the question type, difficulty, content and answer.
            </p>
          </div>

          {/* Question Type */}
          <div className="mb-4">
            <label
              htmlFor="question-type"
              className="mb-1.5 block text-sm font-semibold text-[var(--neutral-dark)]"
            >
              Question Type
            </label>

            <div className="relative">
              <select
                id="question-type"
                className={selectClassName}
                value={type}
                onChange={(event) =>
                  handleTypeChange(event.target.value as QuestionType)
                }
              >
                {questionTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-subtle)]"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-5">
            <label
              htmlFor="difficulty"
              className="mb-1.5 block text-sm font-semibold text-[var(--neutral-dark)]"
            >
              Difficulty
            </label>

            <div className="relative">
              <select
                id="difficulty"
                className={selectClassName}
                value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value as ContentDifficulty)
                  }
              >
                {difficultyOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-subtle)]"
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <label
              htmlFor="question-text"
              className="mb-1.5 block text-sm font-semibold text-[var(--neutral-dark)]"
            >
              Question Text
            </label>

            <textarea
              id="question-text"
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              className={`${inputClassName} min-h-[110px] resize-y`}
              placeholder="Enter your question..."
            />
          </div>

          {/* Choice questions */}
          {(type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") && (
            <div className="mb-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--neutral-dark)]">
                    {type === "SINGLE_CHOICE"
                      ? "Options (choose one)"
                      : "Options (choose one or more)"}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--neutral-muted)]">
                    Select one option as the correct answer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addOption}
                  className="
                    inline-flex shrink-0 items-center gap-1.5
                    rounded-lg px-2.5 py-2
                    text-sm font-medium text-[var(--primary)]
                    transition-colors
                    hover:bg-[var(--primary-light)]
                  "
                >
                  <Plus size={14} />
                  Add option
                </button>
              </div>

              <div className="space-y-2.5">
                {options.map((option) => {
                  const isCorrect = correctOptionIds.includes(option.id);

                  return (
                    <div
                      key={option.id}
                      className={`
                        group flex items-center gap-3 rounded-xl border p-3
                        transition-all duration-150
                        ${
                          isCorrect
                            ? "border-[var(--primary)] bg-[var(--primary-light)]"
                            : "border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
                        }
                      `}
                    >
                      {/* Correct Selector */}
                      <button
                        type="button"
                        aria-label={`Set option ${option.id} as correct`}
                        aria-pressed={isCorrect}
                        onClick={() => {
                          setCorrectOptionIds((current) =>
                            type === "SINGLE_CHOICE"
                              ? [option.id]
                              : current.includes(option.id)
                                ? current.filter((id) => id !== option.id)
                                : [...current, option.id],
                          );
                        }}
                        className={`
                          grid h-5 w-5 shrink-0 place-items-center rounded-full border-2
                          transition-all duration-150
                          ${
                            isCorrect
                              ? "border-[var(--primary)] bg-[var(--primary)]"
                              : "border-slate-300 bg-[var(--card-bg)] group-hover:border-[var(--primary)]"
                          }
                        `}
                      >
                        {isCorrect && (
                          <span className="h-2 w-2 rounded-full bg-[var(--primary-foreground)]" />
                        )}
                      </button>

                      {/* Option Letter */}
                      <span
                        className={`
                          grid h-8 w-8 shrink-0 place-items-center rounded-lg
                          text-xs font-bold transition-colors
                          ${
                            isCorrect
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "bg-[var(--background)] text-[var(--neutral-muted)]"
                          }
                        `}
                      >
                        {option.id}
                      </span>

                      {/* Option Input */}
                      <input
                        value={option.text}
                        onChange={(event) =>
                          updateOption(option.id, event.target.value)
                        }
                        placeholder={`Option ${option.id}`}
                        className="
                          min-w-0 flex-1 bg-transparent
                          text-sm font-medium
                          text-[var(--neutral-dark)]
                          outline-none
                          placeholder:text-[var(--neutral-subtle)]
                        "
                      />

                      {/* Correct Label */}
                      {isCorrect && (
                        <span className="hidden items-center gap-1.5 text-xs font-semibold text-[var(--primary)] sm:flex">
                          <CheckCircle2 size={15} />
                          Correct
                        </span>
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        aria-label={`Remove option ${option.id}`}
                        disabled={options.length <= 2}
                        onClick={() => removeOption(option.id)}
                        className="
                          grid h-8 w-8 shrink-0 place-items-center rounded-lg
                          text-[var(--neutral-subtle)]
                          transition-colors
                          hover:bg-rose-50 hover:text-rose-500
                          disabled:pointer-events-none disabled:opacity-30
                        "
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--neutral-muted)]">
                <CheckCircle2 size={14} className="text-[var(--primary)]" />
                <span>Choose the radio button next to the correct answer.</span>
              </div>
            </div>
          )}

          {/* True / False */}
          {type === "TRUE_FALSE" && (
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[var(--neutral-dark)]">
                  Correct Answer
                </h3>

                <p className="mt-1 text-xs text-[var(--neutral-muted)]">
                  Select whether the statement is true or false.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {(["TRUE", "FALSE"] as const).map((value) => {
                  const isSelected = trueFalseAnswer === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setTrueFalseAnswer(value)}
                      className={`
                        flex items-center gap-3 rounded-xl border p-3.5
                        text-left transition-all duration-150
                        ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary-light)]"
                            : "border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
                        }
                      `}
                    >
                      <span
                        className={`
                          grid h-5 w-5 place-items-center rounded-full border-2
                          ${
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)]"
                              : "border-slate-300"
                          }
                        `}
                      >
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-[var(--primary-foreground)]" />
                        )}
                      </span>

                      <span
                        className={`
                          text-sm font-semibold
                          ${
                            isSelected
                              ? "text-[var(--primary)]"
                              : "text-[var(--neutral-dark)]"
                          }
                        `}
                      >
                        {value === "TRUE" ? "True" : "False"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fill in the Blank */}
          {type === "FILL_IN_BLANK" && (
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[var(--neutral-dark)]">
                  Accepted Answers
                </h3>

                <p className="mt-1 text-xs text-[var(--neutral-muted)]">
                  Add one or more answers that should be accepted.
                </p>
              </div>

              <div className="space-y-2.5">
                {correctAnswers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--background)] text-xs font-semibold text-[var(--neutral-muted)]">
                      {index + 1}
                    </div>

                    <input
                      value={answer}
                      onChange={(event) =>
                        updateAcceptedAnswer(index, event.target.value)
                      }
                      placeholder="Accepted answer"
                      className={inputClassName}
                    />

                    <button
                      type="button"
                      aria-label="Remove answer"
                      disabled={correctAnswers.length <= 1}
                      onClick={() => removeAcceptedAnswer(index)}
                      className="
                        grid h-10 w-10 shrink-0 place-items-center rounded-lg
                        text-[var(--neutral-subtle)]
                        transition-colors
                        hover:bg-rose-50 hover:text-rose-500
                        disabled:pointer-events-none disabled:opacity-30
                      "
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAcceptedAnswer}
                className="
                  mt-3 inline-flex items-center gap-1.5
                  rounded-lg px-2.5 py-2
                  text-sm font-medium text-[var(--primary)]
                  transition-colors
                  hover:bg-[var(--primary-light)]
                "
              >
                <Plus size={14} />
                Add accepted answer
              </button>
            </div>
          )}

          {/* Type Answer */}
          {type === "TYPE_ANSWER" && (
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-[var(--neutral-dark)]">
                  Accepted Answers
                </h3>

                <p className="mt-1 text-xs text-[var(--neutral-muted)]">
                  Add possible answers that should be considered correct.
                </p>
              </div>

              <div className="space-y-2.5">
                {correctAnswers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--background)] text-xs font-semibold text-[var(--neutral-muted)]">
                      {index + 1}
                    </div>

                    <input
                      value={answer}
                      onChange={(event) =>
                        updateAcceptedAnswer(index, event.target.value)
                      }
                      placeholder="Accepted answer"
                      className={inputClassName}
                    />

                    <button
                      type="button"
                      aria-label="Remove answer"
                      disabled={correctAnswers.length <= 1}
                      onClick={() => removeAcceptedAnswer(index)}
                      className="
                        grid h-10 w-10 shrink-0 place-items-center rounded-lg
                        text-[var(--neutral-subtle)]
                        transition-colors
                        hover:bg-rose-50 hover:text-rose-500
                        disabled:pointer-events-none disabled:opacity-30
                      "
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAcceptedAnswer}
                className="
                  mt-3 inline-flex items-center gap-1.5
                  rounded-lg px-2.5 py-2
                  text-sm font-medium text-[var(--primary)]
                  transition-colors
                  hover:bg-[var(--primary-light)]
                "
              >
                <Plus size={14} />
                Add accepted answer
              </button>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label
              htmlFor="explanation"
              className="mb-1.5 block text-sm font-semibold text-[var(--neutral-dark)]"
            >
              Explanation
            </label>

            <textarea
              id="explanation"
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              className={`${inputClassName} min-h-[100px] resize-y`}
              placeholder="Explain why the answer is correct..."
            />
          </div>
        </section>

        {/* Right Column */}
        <aside className="flex flex-col gap-4">
          {/* Media */}
          <section className={sectionClassName}>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[var(--neutral-dark)]">
                Media
                <span className="ml-1 font-normal text-[var(--neutral-subtle)]">
                  (optional)
                </span>
              </h3>

              <p className="mt-1 text-xs text-[var(--neutral-muted)]">
                Add visual or audio content to support the question.
              </p>
            </div>

            <button
              type="button"
              className="
                flex min-h-[130px] w-full flex-col items-center justify-center
                gap-2 rounded-xl border border-dashed
                border-[var(--border-color)]
                bg-[var(--background)]
                text-center text-[var(--neutral-muted)]
                transition-colors
                hover:border-[var(--primary)]
                hover:bg-[var(--primary-light)]
                hover:text-[var(--primary)]
              "
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--card-bg)] shadow-sm">
                <Plus size={17} />
              </span>

              <span className="text-sm font-medium">Upload media</span>

              <span className="text-xs text-[var(--neutral-subtle)]">
                Image, audio or video
              </span>
            </button>
          </section>

          {/* Tags */}
          <section className={sectionClassName}>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[var(--neutral-dark)]">
                Tags
              </h3>

              <p className="mt-1 text-xs text-[var(--neutral-muted)]">
                Organize this question for easier filtering.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="blue">Past Simple</Badge>
              <Badge tone="violet">Grammar</Badge>

              <button
                type="button"
                className="
                  inline-flex items-center gap-1.5
                  rounded-full bg-[var(--background)]
                  px-2.5 py-1.5
                  text-xs font-medium text-[var(--neutral-muted)]
                  transition-colors
                  hover:bg-[var(--primary-light)]
                  hover:text-[var(--primary)]
                "
              >
                <Plus size={12} />
                Add tag
              </button>
            </div>
          </section>

          <div
            className="
          mt-5 flex flex-col-reverse gap-2
          border-t border-[var(--border-color)]
          pt-4 sm:flex-row sm:justify-end
        "
          >
            <button
              type="button"
              onClick={() => onNavigate("bank")}
              className="
            inline-flex h-10 items-center justify-center gap-2
            rounded-lg border border-[var(--border-color)]
            bg-[var(--card-bg)] px-4
            text-sm font-medium text-[var(--neutral-muted)]
            transition-colors
            hover:border-slate-300
            hover:bg-[var(--background)]
            hover:text-[var(--neutral-dark)]
          "
            >
              <X size={15} />
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="
            inline-flex h-10 items-center justify-center gap-2
            rounded-lg bg-[var(--primary)]
            px-4
            text-sm font-semibold
            text-[var(--primary-foreground)]
            transition-colors
            hover:bg-[var(--primary-hover)]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary-foreground)] border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}