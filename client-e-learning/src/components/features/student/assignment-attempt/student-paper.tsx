"use client";

import { useMemo } from "react";
import type {
  AttemptAnswerPayload,
  AttemptRuntimeQuestion,
  AttemptRuntimeResponse,
  StudentQuestionSnapshot,
} from "@/types/student/assignment-attempt";

type JsonRecord = Record<string, unknown>;

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
  instructions?: string;
  items?: CompositionItemSnapshot[];
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

function snapshotSections(document: JsonRecord): CompositionSectionSnapshot[] {
  return asArray<unknown>(document.sections)
    .map(asRecord)
    .filter((section): section is JsonRecord => section !== null)
    .map((section) => ({
      id: typeof section.id === "string" || typeof section.id === "number" ? section.id : undefined,
      position: typeof section.position === "number" ? section.position : 0,
      title: asString(section.title),
      instructions: asString(section.instructions),
      items: asArray<unknown>(section.items)
        .map(snapshotItem)
        .filter((item): item is CompositionItemSnapshot => item !== null),
    }))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}
function safeQuestionSnapshot(question: AttemptRuntimeQuestion): StudentQuestionSnapshot {
  const value = asRecord(question.questionSnapshot) ?? {};
  const common = asRecord(value.common) ?? {};
  const segments = asArray<unknown>(value.segments)
    .map(asRecord)
    .filter((segment): segment is JsonRecord => segment !== null)
    .map((segment) => ({
      text: asString(segment.text),
      blankKey: typeof segment.blankKey === "string" ? segment.blankKey : undefined,
    }));
  const blankKeys = asArray<unknown>(value.blanks)
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
    type: asString(value.type).toUpperCase(),
    prompt: asString(value.prompt ?? value.content ?? value.text ?? common.content),
    choices: asArray<unknown>(value.choices ?? value.options)
      .map(asRecord)
      .filter((choice): choice is JsonRecord => choice !== null)
      .map((choice) => ({
        key: asString(choice.key ?? choice.id),
        text: asString(choice.text ?? choice.content ?? choice.label),
      }))
      .filter((choice) => choice.key !== "" && choice.text !== ""),
    media: asArray<unknown>(value.media)
      .map(asRecord)
      .filter((media): media is JsonRecord => media !== null)
      .map((media) => ({
        url: asString(media.url),
        alt: asString(media.alt ?? media.name),
        kind: asString(media.kind ?? media.mediaType).toLowerCase(),
      }))
      .filter((media) => media.url !== ""),
    items: asArray<unknown>(value.items)
      .map(asRecord)
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({ key: asString(item.key ?? item.itemKey), text: asString(item.content ?? item.prompt) }))
      .filter((item) => item.key !== "" && item.text !== ""),
    answerPool: asArray<unknown>(value.answerPool)
      .map(asRecord)
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({ key: asString(item.key ?? item.id), text: asString(item.content ?? item.text) }))
      .filter((item) => item.key !== "" && item.text !== ""),
    segments: orderedSegments,
    blankKeys,
  };
}

function BlockView({ item }: { item: CompositionItemSnapshot }) {
  const payload = item.blockPayload ?? {};
  const type = (item.itemType ?? "").toUpperCase();

  if (type === "INSTRUCTIONS") {
    const text = asString(payload.text ?? payload.instructions);
    return text ? <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">{text}</div> : null;
  }

  if (type === "PASSAGE") {
    const title = asString(payload.title);
    const text = asString(payload.text ?? payload.content);
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
    const caption = asString(payload.caption);
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
        {asString(payload.title) && <h4 className="mb-2 font-bold text-violet-950">{asString(payload.title)}</h4>}
        <ul className="flex flex-wrap gap-2">{entries.map((entry, index) => <li key={index} className="rounded-lg bg-white px-3 py-1.5 text-sm text-violet-950">{entry}</li>)}</ul>
      </aside>
    );
  }

  return null;
}

function QuestionCard({
  question,
  answer,
  onAnswerChange,
}: {
  question: AttemptRuntimeQuestion;
  answer: AttemptAnswerPayload | undefined;
  onAnswerChange: (answer: AttemptAnswerPayload) => void;
}) {
  const snapshot = useMemo(() => safeQuestionSnapshot(question), [question]);
  const type = snapshot.type;
  const selectedKey = typeof answer?.selectedKey === "string" ? answer.selectedKey : "";
  const selectedKeys = Array.isArray(answer?.selectedKeys) ? answer.selectedKeys.filter((value): value is string => typeof value === "string") : [];
  const value = typeof answer?.value === "string" ? answer.value : "";
  const values = asRecord(answer?.values) ?? {};
  const pairs = asRecord(answer?.pairs) ?? {};

  return (
    <article className="space-y-4 rounded-2xl border border-border-color bg-card-bg p-5" aria-labelledby={`question-${question.attemptQuestionId}`}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`question-${question.attemptQuestionId}`} className="font-extrabold text-neutral-dark">
          {question.position + 1}. {snapshot.prompt || "Question"}
        </h3>
        <span className="rounded-full bg-background-app px-3 py-1 text-xs font-semibold text-neutral-muted">
          {type.replaceAll("_", " ")}
        </span>
      </header>

      {snapshot.media.map((media, index) => (
        <figure key={`${media.url}-${index}`} className="space-y-1">
          {media.kind.includes("audio")
            ? <audio controls src={media.url} className="w-full" />
            : <img src={media.url} alt={media.alt} className="max-h-64 max-w-full rounded-lg object-contain" />}
        </figure>
      ))}

      {(type === "SINGLE_CHOICE" || type === "TRUE_FALSE") && (
        <fieldset className="space-y-2">
          <legend className="sr-only">{snapshot.prompt}</legend>
          {(snapshot.choices.length ? snapshot.choices : [{ key: "TRUE", text: "True" }, { key: "FALSE", text: "False" }]).map((choice) => (
            <label key={choice.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedKey === choice.key ? "border-primary bg-primary-light" : "border-border-color hover:bg-background-app"}`}>
              <input type="radio" name={`attempt-${question.attemptQuestionId}`} checked={selectedKey === choice.key} onChange={() => onAnswerChange({ selectedKey: choice.key })} />
              <span>{choice.text}</span>
            </label>
          ))}
        </fieldset>
      )}

      {type === "MULTIPLE_CHOICE" && (
        <fieldset className="space-y-2">
          <legend className="sr-only">{snapshot.prompt}</legend>
          {snapshot.choices.map((choice) => (
            <label key={choice.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedKeys.includes(choice.key) ? "border-primary bg-primary-light" : "border-border-color hover:bg-background-app"}`}>
              <input type="checkbox" checked={selectedKeys.includes(choice.key)} onChange={(event) => onAnswerChange({ selectedKeys: event.target.checked ? [...selectedKeys, choice.key] : selectedKeys.filter((key) => key !== choice.key) })} />
              <span>{choice.text}</span>
            </label>
          ))}
        </fieldset>
      )}

      {(type === "FILL_IN_BLANK" || type === "TYPE_ANSWER") && (
        <input value={value} onChange={(event) => onAnswerChange({ value: event.target.value })} className="h-11 w-full rounded-xl border border-border-color bg-white px-3 text-body text-neutral-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label={snapshot.prompt || "Answer"} />
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
                  {snapshot.answerPool.map((option) => <option key={option.key} value={option.key}>{option.text}</option>)}
                </select>
              </label>
            );
          })}
        </div>
      )}

      {type === "CLOZE" && snapshot.blankKeys.length > 0 && (
        <div className="space-y-3">
          {snapshot.blankKeys.map((key, index) => {
            const current = typeof values[key] === "string" ? String(values[key]) : "";
            return <label key={key} className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
              <span className="text-sm font-semibold text-neutral-muted">Blank {index + 1}</span>
              <input value={current} onChange={(event) => onAnswerChange({ values: { ...values, [key]: event.target.value } })} className="h-11 rounded-xl border border-border-color bg-white px-3 text-body text-neutral-dark" aria-label={`Blank ${index + 1}`} />
            </label>;
          })}
        </div>
      )}

      {!["SINGLE_CHOICE", "TRUE_FALSE", "MULTIPLE_CHOICE", "FILL_IN_BLANK", "TYPE_ANSWER", "MATCHING", "CLOZE"].includes(type) && (
        <p className="text-sm text-amber-800">This question type is not supported by the current Student Paper renderer yet.</p>
      )}
    </article>
  );
}

function renderItem(
  item: CompositionItemSnapshot,
  questionsByItemId: Map<number, AttemptRuntimeQuestion>,
  answers: Record<number, AttemptAnswerPayload>,
  onAnswerChange: (questionId: number, answer: AttemptAnswerPayload) => void,
  keyPrefix: string,
) {
  if (item.itemType === "QUESTION" && typeof item.id === "number") {
    const question = questionsByItemId.get(item.id);
    if (!question) return null;
    return <QuestionCard key={`${keyPrefix}-q-${question.attemptQuestionId}`} question={question} answer={answers[question.attemptQuestionId]} onAnswerChange={(answer) => onAnswerChange(question.attemptQuestionId, answer)} />;
  }

  const block = <BlockView item={item} key={`${keyPrefix}-block-${String(item.id ?? item.position)}`} />;
  const children = (item.children ?? []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((child, index) => renderItem(child, questionsByItemId, answers, onAnswerChange, `${keyPrefix}-child-${index}`));
  return <div key={`${keyPrefix}-item-${String(item.id ?? item.position)}`} className="space-y-3">{block}{children}</div>;
}

export function StudentPaper({
  runtime,
  answers,
  onAnswerChange,
}: {
  runtime: AttemptRuntimeResponse;
  answers: Record<number, AttemptAnswerPayload>;
  onAnswerChange: (attemptQuestionId: number, answer: AttemptAnswerPayload) => void;
}) {
  const document = asRecord(runtime.document) ?? {};
  const sections = snapshotSections(document);
  const questionsByItemId = new Map<number, AttemptRuntimeQuestion>();
  runtime.questions.forEach((question) => {
    if (question.assignmentItemId !== null) questionsByItemId.set(question.assignmentItemId, question);
  });

  if (sections.length > 0) {
    return (
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <section key={String(section.id ?? sectionIndex)} className="space-y-4">
            <header className="space-y-1">
              <h2 className="text-lg font-extrabold text-neutral-dark">{section.title || `Section ${sectionIndex + 1}`}</h2>
              {section.instructions && <p className="text-sm leading-6 text-neutral-muted">{section.instructions}</p>}
            </header>
            {(section.items ?? []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((item, index) =>
              renderItem(item, questionsByItemId, answers, onAnswerChange, `section-${sectionIndex}-${index}`),
            )}
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {runtime.questions.slice().sort((a, b) => a.position - b.position).map((question) => (
        <QuestionCard key={question.attemptQuestionId} question={question} answer={answers[question.attemptQuestionId]} onAnswerChange={(answer) => onAnswerChange(question.attemptQuestionId, answer)} />
      ))}
    </div>
  );
}
