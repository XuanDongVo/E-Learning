"use client";

import { Fragment, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  AttemptAnswerPayload,
  AttemptRuntimeQuestion,
  AttemptRuntimeResponse,
  StudentQuestionSnapshot,
} from "@/types/student/assignment-attempt";

type JsonRecord = Record<string, unknown>;

const QuestionTotalContext = createContext(0);

interface CompositionItemSnapshot {
  id?: number | string;
  position?: number;
  itemType?: string;
  questionId?: number | null;
  blockPayload?: JsonRecord | null;
  children?: CompositionItemSnapshot[];
}

interface CompositionSectionSnapshot {
  id?: number | string;
  position?: number;
  title?: string;
  titleVi?: string;
  instructions?: string;
  instructionsVi?: string;
  items?: CompositionItemSnapshot[];
}

export function hasMeaningfulAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasMeaningfulAnswer);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(hasMeaningfulAnswer);
  return true;
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

function snapshotItem(value: unknown): CompositionItemSnapshot | null {
  const item = asRecord(value);
  if (!item) return null;

  return {
    id: typeof item.id === "string" || typeof item.id === "number" ? item.id : undefined,
    position: typeof item.position === "number" ? item.position : 0,
    itemType: asString(item.itemType ?? item.type).toUpperCase(),
    questionId: typeof item.questionId === "number" ? item.questionId : null,
    blockPayload: asRecord(item.blockPayload ?? item.payload),
    children: asArray<unknown>(item.children)
      .map(snapshotItem)
      .filter((child): child is CompositionItemSnapshot => child !== null),
  };
}

function snapshotSections(document: JsonRecord, locale: string): CompositionSectionSnapshot[] {
  return asArray<unknown>(document.sections)
    .map(asRecord)
    .filter((section): section is JsonRecord => section !== null)
    .map((section) => ({
      id: typeof section.id === "string" || typeof section.id === "number" ? section.id : undefined,
      position: typeof section.position === "number" ? section.position : 0,
      title: asString(section.title) || asString(section.titleVi),
      titleVi: asString(section.titleVi),
      instructions: asString(locale === "vi" ? section.instructionsVi ?? section.instructions : section.instructions),
      instructionsVi: asString(section.instructionsVi),
      items: asArray<unknown>(section.items)
        .map(snapshotItem)
        .filter((item): item is CompositionItemSnapshot => item !== null),
    }))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function safeQuestionSnapshot(question: AttemptRuntimeQuestion): StudentQuestionSnapshot {
  const value = asRecord(question.questionSnapshot) ?? {};
  const spec = asRecord(value.spec ?? value.definition ?? value.questionSpec) ?? value;
  const common = asRecord(spec.common ?? value.common) ?? {};
  const segments = asArray<unknown>(spec.segments)
    .map(asRecord)
    .filter((segment): segment is JsonRecord => segment !== null)
    .map((segment) => ({
      text: asString(segment.text),
      blankKey: typeof segment.blankKey === "string" ? segment.blankKey : undefined,
    }));
  const blankKeys = asArray<unknown>(spec.blanks)
    .map(asRecord)
    .filter((blank): blank is JsonRecord => blank !== null)
    .map((blank) => asString(blank.key))
    .filter(Boolean);

  // Canonical ClozeSpec stores N+1 segments and N blanks without an explicit
  // blankKey on each segment. Attach those keys in order for inline rendering.
  const orderedSegments = segments.map((segment, index) => ({
    ...segment,
    blankKey: segment.blankKey
      ?? (segments.length === blankKeys.length + 1 && index < blankKeys.length
        ? blankKeys[index]
        : undefined),
  }));

  // Canonical QuestionSpec snapshots serialize prompt content under common.content.
  // The server must remove correct keys/accepted answers before this projection is returned.
  return {
    type: asString(spec.type ?? value.type).toUpperCase(),
    poolId: asString(spec.poolId ?? value.poolId),
    prompt: asString(spec.prompt ?? spec.content ?? spec.text ?? value.prompt ?? value.content ?? common.content),
    choices: asArray<unknown>(spec.choices ?? spec.options)
      .map(asRecord)
      .filter((choice): choice is JsonRecord => choice !== null)
      .map((choice) => ({
        key: asString(choice.key ?? choice.id),
        text: asString(choice.text ?? choice.content ?? choice.label),
      }))
      .filter((choice) => choice.key !== "" && choice.text !== ""),
    media: asArray<unknown>(spec.media ?? value.media)
      .map(asRecord)
      .filter((media): media is JsonRecord => media !== null)
      .map((media) => ({
        url: asString(media.url),
        alt: asString(media.alt ?? media.name),
        kind: asString(media.kind ?? media.mediaType).toLowerCase(),
      }))
      .filter((media) => media.url !== ""),
    items: asArray<unknown>(spec.items)
      .map(asRecord)
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({ key: asString(item.key ?? item.itemKey), text: asString(item.content ?? item.prompt) }))
      .filter((item) => item.key !== "" && item.text !== ""),
    answerPool: asArray<unknown>(spec.answerPool ?? spec.answer_pool)
      .map(asRecord)
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({ key: asString(item.key ?? item.id), text: asString(item.content ?? item.text) }))
      .filter((item) => item.key !== "" && item.text !== ""),
    segments: orderedSegments,
    blankKeys,
  };
}

function BlockView({ item, locale }: { item: CompositionItemSnapshot; locale: string }) {
  const payload = item.blockPayload ?? {};
  const type = (item.itemType ?? "").toUpperCase();

  if (type === "INSTRUCTIONS") {
    const text = asString(locale === "vi" ? payload.textVi ?? payload.instructionsVi ?? payload.text ?? payload.instructions : payload.text ?? payload.instructions);
    return text ? <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">{text}</div> : null;
  }

  if (type === "PASSAGE") {
    const title = asString(locale === "vi" ? payload.titleVi ?? payload.title : payload.title);
    const text = asString(locale === "vi" ? payload.textVi ?? payload.text ?? payload.content : payload.text ?? payload.content);
    return (
      <article className="space-y-2 rounded-2xl border border-border-color bg-background-app p-5">
        {title && <h3 className="font-bold text-neutral-dark">{title}</h3>}
        <p className="whitespace-pre-wrap text-body leading-7 text-neutral-dark">{text}</p>
      </article>
    );
  }

  if (type === "MEDIA") {
    const url = asString(payload.url);
    const alt = asString(payload.alt);
    const caption = asString(locale === "vi" ? payload.captionVi ?? payload.caption : payload.caption);
    if (!url) return null;
    const isAudio = /audio/i.test(asString(payload.kind ?? payload.mediaType)) || /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url);
    return (
      <figure className="space-y-2 rounded-2xl border border-border-color p-4">
        {isAudio
          ? <audio controls src={url} className="w-full" />
          : <img src={url} alt={alt} className="mx-auto max-h-72 max-w-full rounded-lg object-contain" />}
        {caption && <figcaption className="text-center text-sm text-neutral-muted">{caption}</figcaption>}
      </figure>
    );
  }

  if (type === "POOL") {
    const entries = asArray<unknown>(payload.entries)
      .map(asRecord)
      .filter((entry): entry is JsonRecord => entry !== null)
      .map((entry) => asString(entry.text))
      .filter(Boolean);
    if (!entries.length) return null;
    return (
      <aside className="rounded-xl border border-violet-200 bg-violet-50 p-4">
        {asString(locale === "vi" ? payload.titleVi ?? payload.title : payload.title) && <h4 className="mb-2 font-bold text-violet-950">{asString(locale === "vi" ? payload.titleVi ?? payload.title : payload.title)}</h4>}
        <ul className="flex flex-wrap gap-2">{entries.map((entry, index) => <li key={index} className="rounded-lg bg-white px-3 py-1.5 text-sm text-violet-950">{entry}</li>)}</ul>
      </aside>
    );
  }

  return null;
}

function QuestionCard({
  question,
  answer,
  poolOptions,
  onAnswerChange,
}: {
  question: AttemptRuntimeQuestion;
  answer: AttemptAnswerPayload | undefined;
  poolOptions: { key: string; text: string }[];
  onAnswerChange: (answer: AttemptAnswerPayload) => void;
}) {
  const t = useTranslations("student.assignmentAttempt.paper");
  const total = useContext(QuestionTotalContext);
  const snapshot = useMemo(() => safeQuestionSnapshot(question), [question]);
  const type = snapshot.type;
  const matchingPool = snapshot.answerPool.length > 0 ? snapshot.answerPool : poolOptions;
  const selectedKey = typeof answer?.selectedKey === "string" ? answer.selectedKey : "";
  const selectedKeys = Array.isArray(answer?.selectedKeys) ? answer.selectedKeys.filter((value): value is string => typeof value === "string") : [];
  const value = typeof answer?.value === "string" ? answer.value : "";
  const values = asRecord(answer?.values) ?? {};
  const pairs = asRecord(answer?.pairs) ?? {};

  return (
    <article
      data-question-id={question.attemptQuestionId}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-border-color bg-white p-5"
      aria-labelledby={`question-${question.attemptQuestionId}`}
    >
      <header className="space-y-3">
        <span className="inline-flex rounded-md bg-primary-light px-2.5 py-1 text-sm font-bold text-primary">
          {t("questionOf", { current: question.position + 1, total })}
        </span>
        <h3 id={`question-${question.attemptQuestionId}`} className="text-base font-semibold text-neutral-dark">
          {snapshot.prompt || t("questionFallback")}
        </h3>
      </header>

      {snapshot.media.map((media, index) => (
        <figure key={`${media.url}-${index}`} className="space-y-1">
          {media.kind.includes("audio")
            ? <audio controls src={media.url} className="w-full" />
            : <img src={media.url} alt={media.alt} className="max-h-64 max-w-full rounded-lg object-contain" />}
        </figure>
      ))}

      {(type === "SINGLE_CHOICE" || type === "TRUE_FALSE") && (
        <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="sr-only">{snapshot.prompt}</legend>
          {(snapshot.choices.length ? snapshot.choices : [{ key: "TRUE", text: t("true") }, { key: "FALSE", text: t("false") }]).map((choice, index) => (
            <label key={choice.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedKey === choice.key ? "border-primary bg-primary-light" : "border-border-color bg-white hover:bg-background-app"}`}>
              <input type="radio" name={`attempt-${question.attemptQuestionId}`} checked={selectedKey === choice.key} onChange={() => onAnswerChange({ selectedKey: choice.key })} />
              <span><b className="mr-1.5">{String.fromCharCode(65 + index)}.</b>{choice.text}</span>
            </label>
          ))}
        </fieldset>
      )}

      {type === "MULTIPLE_CHOICE" && (
        <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="sr-only">{snapshot.prompt}</legend>
          {snapshot.choices.map((choice, index) => (
            <label key={choice.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedKeys.includes(choice.key) ? "border-primary bg-primary-light" : "border-border-color bg-white hover:bg-background-app"}`}>
              <input type="checkbox" checked={selectedKeys.includes(choice.key)} onChange={(event) => onAnswerChange({ selectedKeys: event.target.checked ? [...selectedKeys, choice.key] : selectedKeys.filter((key) => key !== choice.key) })} />
              <span><b className="mr-1.5">{String.fromCharCode(65 + index)}.</b>{choice.text}</span>
            </label>
          ))}
        </fieldset>
      )}

      {(type === "FILL_IN_BLANK" || type === "TYPE_ANSWER") && (
        <input value={value} onChange={(event) => onAnswerChange({ value: event.target.value })} className="h-11 w-full rounded-xl border border-border-color bg-white px-3 text-body text-neutral-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label={snapshot.prompt || t("answer")} />
      )}

      {type === "MATCHING" && snapshot.items.length > 0 && (
        <div className="space-y-3">
          {snapshot.items.map((item) => {
            const picked = typeof pairs[item.key] === "string" ? String(pairs[item.key]) : "";
            return (
              <label key={item.key} className="grid gap-2 sm:grid-cols-[1fr_1fr] sm:items-center">
                <span className="text-sm font-medium text-neutral-dark">{item.text}</span>
                <select value={picked} onChange={(event) => onAnswerChange({ pairs: { ...pairs, [item.key]: event.target.value } })} className="h-11 rounded-xl border border-border-color bg-white px-3 text-body text-neutral-dark">
                  <option value="">—</option>
                  {matchingPool.map((option) => <option key={option.key} value={option.key}>{option.text}</option>)}
                </select>
              </label>
            );
          })}
        </div>
      )}

      {type === "MATCHING" && snapshot.items.length === 0 && matchingPool.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="sr-only">{snapshot.prompt}</legend>
          {matchingPool.map((option) => (
            <label key={option.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedKey === option.key ? "border-primary bg-primary-light" : "border-border-color bg-white hover:bg-background-app"}`}>
              <input type="radio" name={`attempt-${question.attemptQuestionId}`} checked={selectedKey === option.key} onChange={() => onAnswerChange({ selectedKey: option.key })} />
              <span>{option.text}</span>
            </label>
          ))}
        </fieldset>
      )}

      {type === "MATCHING" && snapshot.items.length === 0 && matchingPool.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{t("matchingPoolMissing")}</p>
      )}

      {type === "CLOZE" && snapshot.blankKeys.length > 0 && (
        <div className="space-y-3">
          {snapshot.segments.some((segment) => Boolean(segment.blankKey)) ? (
            <p className="whitespace-pre-wrap text-base leading-8 text-neutral-dark">
              {snapshot.segments.map((segment, index) => (
                <Fragment key={`segment-${index}`}>
                  <span>{segment.text}</span>
                  {segment.blankKey && (() => {
                    const key = segment.blankKey;
                    const current = typeof values[key] === "string" ? String(values[key]) : "";
                    return (
                      <input
                        value={current}
                        onChange={(event) => onAnswerChange({ values: { ...values, [key]: event.target.value } })}
                        className="mx-1 inline-block h-10 w-28 rounded-lg border border-border-color bg-white px-2 text-body text-neutral-dark align-baseline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label={t("blank", { index: snapshot.blankKeys.indexOf(key) + 1 })}
                      />
                    );
                  })()}
                </Fragment>
              ))}
            </p>
          ) : (
            snapshot.blankKeys.map((key, index) => {
              const current = typeof values[key] === "string" ? String(values[key]) : "";
              return <label key={key} className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                <span className="text-sm font-semibold text-neutral-muted">{t("blank", { index: index + 1 })}</span>
                <input value={current} onChange={(event) => onAnswerChange({ values: { ...values, [key]: event.target.value } })} className="h-11 rounded-xl border border-border-color bg-white px-3 text-body text-neutral-dark" aria-label={`Blank ${index + 1}`} />
              </label>;
            })
          )}
        </div>
      )}

      {!["SINGLE_CHOICE", "TRUE_FALSE", "MULTIPLE_CHOICE", "FILL_IN_BLANK", "TYPE_ANSWER", "MATCHING", "CLOZE"].includes(type) && (
        <p className="text-sm text-amber-800">{t("unsupportedType")}</p>
      )}
    </article>
  );
}

type PoolOption = { key: string; text: string };

function collectPoolOptions(
  item: CompositionItemSnapshot,
  poolsById: Map<string, PoolOption[]>,
): void {
  if (item.itemType === "POOL" && item.blockPayload) {
    const payload = item.blockPayload;
    const entries = asArray<unknown>(payload.entries)
      .map(asRecord)
      .filter((entry): entry is JsonRecord => entry !== null)
      .map((entry) => ({ key: asString(entry.id), text: asString(entry.text) }))
      .filter((entry) => entry.key !== "" && entry.text !== "");
    const aliases = new Set<string>();
    if (typeof item.id === "number" || typeof item.id === "string") {
      aliases.add(String(item.id));
      aliases.add(`b-${item.id}`);
    }
    const logicalKey = asString(payload.poolKey);
    if (logicalKey) aliases.add(logicalKey);
    aliases.forEach((key) => poolsById.set(key, entries));
  }
  (item.children ?? []).forEach((child) => collectPoolOptions(child, poolsById));
}

function renderItem(
  item: CompositionItemSnapshot,
  questionsByItemId: Map<number, AttemptRuntimeQuestion>,
  poolsById: Map<string, PoolOption[]>,
  answers: Record<number, AttemptAnswerPayload>,
  onAnswerChange: (questionId: number, answer: AttemptAnswerPayload) => void,
  keyPrefix: string,
  locale: string,
) {
  if (item.itemType === "QUESTION" && typeof item.id === "number") {
    const question = questionsByItemId.get(item.id);
    if (!question) return null;
    const questionSnapshot = asRecord(question.questionSnapshot) ?? {};
    const nestedSpec = asRecord(questionSnapshot.spec ?? questionSnapshot.definition ?? questionSnapshot.questionSpec) ?? {};
    const questionPoolId = asString(questionSnapshot.poolId ?? nestedSpec.poolId);
    return <QuestionCard key={`${keyPrefix}-q-${question.attemptQuestionId}`} question={question} answer={answers[question.attemptQuestionId]} poolOptions={poolsById.get(questionPoolId) ?? []} onAnswerChange={(answer) => onAnswerChange(question.attemptQuestionId, answer)} />;
  }

  const block = <BlockView item={item} locale={locale} key={`${keyPrefix}-block-${String(item.id ?? item.position)}`} />;
  const children = (item.children ?? []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((child, index) => renderItem(child, questionsByItemId, poolsById, answers, onAnswerChange, `${keyPrefix}-child-${index}`, locale));
  return <div key={`${keyPrefix}-item-${String(item.id ?? item.position)}`} className="space-y-3">{block}{children}</div>;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const toRoman = (n: number) => ROMAN[n - 1] ?? String(n);

export function StudentPaper({
  runtime,
  answers,
  onAnswerChange,
}: {
  runtime: AttemptRuntimeResponse;
  answers: Record<number, AttemptAnswerPayload>;
  onAnswerChange: (attemptQuestionId: number, answer: AttemptAnswerPayload) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("student.assignmentAttempt.paper");
  const paperRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const document = asRecord(runtime.document) ?? {};
  const sections = snapshotSections(document, locale);
  const questionsByItemId = new Map<number, AttemptRuntimeQuestion>();
  const poolsById = new Map<string, PoolOption[]>();
  runtime.questions.forEach((question) => {
    if (question.assignmentItemId !== null) questionsByItemId.set(question.assignmentItemId, question);
  });
  sections.forEach((section) => (section.items ?? []).forEach((item) => collectPoolOptions(item, poolsById)));

  const orderedQuestions = useMemo(
    () => runtime.questions.slice().sort((a, b) => a.position - b.position),
    [runtime.questions],
  );
  const total = orderedQuestions.length;
  const answeredCount = orderedQuestions.filter((q) => hasMeaningfulAnswer(answers[q.attemptQuestionId])).length;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  // Highlight câu hỏi đang nằm trong vùng nhìn thấy
  useEffect(() => {
    const root = paperRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActiveId(Number(top.target.getAttribute("data-question-id")));
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    root.querySelectorAll("[data-question-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [orderedQuestions, sections.length]);

  const goToQuestion = (attemptQuestionId: number) => {
    const el = paperRef.current?.querySelector(`[data-question-id="${attemptQuestionId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(attemptQuestionId);
  };

  const paperBody =
    sections.length > 0 ? (
      sections.map((section, sectionIndex) => {
        const subtitle = section.titleVi && section.titleVi !== section.title ? section.titleVi : "";
        return (
          <section
            key={String(section.id ?? sectionIndex)}
            className="rounded-3xl border border-border-color bg-white p-6 shadow-sm sm:p-8"
          >
            <header className="space-y-2 border-b border-border-color pb-5">
              <span className="inline-flex rounded-md bg-primary-light px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {t("sectionLabel")} {toRoman(sectionIndex + 1)}
              </span>
              <h2 className="text-xl font-extrabold text-neutral-dark">
                {section.title || t("sectionFallback", { index: sectionIndex + 1 })}
              </h2>
              {subtitle && <p className="text-sm italic text-neutral-muted">{subtitle}</p>}
              {section.instructions && <p className="text-sm leading-6 text-neutral-muted">{section.instructions}</p>}
            </header>
            <div className="mt-6 space-y-5">
              {(section.items ?? [])
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((item, index) =>
                  renderItem(item, questionsByItemId, poolsById, answers, onAnswerChange, `section-${sectionIndex}-${index}`, locale),
                )}
            </div>
          </section>
        );
      })
    ) : (
      <section className="rounded-3xl border border-border-color bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          {orderedQuestions.map((question) => (
            <QuestionCard
              key={question.attemptQuestionId}
              question={question}
              answer={answers[question.attemptQuestionId]}
              poolOptions={[]}
              onAnswerChange={(answer) => onAnswerChange(question.attemptQuestionId, answer)}
            />
          ))}
        </div>
      </section>
    );

  return (
    <QuestionTotalContext.Provider value={total}>
      <div className="mx-auto grid w-full max-w-7xl gap-6 bg-white px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Vùng làm bài: các section nằm trong khung riêng */}
        <div ref={paperRef} className="min-w-0 space-y-6">{paperBody}</div>

        {/* Bản đồ câu hỏi: dính theo khi lướt */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col rounded-3xl border border-border-color bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-neutral-dark">{t("palette.title")}</h2>
              <span className="text-sm font-bold text-primary">{answeredCount} / {total}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background-app" aria-hidden="true">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>

            <nav aria-label={t("palette.title")} className="mt-5 min-h-0 flex-1 overflow-y-auto">
              <ul className="grid grid-cols-5 gap-2">
                {orderedQuestions.map((question) => {
                  const answered = hasMeaningfulAnswer(answers[question.attemptQuestionId]);
                  const active = activeId === question.attemptQuestionId;
                  return (
                    <li key={question.attemptQuestionId}>
                      <button
                        type="button"
                        onClick={() => goToQuestion(question.attemptQuestionId)}
                        aria-current={active ? "true" : undefined}
                        className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition ${
                          answered ? "bg-primary-light text-primary" : "bg-background-app text-neutral-dark hover:bg-border-color"
                        } ${active ? "ring-2 ring-primary ring-offset-1" : ""}`}
                      >
                        {question.position + 1}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <ul className="mt-5 space-y-2 border-t border-border-color pt-4 text-sm text-neutral-muted">
              <li className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-border-color bg-background-app" />
                {t("palette.unansweredLegend")}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-primary/30 bg-primary-light" />
                {t("palette.answeredLegend")}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </QuestionTotalContext.Provider>
  );
}