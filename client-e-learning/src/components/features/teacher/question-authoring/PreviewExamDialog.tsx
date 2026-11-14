"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Flag,
  Image as ImageIcon,
  Lightbulb,
  Monitor,
  RotateCcw,
  Smartphone,
  Volume2,
  X,
} from "lucide-react";
import type { DraftQuestion, QuestionType } from "@/types/question";
import type { GuidedStep } from "@/types/guided-reasoning";

type Phase =
  | { kind: "step"; step: GuidedStep; index: number }
  | { kind: "final" };

type Feedback = "correct" | "wrong" | null;
type Device = "desktop" | "mobile";

type PreviewProps = {
  questions: DraftQuestion[];
  initialIndex: number;
  onClose: () => void;
};

const OUTLINE_BUTTON =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40";
const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-pop-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40";

/** Teacher preview: draft-only simulation; DOES NOT call session APIs or award XP. */
export function PreviewExamDialog({
  questions,
  initialIndex,
  onClose,
}: PreviewProps) {
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(questions.length - 1, 0)),
  );
  const [device, setDevice] = useState<Device>("desktop");
  const [resetKey, setResetKey] = useState(0);
  const question = questions[questionIndex] ?? questions[0];

  if (!question) return null;

  const openQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setQuestionIndex(index);
    setResetKey((n) => n + 1);
  };

  return (
    <div
      className="student-theme fixed inset-0 z-[70] flex flex-col bg-background text-foreground"
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước bài luyện tập"
    >
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b-2 border-border bg-card px-3 py-2 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-black sm:text-lg">Preview Exam</h2>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Xem như học sinh · Không lưu kết quả
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center rounded-xl border border-border bg-secondary p-1 sm:flex">
            <button
              type="button"
              className={`rounded-lg p-2 ${device === "desktop" ? "bg-card shadow-sm" : ""}`}
              aria-label="Xem giao diện desktop"
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              <Monitor size={17} />
            </button>
            <button
              type="button"
              className={`rounded-lg p-2 ${device === "mobile" ? "bg-card shadow-sm" : ""}`}
              aria-label="Xem giao diện mobile"
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              <Smartphone size={17} />
            </button>
          </div>
          <button
            type="button"
            className={OUTLINE_BUTTON}
            onClick={() => setResetKey((n) => n + 1)}
            title="Bắt đầu lại câu hiện tại"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Làm lại</span>
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onClose}
            aria-label="Đóng xem trước"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {device === "desktop" && (
          <nav
            className="hidden w-56 shrink-0 flex-col gap-2 overflow-y-auto border-r-2 border-border bg-card p-3 lg:flex"
            aria-label="Danh sách câu hỏi xem trước"
          >
            <p className="px-2 py-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
              Câu hỏi ({questions.length})
            </p>
            {questions.map((item, index) => {
              const guided = Boolean(item.guidedDefinition?.enabled);
              const count = item.guidedDefinition?.steps.length ?? 0;
              return (
                <button
                  key={item.draftId}
                  type="button"
                  aria-current={questionIndex === index ? "step" : undefined}
                  onClick={() => openQuestion(index)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition focus-visible:ring-2 focus-visible:ring-primary ${
                    questionIndex === index
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-black">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">Câu {index + 1}</span>
                    <span className="block text-xs text-muted-foreground">
                      {guided ? `Guided · ${count} bước` : "Trực tiếp"}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-6">
          <div
            className={`mx-auto w-full transition-[max-width] ${
              device === "mobile" ? "max-w-[390px]" : "max-w-[900px]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Câu trước"
                  disabled={questionIndex === 0}
                  className={OUTLINE_BUTTON}
                  onClick={() => openQuestion(questionIndex - 1)}
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="whitespace-nowrap text-sm font-black">
                  Câu {questionIndex + 1} / {questions.length}
                </span>
                <button
                  type="button"
                  aria-label="Câu tiếp theo"
                  disabled={questionIndex === questions.length - 1}
                  className={OUTLINE_BUTTON}
                  onClick={() => openQuestion(questionIndex + 1)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">Bản xem thử</span>
            </div>

            <StudentExperienceView
              key={`${question.draftId}-${resetKey}`}
              question={question}
              onNextQuestion={
                questionIndex < questions.length - 1
                  ? () => openQuestion(questionIndex + 1)
                  : undefined
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Presentation for a single draft question. The local grading is ONLY a preview
 * simulation; production Student Runtime still requires server-authoritative grading.
 * Guided steps have NO media. Main Question media appears at the Final phase only.
 */
export function StudentExperienceView({
  question,
  onPrevious,
  onNextQuestion,
}: {
  question: DraftQuestion;
  onPrevious?: () => void;
  onNextQuestion?: () => void;
}) {
  const phases = useMemo<Phase[]>(() => {
    const guided = question.guidedDefinition;
    if (!guided?.enabled || guided.steps.length === 0) {
      return [{ kind: "final" }];
    }
    return [
      ...guided.steps.map((step, index) => ({
        kind: "step" as const,
        step,
        index,
      })),
      { kind: "final" as const },
    ];
  }, [question]);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [value, setValue] = useState<string[]>([]);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const phase = phases[phaseIndex] ?? phases[0];
  const isStep = phase.kind === "step";
  const guided = phases.length > 1;
  const maxAttempts = isStep ? (phase.step.retryEnabled ? 2 : 1) : 2;
  const retryAvailable = feedback === "wrong" && attemptsUsed < maxAttempts;
  const resolved = feedback === "correct" || (feedback === "wrong" && !retryAvailable);
  const type = isStep ? phase.step.type : question.type;
  const prompt = isStep ? phase.step.prompt : question.text;
  const options = isStep
    ? phase.step.options.map((option) => ({ id: option.key, text: option.content }))
    : question.options.map((option) => ({ id: option.id, text: option.text }));
  const hint = isStep
    ? phase.step.hintEnabled
      ? phase.step.hint
      : undefined
    : question.hint;
  const supported = type !== "MATCHING" && type !== "CLOZE";
  const canSubmit =
    supported &&
    feedback === null &&
    value.length > 0 &&
    value.every((item) => Boolean(item.trim()));

  const resetForNextPhase = () => {
    setValue([]);
    setAttemptsUsed(0);
    setFeedback(null);
    setHintOpen(false);
  };

  const tryAgain = () => {
    // IMPORTANT: A business retry must NOT reset attemptsUsed or hint history.
    setValue([]);
    setFeedback(null);
  };

  const check = () => {
    if (!canSubmit || attemptsUsed >= maxAttempts) return;
    const correct = isStep
      ? gradeStep(phase.step, value)
      : gradeQuestion(question, value);
    setAttemptsUsed((n) => n + 1);
    setFeedback(correct ? "correct" : "wrong");
  };

  const advance = () => {
    if (!resolved) return;
    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((i) => i + 1);
      resetForNextPhase();
    } else {
      onNextQuestion?.();
    }
  };

  return (
    <section className="student-paper overflow-hidden rounded-[22px] border-2 border-ink p-4 shadow-pop sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
          {isStep ? <CircleHelp size={16} /> : <Flag size={16} />}
          {isStep ? "LUYỆN TƯ DUY" : guided ? "CÂU HỎI CHÍNH" : "CÂU HỎI"}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {isStep ? `Bước ${phase.index + 1} / ${phases.length - 1}` : "Final"}
        </span>
      </div>

      {guided && (
        <ol className="mb-5 flex items-start gap-1" aria-label="Tiến trình Guided Reasoning">
          {phases.map((item, index) => {
            const done = index < phaseIndex;
            const active = index === phaseIndex;
            return (
              <li key={index} className="min-w-0 flex-1 text-center">
                <div
                  className={`mx-auto grid size-9 place-items-center rounded-full border-2 text-sm font-black ${
                    done
                      ? "border-success bg-success-soft text-success"
                      : active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-muted-foreground"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check size={16} /> : item.kind === "final" ? <Flag size={15} /> : index + 1}
                </div>
                <span className={`mt-1 block text-[11px] ${active ? "font-black" : "text-muted-foreground"}`}>
                  {item.kind === "final" ? "Câu chính" : `Bước ${index + 1}`}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {isStep && phase.index === 0 && question.guidedDefinition?.introContent && (
        <p className="student-note mb-5 rounded-xl border border-border bg-secondary px-4 py-3 text-sm leading-6">
          {question.guidedDefinition.introContent}
        </p>
      )}

      {guided && !isStep && (
        <p className="mb-4 rounded-xl border border-success/40 bg-success-soft px-4 py-3 text-sm font-semibold">
          Đã hoàn thành các bước hướng dẫn. Giờ hãy trả lời câu hỏi chính.
        </p>
      )}

      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          {isStep ? `Bước ${phase.index + 1} · Câu hỏi phụ` : "Áp dụng kiến thức"}
        </p>
        <h1 className="text-xl font-black leading-8 text-foreground sm:text-2xl">
          {prompt?.trim() || "Chưa có nội dung câu hỏi"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {type === "MULTIPLE_CHOICE"
            ? "Chọn tất cả đáp án đúng."
            : type === "TRUE_FALSE"
              ? "Chọn Đúng hoặc Sai."
              : type === "TYPE_ANSWER" || type === "FILL_IN_BLANK"
                ? "Nhập câu trả lời của bạn."
                : "Chọn một đáp án đúng."}
        </p>
      </div>

      {/* Only the main Question owns media. Never show its image/audio during Guided steps. */}
      {!isStep && <QuestionMedia media={question.media ?? []} />}

      <AnswerControls
        type={type}
        options={options}
        value={value}
        disabled={feedback !== null || !supported}
        onChange={setValue}
      />

      {!supported && (
        <p role="alert" className="mt-4 rounded-xl border border-warning bg-warning-soft p-3 text-sm">
          Preview tương tác cho dạng {type} chưa được hỗ trợ trong phiên bản này.
        </p>
      )}

      {hint?.trim() && (
        <div className="mt-5">
          <button
            type="button"
            className={OUTLINE_BUTTON}
            aria-expanded={hintOpen}
            onClick={() => setHintOpen((open) => !open)}
          >
            <Lightbulb size={17} /> {hintOpen ? "Ẩn gợi ý" : "Xem gợi ý"}
          </button>
          {hintOpen && (
            <p className="student-note mt-3 rounded-xl border border-border bg-secondary px-4 py-3 text-sm leading-6">
              {hint}
            </p>
          )}
        </div>
      )}

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-xl border-2 px-4 py-3 text-sm ${
            feedback === "correct"
              ? "border-success/50 bg-success-soft"
              : retryAvailable
                ? "border-warning/50 bg-warning-soft"
                : "border-destructive/30 bg-destructive-soft"
          }`}
        >
          <p className="font-black">
            {feedback === "correct"
              ? "Chính xác!"
              : retryAvailable
                ? "Chưa chính xác. Bạn còn một lần thử."
                : "Chưa chính xác. Bước này đã hoàn tất."}
          </p>
          {isStep && <p className="mt-1 text-xs">Đáp án đúng sẽ được xem sau câu hỏi chính.</p>}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="text-xs font-semibold text-muted-foreground">
          {attemptsUsed > 0 ? `Đã thử ${attemptsUsed}/${maxAttempts} lượt` : ""}
        </div>
        {retryAvailable ? (
          <button type="button" className={PRIMARY_BUTTON} onClick={tryAgain}>
            <RotateCcw size={17} /> Thử lại
          </button>
        ) : resolved ? (
          <button
            type="button"
            className={PRIMARY_BUTTON}
            onClick={advance}
            disabled={phaseIndex === phases.length - 1 && !onNextQuestion}
          >
            {phaseIndex < phases.length - 1
              ? phases[phaseIndex + 1].kind === "final"
                ? "Đến câu hỏi chính"
                : "Tiếp tục"
              : onNextQuestion
                ? "Câu tiếp theo"
                : "Đã hoàn thành"}
            <ArrowRight size={17} />
          </button>
        ) : (
          <button type="button" className={PRIMARY_BUTTON} onClick={check} disabled={!canSubmit}>
            Kiểm tra <ArrowRight size={17} />
          </button>
        )}
      </div>

      {!isStep && resolved && question.explanation?.trim() && (
        <div className="student-note mt-5 rounded-xl border border-border bg-secondary p-4">
          <p className="mb-1 text-sm font-black">Giải thích</p>
          <p className="text-sm leading-6">{question.explanation}</p>
        </div>
      )}

      {onPrevious && (
        <button type="button" className={`${OUTLINE_BUTTON} mt-5`} onClick={onPrevious}>
          <ArrowLeft size={16} /> Câu trước
        </button>
      )}
    </section>
  );
}

type Option = { id: string; text: string };

function AnswerControls({
  type,
  options,
  value,
  disabled,
  onChange,
}: {
  type: QuestionType | GuidedStep["type"];
  options: Option[];
  value: string[];
  disabled: boolean;
  onChange: (value: string[]) => void;
}) {
  if (type === "MATCHING" || type === "CLOZE") return null;

  if (type === "TYPE_ANSWER" || type === "FILL_IN_BLANK") {
    return (
      <label className="mt-5 block space-y-2">
        <span className="text-xs font-bold text-muted-foreground">Câu trả lời</span>
        <input
          className="student-field w-full"
          value={value[0] ?? ""}
          disabled={disabled}
          onChange={(event) => onChange([event.target.value])}
          placeholder="Nhập câu trả lời"
          autoComplete="off"
        />
      </label>
    );
  }

  const choices: Option[] =
    type === "TRUE_FALSE"
      ? [
          { id: "TRUE", text: "Đúng" },
          { id: "FALSE", text: "Sai" },
        ]
      : options;
  const multiple = type === "MULTIPLE_CHOICE";

  return (
    <div className="mt-5 grid gap-3" role="group" aria-label="Các lựa chọn trả lời">
      {choices.map((choice, index) => {
        const selected = value.includes(choice.id);
        return (
          <button
            key={choice.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() =>
              onChange(
                multiple
                  ? selected
                    ? value.filter((item) => item !== choice.id)
                    : [...value, choice.id]
                  : [choice.id],
              )
            }
            className={`student-control flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed ${
              selected ? "student-control--action border-primary" : "student-control--secondary border-border"
            }`}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-card text-sm font-black text-foreground">
              {type === "TRUE_FALSE" ? (index === 0 ? "Đ" : "S") : String.fromCharCode(65 + index)}
            </span>
            <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-6">
              {choice.text || "Lựa chọn chưa có nội dung"}
            </span>
            <span
              className={`grid size-5 shrink-0 place-items-center border-2 border-current ${
                multiple ? "rounded-md" : "rounded-full"
              } ${selected ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              aria-hidden="true"
            >
              {selected && <Check size={12} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Media belongs to the MAIN Question only. GuidedStep deliberately has no media renderer. */
function QuestionMedia({ media }: { media: DraftQuestion["media"] }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const images = media.filter((item) => item.kind === "image");
  const audio = media.filter((item) => item.kind === "audio");
  if (!images.length && !audio.length) return null;

  return (
    <div className="mt-5 space-y-3" aria-label="Nội dung hình ảnh và âm thanh của câu hỏi">
      {images.map((item) => (
        <figure key={item.id} className="overflow-hidden rounded-2xl border-2 border-border bg-card p-2">
          {item.url ? (
            <button
              type="button"
              className="group block w-full overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setExpandedImage(item.url ?? null)}
              aria-label={`Phóng to ảnh: ${item.name || "Ảnh câu hỏi"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name || "Ảnh minh họa câu hỏi"}
                className="mx-auto max-h-[360px] w-full object-contain"
              />
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon size={13} /> Nhấn để phóng to
              </span>
            </button>
          ) : (
            <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
              <ImageIcon size={18} /> Ảnh chưa có URL để xem trước
            </div>
          )}
        </figure>
      ))}

      {audio.map((item) => (
        <div key={item.id} className="rounded-xl border-2 border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Volume2 size={17} /> Nghe đoạn âm thanh
          </div>
          {item.url ? (
            <audio className="w-full" controls preload="metadata" src={item.url}>
              Trình duyệt không hỗ trợ phát audio.
            </audio>
          ) : (
            <p className="text-xs text-muted-foreground">Audio chưa có URL để xem trước.</p>
          )}
        </div>
      ))}

      {expandedImage && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh câu hỏi"
        >
          <button
            type="button"
            className="absolute right-5 top-5 rounded-xl bg-white p-3 text-black"
            onClick={() => setExpandedImage(null)}
            aria-label="Đóng ảnh phóng to"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={expandedImage} alt="Ảnh câu hỏi phóng to" className="max-h-[90vh] max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}

/** Local approximation for a Teacher draft preview, NOT the authoritative engine. */
function gradeStep(step: GuidedStep, value: string[]) {
  if (step.type === "SINGLE_CHOICE") return value[0] === step.correctKey;
  if (step.type === "TRUE_FALSE")
    return (value[0] === "TRUE") === Boolean(step.expected);
  return compare(value[0], step.acceptedAnswers, step.matchingMode);
}

function gradeQuestion(question: DraftQuestion, value: string[]) {
  if (question.type === "SINGLE_CHOICE")
    return question.correctOptionIds.length === 1 && value[0] === question.correctOptionIds[0];
  if (question.type === "MULTIPLE_CHOICE")
    return (
      value.length === question.correctOptionIds.length &&
      value.every((item) => question.correctOptionIds.includes(item))
    );
  if (question.type === "TRUE_FALSE") return value[0] === question.trueFalseAnswer;
  return compare(value[0], question.acceptedAnswers, "CASE_INSENSITIVE_TRIM");
}

function compare(
  value: string | undefined,
  answers: string[],
  mode: "CASE_INSENSITIVE_TRIM" | "CASE_SENSITIVE_TRIM" | null,
) {
  const source = value?.trim() ?? "";
  return answers.some((answer) => {
    const target = answer.trim();
    return mode === "CASE_SENSITIVE_TRIM"
      ? source === target
      : source.toLowerCase() === target.toLowerCase();
  });
}
