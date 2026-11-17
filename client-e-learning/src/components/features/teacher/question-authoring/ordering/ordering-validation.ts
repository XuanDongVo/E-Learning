import type { OrderingDraftDefinition } from "@/types/question";

function canonical(value: string): string {
  return value.normalize("NFC").replace(/\r\n?/g, "\n").trim();
}

export function makeOrderingPreviewOrder(
  definition: OrderingDraftDefinition,
  variant = 0,
): string[] {
  const contentByKey = new Map(
    definition.items.map((item) => [item.key, canonical(item.content)]),
  );
  const accepted = new Set(
    definition.acceptedOrders.map((order) =>
      JSON.stringify(order.map((key) => contentByKey.get(key))),
    ),
  );
  const candidates: string[][] = [];
  const seenVisibleOrders = new Set<string>();

  const visit = (prefix: string[], remaining: string[]) => {
    if (remaining.length === 0) {
      const visible = JSON.stringify(prefix.map((key) => contentByKey.get(key)));
      if (!accepted.has(visible) && !seenVisibleOrders.has(visible)) {
        seenVisibleOrders.add(visible);
        candidates.push(prefix);
      }
      return;
    }
    remaining.forEach((key, index) =>
      visit(
        [...prefix, key],
        remaining.filter((_, currentIndex) => currentIndex !== index),
      ),
    );
  };

  visit([], definition.items.map((item) => item.key));
  if (candidates.length === 0) return definition.items.map((item) => item.key);
  return candidates[Math.abs(variant) % candidates.length];
}

export function isOrderingDefinitionComplete(
  definition: OrderingDraftDefinition | undefined,
): boolean {
  if (!definition || definition.schemaVersion !== 1) return false;
  if (definition.items.length < 3 || definition.items.length > 8) return false;
  const keys = definition.items.map((item) => item.key.trim());
  if (keys.some((key) => !key) || new Set(keys).size !== keys.length) return false;
  const contentLimit = orderingContentLimit(definition.subtype);
  if (
    definition.items.some((item) => {
      const content = canonical(item.content);
      return !content || content.length > contentLimit;
    })
  ) {
    return false;
  }
  if (!definition.acceptedOrders.length) return false;
  const expected = new Set(keys);
  const ordersAreValid = definition.acceptedOrders.every(
    (order) =>
      order.length === keys.length &&
      new Set(order).size === order.length &&
      order.every((key) => expected.has(key)),
  );
  if (!ordersAreValid) return false;

  const contentByKey = new Map(
    definition.items.map((item) => [item.key, canonical(item.content)]),
  );
  const acceptedVisibleOrders = new Set(
    definition.acceptedOrders.map((order) =>
      JSON.stringify(order.map((key) => contentByKey.get(key))),
    ),
  );

  return acceptedVisibleOrders.size < distinctPermutationCount(
    definition.items.map((item) => canonical(item.content)),
  );
}

function distinctPermutationCount(values: string[]): number {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  let result = factorial(values.length);
  counts.forEach((count) => {
    result /= factorial(count);
  });
  return result;
}

function factorial(value: number): number {
  let result = 1;
  for (let current = 2; current <= value; current += 1) result *= current;
  return result;
}

export function gradeOrderingDraft(
  definition: OrderingDraftDefinition,
  submittedOrder: string[],
): boolean {
  const contentByKey = new Map(
    definition.items.map((item) => [item.key, canonical(item.content)]),
  );
  const submitted = submittedOrder.map((key) => contentByKey.get(key) ?? "");
  return definition.acceptedOrders.some((order) =>
    order.every((key, index) => contentByKey.get(key) === submitted[index]),
  );
}

export function orderingContentLimit(
  subtype: OrderingDraftDefinition["subtype"],
): number {
  if (subtype === "WORD") return 60;
  if (subtype === "PHRASE") return 180;
  return 400;
}
