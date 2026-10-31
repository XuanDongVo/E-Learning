"use client";

import {
  Fragment,
  createContext,
  useContext,
  useMemo,
  useRef,
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
      /
/*__MORE_1__*/
