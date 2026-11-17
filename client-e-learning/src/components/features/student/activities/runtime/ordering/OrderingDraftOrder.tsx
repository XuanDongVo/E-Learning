"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Undo2 } from "lucide-react";
import type { RuntimeOrdering, RuntimeOrderingItem } from "./ordering-types";

export function OrderingDraftOrder({
  ordering,
  items,
  disabled,
  onMove,
  onRemove,
}: {
  ordering: RuntimeOrdering;
  items: RuntimeOrderingItem[];
  disabled?: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
}) {
  const sentenceLayout = ordering.subtype === "SENTENCE";

  return (
    <ol
      className={
        sentenceLayout
          ? "grid min-h-16 gap-2"
          : "flex min-h-16 flex-wrap content-start gap-2"
      }
    >
      {items.map((item, index) => (
        <li
          key={item.key}
          className={
            "student-control student-control--quiet student-body flex min-w-0 items-center gap-2 px-3 py-2 " +
            (sentenceLayout ? "w-full" : "max-w-full")
          }
        >
          <span className="student-meta grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 break-words">{item.content}</span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={disabled || index === 0}
              onClick={() => onMove(index, -1)}
              className="student-control student-control--quiet grid size-11 place-items-center p-0 disabled:opacity-30"
              aria-label={`Đưa mảnh ${index + 1} ${sentenceLayout ? "lên" : "sang trái"}`}
            >
              {sentenceLayout ? <ArrowUp size={15} /> : <ArrowLeft size={15} />}
            </button>
            <button
              type="button"
              disabled={disabled || index === items.length - 1}
              onClick={() => onMove(index, 1)}
              className="student-control student-control--quiet grid size-11 place-items-center p-0 disabled:opacity-30"
              aria-label={`Đưa mảnh ${index + 1} ${sentenceLayout ? "xuống" : "sang phải"}`}
            >
              {sentenceLayout ? <ArrowDown size={15} /> : <ArrowRight size={15} />}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(item.key)}
              className="student-control student-control--quiet grid size-11 place-items-center p-0 disabled:opacity-30"
              aria-label={`Trả mảnh ${index + 1} về danh sách`}
            >
              <Undo2 size={15} />
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
