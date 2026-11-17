"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Shuffle } from "lucide-react";
import type { OrderingDraftDefinition } from "@/types/question";
import { makeOrderingPreviewOrder } from "./ordering-validation";

export function OrderingPreviewControls({
  definition,
  value,
  disabled,
  onChange,
}: {
  definition: OrderingDraftDefinition;
  value: string[];
  disabled: boolean;
  onChange: (value: string[]) => void;
}) {
  const [shuffleVariant, setShuffleVariant] = useState(0);
  const contentByKey = new Map(definition.items.map((item) => [item.key, item.content]));
  const previewOrder = useMemo(
    () => makeOrderingPreviewOrder(definition, shuffleVariant),
    [definition, shuffleVariant],
  );
  const itemByKey = new Map(definition.items.map((item) => [item.key, item]));
  const available = previewOrder
    .filter((key) => !value.includes(key))
    .map((key) => itemByKey.get(key))
    .filter((item) => item !== undefined);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const order = [...value];
    [order[index], order[target]] = [order[target], order[index]];
    onChange(order);
  };

  return (
    <div className="mt-5 space-y-4">
      <section aria-labelledby="ordering-answer-heading">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 id="ordering-answer-heading" className="text-sm font-black text-foreground">Thứ tự của bạn</h2>
          <div className="flex items-center gap-3">
            <button type="button" disabled={disabled} onClick={() => { onChange([]); setShuffleVariant((current) => current + 1); }} className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30">
              <Shuffle size={13} /> Trộn lại
            </button>
            <button type="button" disabled={disabled || value.length === 0} onClick={() => onChange([])} className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30">
              <RotateCcw size={13} /> Xếp lại
            </button>
          </div>
        </div>
        <ol className="min-h-16 space-y-2 rounded-xl border-2 border-dashed border-border bg-secondary/40 p-2.5">
          {value.length === 0 && <li className="px-2 py-3 text-center text-xs text-muted-foreground">Chọn các mảnh bên dưới theo thứ tự đúng.</li>}
          {value.map((key, index) => (
            <li key={key} className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-black">{index + 1}</span>
              <span className="min-w-0 flex-1 break-words text-sm font-semibold">{contentByKey.get(key)}</span>
              <button type="button" disabled={disabled || index === 0} onClick={() => move(index, -1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30" aria-label={`Đưa mảnh ${index + 1} lên`}><ArrowUp size={14} /></button>
              <button type="button" disabled={disabled || index === value.length - 1} onClick={() => move(index, 1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30" aria-label={`Đưa mảnh ${index + 1} xuống`}><ArrowDown size={14} /></button>
            </li>
          ))}
        </ol>
      </section>

      {available.length > 0 && (
        <section aria-label="Các mảnh chưa xếp">
          <p className="mb-2 text-xs font-bold text-muted-foreground">Mảnh chưa xếp</p>
          <div className="flex flex-wrap gap-2">
            {available.map((item) => (
              <button key={item.key} type="button" disabled={disabled} onClick={() => onChange([...value, item.key])} className="student-control student-control--secondary inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border px-3 py-2 text-left text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40">
                <Plus size={14} className="shrink-0" /> {item.content || "Mảnh chưa có nội dung"}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
