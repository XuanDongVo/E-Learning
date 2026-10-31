"use client";

import {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AttemptAnswerPayload,
  JsonRecord,
  AttemptRuntimeQuestionResponse,
  AttemptRuntimeResponse,
  StudentQuestionSnapshot,
  CompositionItemSnapshot,
  CompositionSectionSnapshot,
  PoolOption,
} from "@/types/student/assignment-attempt";

// ============================================================================
// 2. HELPER UTILITIES
// ============================================================================

const QuestionTotalContext = createContext(0);

export function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some(hasMeaningfulAnswer);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(
      hasMeaningfulAnswer,
    );
  }
  return false;
}

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Hiển thị ký hiệu phát âm [[ea]] -> từ có gạch chân
 */
function renderRichText(text: string): ReactNode {
  if (!text.includes("[[")) return text;
  const parts = text.split(/(\[\[.+?\]\])/g);
  return parts.map((part, index) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      return (
        <u
          key={index}
          className="font-semibold underline decoration-primary decoration-2 underline-offset-4"
        >
          {part.slice(2, -2)}
        </u>
      );
    }
    return part;
  });
}

/**
 * Trích xuất snapshot câu hỏi an toàn từ snapshot.student.spec
 */
function safeQuestionSnapshot(
  question: AttemptRuntimeQuestionResponse,
): StudentQuestionSnapshot {
  const root = asRecord(question.questionSnapshot) ?? {};
  const student = asRecord(root.student) ?? {};
  const spec =
    asRecord(
      student.spec ?? root.spec ?? root.definition ?? root.questionSpec,
    ) ?? root;
  const common = asRecord(spec.common ?? root.common) ?? {};

  const segments = asArray<unknown>(spec.segments)
    .map(asRecord)
    .filter((seg): seg is JsonRecord => seg !== null)
    .map((seg) => ({
      text: asString(seg.text),
      blankKey: typeof seg.blankKey === "string" ? seg.blankKey : undefined,
    }));

  const blankKeys = asArray<unknown>(spec.blanks)
    .map(asRecord)
    .filter((blank): blank is JsonRecord => blank !== null)
    .map((blank) => asString(blank.key))
    .filter(Boolean);

  const orderedSegments = segments.map((segment, index) => ({
    ...segment,
    blankKey:
      segment.blankKey ??
      (segments.length === blankKeys.length + 1 && index < blankKeys.length
        ? blankKeys[index]
        : undefined),
  }));

  return {
    type: asString(spec.type ?? root.type).toUpperCase(),
    poolId: asString(spec.poolId ?? root.poolId),
    prompt: asString(
      spec.prompt ??
        spec.content ??
        spec.text ??
        root.prompt ??
        root.content ??
        common.content,
    ),
    choices: asArray<unknown>(spec.choices ?? spec.options)
      .map(asRecord)
      .filter((c): c is JsonRecord => c !== null)
      .map((c) => ({
        key: asString(c.key ?? c.id ?? c.optionKey),
        text: asString(c.text ?? c.content ?? c.label),
      }))
      .filter((c) => c.key !== "" && c.text !== ""),
    media: asArray<unknown>(spec.media ?? root.media)
      .map(asRecord)
      .filter((m): m is JsonRecord => m !== null)
      .map((m) => ({
        url: asString(m.url),
        alt: asString(m.alt ?? m.name),
        kind: asString(m.kind ?? m.mediaType).toLowerCase(),
      }))
      .filter((m) => m.url !== ""),
    items: asArray<unknown>(spec.items)
      .map(asRecord)
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({
        key: asString(item.key ?? item.itemKey),
        text: asString(item.content ?? item.prompt ?? item.text),
      }))
      .filter((item) => item.key !== "" && item.text !== ""),
    answerPool: asArray<unknown>(spec.answerPool ?? spec.answer_pool)
      .map(asRecord)
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({
        key: asString(item.key ?? item.id),
        text: asString(item.content ?? item.text),
      }))
      .filter((item) => item.key !== "" && item.text !== ""),
    segments: orderedSegments,
    blankKeys,
  };
}

function snapshotItem(value: unknown): CompositionItemSnapshot | null {
  const item = asRecord(value);
  if (!item) return null;

  return {
    id:
      typeof item.id === "string" || typeof item.id === "number"
        ? item.id
        : undefined,
    position: typeof item.position === "number" ? item.position : 0,
    itemType: asString(item.itemType ?? item.type).toUpperCase(),
    questionId: typeof item.questionId === "number" ? item.questionId : null,
    blockPayload: asRecord(item.blockPayload ?? item.payload),
    children: asArray<unknown>(item.children)
      .map(snapshotItem)
      .filter((child): child is CompositionItemSnapshot => child !== null),
  };
}

function snapshotSections(document: JsonRecord): CompositionSectionSnapshot[] {
  return asArray<unknown>(document.sections)
    .map(asRecord)
    .filter((sec): sec is JsonRecord => sec !== null)
    .map((sec) => ({
      id:
        typeof sec.id === "string" || typeof sec.id === "number"
          ? sec.id
          : undefined,
      position: typeof sec.position === "number" ? sec.position : 0,
      title: asString(sec.title),
      titleVi: asString(sec.titleVi),
      instructions: asString(sec.instructions),
      instructionsVi: asString(sec.instructionsVi),
      items: asArray<unknown>(sec.items)
        .map(snapshotItem)
        .filter((item): item is CompositionItemSnapshot => item !== null),
    }))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

// ============================================================================
// 3. BLOCKS & SHARED CONTENT (Hiển thị song ngữ EN + VI tự động)
// ============================================================================

function BlockView({ item }: { item: CompositionItemSnapshot }) {
  const payload = item.blockPayload ?? {};
  const type = (item.itemType ?? "").toUpperCase();

  // Khối Hướng dẫn (INSTRUCTIONS)
  if (type === "INSTRUCTIONS") {
    const textEn = asString(payload.text ?? payload.instructions);
    const textVi = asString(payload.textVi ?? payload.instructionsVi);

    if (!textEn && !textVi) return null;
    return (
      <div className="space-y-1 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
        <p className="font-semibold text-primary">Instructions / Hướng dẫn:</p>
        {textEn && (
          <div className="whitespace-pre-wrap">{renderRichText(textEn)}</div>
        )}
        {textVi && (
          <div className="whitespace-pre-wrap text-xs italic text-muted-foreground">
            {renderRichText(textVi)}
          </div>
        )}
      </div>
    );
  }

  // Khối Bài đọc (PASSAGE)
  if (type === "PASSAGE") {
    const titleEn = asString(payload.title);
    const titleVi = asString(payload.titleVi);
    const textEn = asString(payload.text ?? payload.content);
    const textVi = asString(payload.textVi ?? payload.contentVi);

    return (
      <article className="space-y-2 rounded-2xl border border-border bg-card p-5 shadow-xs">
        {titleEn && (
          <h3 className="text-base font-bold text-foreground">{titleEn}</h3>
        )}
        {titleVi && titleVi !== titleEn && (
          <p className="text-xs italic text-muted-foreground font-medium -mt-1">
            {titleVi}
          </p>
        )}
        {textEn && (
          <p className="whitespace-pre-wrap font-serif text-[15px] leading-8 text-foreground">
            {renderRichText(textEn)}
          </p>
        )}
        {textVi && (
          <div className="mt-3 rounded-lg bg-muted/40 p-3 text-xs italic leading-6 text-muted-foreground border-l-2 border-primary/30">
            <span className="font-semibold not-italic text-foreground">
              Bản dịch tham khảo:{" "}
            </span>
            {renderRichText(textVi)}
          </div>
        )}
      </article>
    );
  }

  // Khối Hình ảnh / Audio (MEDIA)
  if (type === "MEDIA") {
    const url = asString(payload.url);
    const alt = asString(payload.alt);
    const captionEn = asString(payload.caption);
    const captionVi = asString(payload.captionVi);
    if (!url) return null;

    const isAudio =
      /audio/i.test(asString(payload.kind ?? payload.mediaType)) ||
      /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url);

    return (
      <figure className="space-y-2 rounded-2xl border border-border bg-card p-4">
        {isAudio ? (
          <audio controls src={url} className="w-full" />
        ) : (
          <img
            src={url}
            alt={alt || "Media attachment"}
            className="mx-auto max-h-72 max-w-full rounded-lg object-contain"
          />
        )}
        {(captionEn || captionVi) && (
          <figcaption className="text-center text-xs text-muted-foreground space-y-0.5">
            {captionEn && <p>{captionEn}</p>}
            {captionVi && (
              <p className="italic font-medium text-muted-foreground/80">
                ({captionVi})
              </p>
            )}
          </figcaption>
        )}
      </figure>
    );
  }

  // Khối Kho từ đáp án (ANSWER POOL)
  if (type === "POOL") {
    const entries = asArray<unknown>(payload.entries)
      .map(asRecord)
      .filter((e): e is JsonRecord => e !== null)
      .map((e, index) => ({
        letter: String.fromCharCode(65 + index),
        text: asString(e.text ?? e.content),
      }))
      .filter((e) => e.text !== "");

    if (!entries.length) return null;
    const titleEn = asString(payload.title);
    const titleVi = asString(payload.titleVi);

    return (
      <aside className="rounded-xl border border-accent bg-accent/30 p-4">
        <div className="mb-2.5 flex items-baseline gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            {titleEn || "Answer Pool"}
          </h4>
          {titleVi && (
            <span className="text-xs italic text-muted-foreground">
              ({titleVi})
            </span>
          )}
        </div>
        <ul className="flex flex-wrap gap-2">
          {entries.map((entry) => (
            <li
              key={entry.letter}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs"
            >
              <span className="font-bold text-primary">{entry.letter}.</span>
              <span>{entry.text}</span>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  return null;
}

// ============================================================================
// 4. QUESTION CARD COMPONENT
// ============================================================================

const QUESTION_TYPE_LABELS: Record<string, { en: string; vi: string }> = {
  SINGLE_CHOICE: { en: "Single Choice", vi: "Trắc nghiệm 1 đáp án" },
  TRUE_FALSE: { en: "True / False", vi: "Đúng / Sai" },
  MULTIPLE_CHOICE: { en: "Multiple Choice", vi: "Trọn nhiều đáp án" },
  FILL_IN_BLANK: { en: "Fill in the blank", vi: "Điền vào chỗ trống" },
  TYPE_ANSWER: { en: "Short Answer", vi: "Trả lời ngắn" },
  TEXT_INPUT: { en: "Text Input", vi: "Viết câu trả lời" },
  CLOZE: { en: "Cloze Test", vi: "Điền từ vào đoạn văn" },
  MULTI_TEXT_INPUT: { en: "Multi Blanks", vi: "Điền nhiều chỗ trống" },
  MATCHING: { en: "Matching", vi: "Nối đáp án" },
};

function QuestionCard({
  question,
  answer,
  poolOptions,
  onAnswerChange,
}: {
  question: AttemptRuntimeQuestionResponse;
  answer: AttemptAnswerPayload | undefined;
  poolOptions: PoolOption[];
  onAnswerChange: (answer: AttemptAnswerPayload) => void;
}) {
  const total = useContext(QuestionTotalContext);
  const snapshot = useMemo(() => safeQuestionSnapshot(question), [question]);
  const type = snapshot.type;

  // Nhãn loại câu hỏi song ngữ
  const typeBadge = QUESTION_TYPE_LABELS[type] ?? {
    en: type.replace(/_/g, " "),
    vi: "Câu hỏi",
  };

  const matchingPool =
    snapshot.answerPool.length > 0 ? snapshot.answerPool : poolOptions;

  const selectedKey =
    typeof answer?.selectedKey === "string" ? answer.selectedKey : "";
  const selectedKeys = Array.isArray(answer?.selectedKeys)
    ? answer.selectedKeys.filter((v): v is string => typeof v === "string")
    : [];
  const value = typeof answer?.value === "string" ? answer.value : "";
  const values = asRecord(answer?.values) ?? {};
  const pairs = asRecord(answer?.pairs) ?? {};

  return (
    <article
      data-question-id={String(question.attemptQuestionId)}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xs"
      aria-labelledby={`question-${question.attemptQuestionId}`}
    >
      <header className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Huy hiệu số thứ tự câu */}
            <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              Câu {question.position + 1} / {total}
            </span>

            {/* Huy hiệu loại câu hỏi (Question Type) hiển thị song ngữ */}
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-1 text-xs font-medium text-foreground">
              <span>{typeBadge.en}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{typeBadge.vi}</span>
            </span>
          </div>

          {/* Điểm số của câu (nếu có) */}
          {question.possiblePoints !== undefined &&
            question.possiblePoints > 0 && (
              <span className="text-xs font-semibold text-muted-foreground">
                {question.possiblePoints} pt
              </span>
            )}
        </div>

        {/* Nội dung đề bài */}
        <h3
          id={`question-${question.attemptQuestionId}`}
          className="text-[15px] font-semibold leading-relaxed text-foreground"
        >
          {renderRichText(snapshot.prompt || "Choose the best answer:")}
        </h3>
      </header>

      {/* Media đính kèm (Ảnh / Audio) */}
      {snapshot.media.map((media, index) => (
        <figure key={`${media.url}-${index}`} className="space-y-1">
          {media.kind.includes("audio") ? (
            <audio controls src={media.url} className="w-full" />
          ) : (
            <img
              src={media.url}
              alt={media.alt || "Question media"}
              className="max-h-64 max-w-full rounded-lg object-contain"
            />
          )}
        </figure>
      ))}

      {/* 1. SINGLE CHOICE & TRUE/FALSE */}
      {(type === "SINGLE_CHOICE" || type === "TRUE_FALSE") && (
        <fieldset className="grid gap-2.5 sm:grid-cols-2">
          <legend className="sr-only">{snapshot.prompt}</legend>
          {(snapshot.choices.length
            ? snapshot.choices
            : [
                { key: "TRUE", text: "True" },
                { key: "FALSE", text: "False" },
              ]
          ).map((choice, index) => {
            const isPicked = selectedKey === choice.key;
            return (
              <label
                key={choice.key}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                  isPicked
                    ? "border-primary bg-primary/10 font-medium text-foreground ring-1 ring-primary"
                    : "border-border bg-card text-foreground hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name={`attempt-q-${question.attemptQuestionId}`}
                  checked={isPicked}
                  onChange={() => onAnswerChange({ selectedKey: choice.key })}
                  className="h-4 w-4 accent-primary"
                />
                <span>
                  <b className="mr-1.5 text-primary">
                    {String.fromCharCode(65 + index)}.
                  </b>
                  {renderRichText(choice.text)}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {/* 2. MULTIPLE CHOICE */}
      {type === "MULTIPLE_CHOICE" && (
        <fieldset className="grid gap-2.5 sm:grid-cols-2">
          <legend className="sr-only">{snapshot.prompt}</legend>
          {snapshot.choices.map((choice, index) => {
            const isPicked = selectedKeys.includes(choice.key);
            return (
              <label
                key={choice.key}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                  isPicked
                    ? "border-primary bg-primary/10 font-medium text-foreground ring-1 ring-primary"
                    : "border-border bg-card text-foreground hover:bg-muted/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPicked}
                  onChange={(e) =>
                    onAnswerChange({
                      selectedKeys: e.target.checked
                        ? [...selectedKeys, choice.key]
                        : selectedKeys.filter((k) => k !== choice.key),
                    })
                  }
                  className="h-4 w-4 accent-primary"
                />
                <span>
                  <b className="mr-1.5 text-primary">
                    {String.fromCharCode(65 + index)}.
                  </b>
                  {renderRichText(choice.text)}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {/* 3. TEXT INPUT / FILL IN BLANK */}
      {(type === "FILL_IN_BLANK" ||
        type === "TYPE_ANSWER" ||
        type === "TEXT_INPUT") && (
        <div className="space-y-1">
          <input
            value={value}
            onChange={(e) => onAnswerChange({ value: e.target.value })}
            placeholder="Type your answer here..."
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-hidden transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label={snapshot.prompt || "Answer"}
          />
        </div>
      )}

      {/* 4. MATCHING */}
      {type === "MATCHING" && snapshot.items.length > 0 && (
        <div className="space-y-3">
          {snapshot.items.map((item) => {
            const picked =
              typeof pairs[item.key] === "string"
                ? String(pairs[item.key])
                : "";
            return (
              <label
                key={item.key}
                className="grid gap-2 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-[1fr_220px] sm:items-center"
              >
                <span className="text-sm font-medium text-foreground">
                  {renderRichText(item.text)}
                </span>
                <select
                  value={picked}
                  onChange={(e) =>
                    onAnswerChange({
                      pairs: { ...pairs, [item.key]: e.target.value },
                    })
                  }
                  className="h-10 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden"
                >
                  <option value="">— Select answer —</option>
                  {matchingPool.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )}

      {/* 5. CLOZE / MULTI TEXT INPUT */}
      {(type === "CLOZE" || type === "MULTI_TEXT_INPUT") &&
        snapshot.blankKeys.length > 0 && (
          <div className="space-y-3 rounded-xl border border-border bg-muted/10 p-4">
            {snapshot.segments.some((seg) => Boolean(seg.blankKey)) ? (
              <p className="font-serif text-[15px] leading-9 text-foreground">
                {snapshot.segments.map((seg, index) => (
                  <Fragment key={`seg-${index}`}>
                    <span>{renderRichText(seg.text)}</span>
                    {seg.blankKey &&
                      (() => {
                        const key = seg.blankKey;
                        const cur =
                          typeof values[key] === "string"
                            ? String(values[key])
                            : "";
                        return (
                          <input
                            value={cur}
                            onChange={(e) =>
                              onAnswerChange({
                                values: { ...values, [key]: e.target.value },
                              })
                            }
                            className="mx-1.5 inline-block h-8 w-32 rounded-md border border-border bg-card px-2 font-sans text-sm text-foreground align-baseline focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                            placeholder={`(${snapshot.blankKeys.indexOf(key) + 1})`}
                            aria-label={`Blank ${snapshot.blankKeys.indexOf(key) + 1}`}
                          />
                        );
                      })()}
                  </Fragment>
                ))}
              </p>
            ) : (
              snapshot.blankKeys.map((key, index) => {
                const cur =
                  typeof values[key] === "string" ? String(values[key]) : "";
                return (
                  <label
                    key={key}
                    className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center"
                  >
                    <span className="text-sm font-semibold text-muted-foreground">
                      Blank ({index + 1}):
                    </span>
                    <input
                      value={cur}
                      onChange={(e) =>
                        onAnswerChange({
                          values: { ...values, [key]: e.target.value },
                        })
                      }
                      className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-hidden"
                      placeholder="Type word..."
                    />
                  </label>
                );
              })
            )}
          </div>
        )}

      {![
        "SINGLE_CHOICE",
        "TRUE_FALSE",
        "MULTIPLE_CHOICE",
        "FILL_IN_BLANK",
        "TYPE_ANSWER",
        "TEXT_INPUT",
        "MATCHING",
        "CLOZE",
        "MULTI_TEXT_INPUT",
      ].includes(type) && (
        <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground">
          Question format ({type}) is not supported on this view.
        </p>
      )}
    </article>
  );
}

// ============================================================================
// 5. RECURSIVE TREE RENDERER
// ============================================================================

function collectPoolOptions(
  item: CompositionItemSnapshot,
  poolsById: Map<string, PoolOption[]>,
): void {
  if (item.itemType === "POOL" && item.blockPayload) {
    const payload = item.blockPayload;
    const entries = asArray<unknown>(payload.entries)
      .map(asRecord)
      .filter((e): e is JsonRecord => e !== null)
      .map((e) => ({
        key: asString(e.id ?? e.key),
        text: asString(e.text ?? e.content),
      }))
      .filter((e) => e.key !== "" && e.text !== "");

    const aliases = new Set<string>();
    if (item.id !== undefined) {
      aliases.add(String(item.id));
      aliases.add(`b-${item.id}`);
    }
    const logicalKey = asString(payload.poolKey ?? payload.poolId);
    if (logicalKey) aliases.add(logicalKey);
    aliases.forEach((k) => poolsById.set(k, entries));
  }
  (item.children ?? []).forEach((child) =>
    collectPoolOptions(child, poolsById),
  );
}

function renderItem(
  item: CompositionItemSnapshot,
  questionsByItemId: Map<string, AttemptRuntimeQuestionResponse>,
  poolsById: Map<string, PoolOption[]>,
  answers: Record<string, AttemptAnswerPayload>,
  onAnswerChange: (questionId: string, answer: AttemptAnswerPayload) => void,
  keyPrefix: string,
): ReactNode {
  // 1. QUESTION
  if (item.itemType === "QUESTION" && item.id !== undefined) {
    const question = questionsByItemId.get(String(item.id));
    if (!question) return null;

    const qSnapshot = safeQuestionSnapshot(question);
    const pool = qSnapshot.poolId
      ? (poolsById.get(qSnapshot.poolId) ?? [])
      : [];

    return (
      <QuestionCard
        key={`${keyPrefix}-q-${question.attemptQuestionId}`}
        question={question}
        answer={answers[String(question.attemptQuestionId)]}
        poolOptions={pool}
        onAnswerChange={(ans) =>
          onAnswerChange(String(question.attemptQuestionId), ans)
        }
      />
    );
  }

  // 2. BLOCK
  const block = (
    <BlockView
      item={item}
      key={`${keyPrefix}-block-${item.id ?? item.position}`}
    />
  );

  // 3. CHILDREN
  const children = (item.children ?? [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((child, index) =>
      renderItem(
        child,
        questionsByItemId,
        poolsById,
        answers,
        onAnswerChange,
        `${keyPrefix}-c-${index}`,
      ),
    );

  const hasChildren = (item.children ?? []).length > 0;

  return (
    <div
      key={`${keyPrefix}-item-${item.id ?? item.position}`}
      className={
        hasChildren
          ? "space-y-4 rounded-2xl border-l-4 border-primary/40 bg-muted/15 p-4"
          : "space-y-4"
      }
    >
      {block}
      {children}
    </div>
  );
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const toRoman = (n: number) => ROMAN[n - 1] ?? String(n);

// ============================================================================
// 6. MAIN COMPONENT: STUDENT PAPER
// ============================================================================

export interface StudentPaperProps {
  runtime: AttemptRuntimeResponse;
  answers: Record<string, AttemptAnswerPayload>;
  onAnswerChange: (
    attemptQuestionId: string,
    answer: AttemptAnswerPayload,
  ) => void;
}

export function StudentPaper({
  runtime,
  answers,
  onAnswerChange,
}: StudentPaperProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const document = asRecord(runtime.document) ?? {};
  const sections = useMemo(() => snapshotSections(document), [document]);

  // Map tra cứu câu hỏi theo assignmentItemId
  const questionsByItemId = useMemo(() => {
    const map = new Map<string, AttemptRuntimeQuestionResponse>();
    runtime.questions.forEach((q) => {
      if (q.assignmentItemId !== null && q.assignmentItemId !== undefined) {
        map.set(String(q.assignmentItemId), q);
      }
    });
    return map;
  }, [runtime.questions]);

  // Thu thập Answer Pools
  const poolsById = useMemo(() => {
    const map = new Map<string, PoolOption[]>();
    sections.forEach((s) =>
      (s.items ?? []).forEach((item) => collectPoolOptions(item, map)),
    );
    return map;
  }, [sections]);

  const orderedQuestions = useMemo(
    () => runtime.questions.slice().sort((a, b) => a.position - b.position),
    [runtime.questions],
  );

  const total = orderedQuestions.length;
  const answeredCount = orderedQuestions.filter((q) =>
    hasMeaningfulAnswer(answers[String(q.attemptQuestionId)]),
  ).length;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  // Theo dõi câu hỏi đang lướt tới
  useEffect(() => {
    const root = paperRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (top) {
          const qId = top.target.getAttribute("data-question-id");
          if (qId) setActiveId(qId);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    root
      .querySelectorAll("[data-question-id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [orderedQuestions, sections.length]);

  const goToQuestion = (attemptQuestionId: string) => {
    const el = paperRef.current?.querySelector(
      `[data-question-id="${attemptQuestionId}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(attemptQuestionId);
  };

  return (
    <QuestionTotalContext.Provider value={total}>
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* VÙNG CHÍNH: NỘI DUNG ĐỀ THI */}
        <div ref={paperRef} className="min-w-0 space-y-6">
          {sections.length > 0 ? (
            sections.map((section, sIndex) => {
              const displayTitleEn =
                section.title || `Section ${toRoman(sIndex + 1)}`;
              const displayTitleVi = section.titleVi;

              return (
                <section
                  key={String(section.id ?? sIndex)}
                  className="rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8"
                >
                  <header className="space-y-1.5 border-b border-border pb-4">
                    <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                      PHẦN {toRoman(sIndex + 1)}
                    </span>

                    {/* Tiêu đề tiếng Anh */}
                    <h2 className="text-xl font-extrabold text-foreground">
                      {displayTitleEn}
                    </h2>

                    {/* Dịch nghĩa tiếng Việt (nếu có và khác tiếng Anh) */}
                    {displayTitleVi && displayTitleVi !== displayTitleEn && (
                      <p className="text-sm italic font-medium text-muted-foreground -mt-1">
                        {displayTitleVi}
                      </p>
                    )}

                    {/* Hướng dẫn tiếng Anh */}
                    {section.instructions && (
                      <p className="text-sm leading-relaxed text-foreground pt-1">
                        {section.instructions}
                      </p>
                    )}

                    {/* Hướng dẫn tiếng Việt */}
                    {section.instructionsVi && (
                      <p className="text-xs italic leading-relaxed text-muted-foreground">
                        ({section.instructionsVi})
                      </p>
                    )}
                  </header>

                  <div className="mt-6 space-y-5">
                    {(section.items ?? [])
                      .slice()
                      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                      .map((item, index) =>
                        renderItem(
                          item,
                          questionsByItemId,
                          poolsById,
                          answers,
                          onAnswerChange,
                          `s-${sIndex}-${index}`,
                        ),
                      )}
                  </div>
                </section>
              );
            })
          ) : (
            <section className="rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <div className="space-y-5">
                {orderedQuestions.map((q) => (
                  <QuestionCard
                    key={String(q.attemptQuestionId)}
                    question={q}
                    answer={answers[String(q.attemptQuestionId)]}
                    poolOptions={[]}
                    onAnswerChange={(ans) =>
                      onAnswerChange(String(q.attemptQuestionId), ans)
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* CỘT PHẢI: BẢN ĐỒ CÂU HỎI (QUESTION PALETTE) */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col rounded-3xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Tiến độ làm bài
              </h2>
              <span className="text-xs font-bold text-primary">
                {answeredCount} / {total} câu
              </span>
            </div>

            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <nav
              aria-label="Danh sách câu hỏi"
              className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1"
            >
              <ul className="grid grid-cols-5 gap-2">
                {orderedQuestions.map((q) => {
                  const qId = String(q.attemptQuestionId);
                  const answered = hasMeaningfulAnswer(answers[qId]);
                  const active = activeId === qId;

                  return (
                    <li key={qId}>
                      <button
                        type="button"
                        onClick={() => goToQuestion(qId)}
                        aria-current={active ? "true" : undefined}
                        className={`flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold transition ${
                          answered
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "bg-muted text-foreground hover:bg-border"
                        } ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      >
                        {q.position + 1}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <ul className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-border bg-muted" />
                <span>Chưa hoàn thành</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-primary" />
                <span>Đã có câu trả lời</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </QuestionTotalContext.Provider>
  );
}
