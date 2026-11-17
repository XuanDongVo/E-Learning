"use client";

import { RotateCcw } from "lucide-react";
import { OrderingDraftOrder } from "./OrderingDraftOrder";
import { OrderingItemPool } from "./OrderingItemPool";
import type { RuntimeOrdering } from "./ordering-types";

export function OrderingAnswer({
  ordering,
  draft,
  disabled,
  onChange,
}: {
  ordering: RuntimeOrdering;
  draft: string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const byKey = new Map(ordering.items.map((item) => [item.key, item]));
  const selectedItems = draft.flatMap((key) => {
    const item = byKey.get(key);
    return item ? [item] : [];
  });

  return (
    <div className="min-w-0 space-y-4">
      <section aria-labelledby="ordering-draft-heading" className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 id="ordering-draft-heading" className="student-label">
              Thứ tự của bạn
            </h3>
            <p
              id="ordering-progress"
              aria-live="polite"
              aria-atomic="true"
              className="student-meta text-muted-foreground"
            >
              Đã xếp {draft.length}/{ordering.items.length} mảnh
            </p>
          </div>
          <button
            type="button"
            disabled={disabled || draft.length === 0}
            onClick={() => onChange([])}
            className="student-control student-control--quiet student-label inline-flex min-h-11 shrink-0 items-center gap-2 px-3 disabled:opacity-30"
          >
            <RotateCcw size={15} aria-hidden /> Xếp lại
          </button>
        </div>
        <div className="min-h-20 min-w-0 rounded-xl border-2 border-dashed border-border bg-background/50 p-2 sm:p-3">
          {selectedItems.length === 0 ? (
            <p className="student-body py-3 text-center text-muted-foreground">
              Chọn từng mảnh bên dưới để tạo câu trả lời.
            </p>
          ) : (
            <OrderingDraftOrder
              ordering={ordering}
              items={selectedItems}
              disabled={disabled}
              onReorder={onChange}
              onRemove={(key) =>
                onChange(draft.filter((itemKey) => itemKey !== key))
              }
            />
          )}
        </div>
      </section>
      <OrderingItemPool
        ordering={ordering}
        selectedKeys={draft}
        disabled={disabled}
        onPick={(key) => onChange([...draft, key])}
      />
    </div>
  );
}
