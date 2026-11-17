import type { OrderingDraftDefinition } from "@/types/question";

export function OrderingDefinitionSummary({
  definition,
}: {
  definition: OrderingDraftDefinition;
}) {
  const contentByKey = new Map(definition.items.map((item) => [item.key, item.content]));
  return (
    <section aria-labelledby="ordering-summary-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 id="ordering-summary-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Accepted orders
        </h3>
        <span className="rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-bold text-foreground">
          {definition.subtype}
        </span>
      </div>
      <div className="space-y-2">
        {definition.acceptedOrders.map((order, orderIndex) => (
          <ol key={orderIndex} className="flex flex-wrap gap-1.5 rounded-lg border-2 border-border bg-secondary/40 p-2.5">
            {order.map((key, index) => (
              <li key={key} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-xs font-semibold text-foreground">
                <span className="font-black text-primary">{index + 1}</span>
                {contentByKey.get(key) ?? "Unknown item"}
              </li>
            ))}
          </ol>
        ))}
      </div>
    </section>
  );
}
