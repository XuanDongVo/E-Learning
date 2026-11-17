"use client";

import { Plus } from "lucide-react";
import type { RuntimeOrdering } from "./ordering-types";

export function OrderingItemPool({
  ordering,
  selectedKeys,
  disabled,
  onPick,
}: {
  ordering: RuntimeOrdering;
  selectedKeys: string[];
  disabled?: boolean;
  onPick: (key: string) => void;
}) {
  const remaining = ordering.items.filter((item) => !selectedKeys.includes(item.key));
  if (remaining.length === 0) return null;

  return (
    <section aria-labelledby="ordering-pool-heading" className="space-y-2">
      <h3 id="ordering-pool-heading" className="student-label text-muted-foreground">
        Mảnh chưa xếp
      </h3>
      <div
        className={
          ordering.subtype === "SENTENCE"
            ? "grid gap-2"
            : "flex flex-wrap gap-2"
        }
      >
        {remaining.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={disabled}
            onClick={() => onPick(item.key)}
            className={
              "student-control student-control--secondary student-body inline-flex min-h-11 items-center gap-2 px-3 py-2 text-left " +
              (ordering.subtype === "SENTENCE" ? "w-full" : "max-w-full")
            }
          >
            <Plus size={16} aria-hidden className="shrink-0" />
            <span className="min-w-0 break-words">{item.content}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
