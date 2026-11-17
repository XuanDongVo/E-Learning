"use client";

import { ChevronDown, Shuffle } from "lucide-react";
import type { OrderingDraftDefinition, OrderingSubtype } from "@/types/question";
import { OrderingAcceptedOrdersEditor } from "./OrderingAcceptedOrdersEditor";
import { OrderingItemsEditor } from "./OrderingItemsEditor";

const subtypes: { value: OrderingSubtype; label: string; help: string }[] = [
  { value: "WORD", label: "Word", help: "Build a sentence from individual words." },
  { value: "PHRASE", label: "Phrase", help: "Arrange meaningful phrase chunks." },
  { value: "SENTENCE", label: "Sentence", help: "Order sentences in a paragraph, dialogue or event." },
];

export function OrderingEditor({
  value,
  onChange,
}: {
  value: OrderingDraftDefinition;
  onChange: (value: OrderingDraftDefinition) => void;
}) {
  const selected = subtypes.find((item) => item.value === value.subtype) ?? subtypes[0];
  return (
    <div className="space-y-5 rounded-xl border-2 border-border bg-secondary/30 p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr] md:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-foreground">Ordering subtype</span>
          <span className="relative block">
            <select
              value={value.subtype}
              onChange={(event) => onChange({ ...value, subtype: event.target.value as OrderingSubtype })}
              className="h-11 w-full appearance-none rounded-lg border-2 border-border bg-card px-3 pr-9 text-sm font-semibold text-foreground outline-none focus:border-primary"
            >
              {subtypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>
        <div className="rounded-lg border border-border bg-card px-3 py-2.5">
          <p className="text-xs text-muted-foreground">{selected.help}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <Shuffle size={13} aria-hidden /> Student items are always shuffled by the server.
          </p>
        </div>
      </div>
      <OrderingItemsEditor value={value} onChange={onChange} />
      <OrderingAcceptedOrdersEditor value={value} onChange={onChange} />
    </div>
  );
}
