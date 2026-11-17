import type {
  OrderingDraftDefinition,
  OrderingItemDraft,
} from "@/types/question";

function newKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ord-${crypto.randomUUID()}`;
  }
  return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function makeOrderingItem(content = ""): OrderingItemDraft {
  return { key: newKey(), content };
}

export function makeOrderingDefinition(): OrderingDraftDefinition {
  const items = [makeOrderingItem(), makeOrderingItem(), makeOrderingItem()];
  return {
    schemaVersion: 1,
    subtype: "WORD",
    items,
    acceptedOrders: [items.map((item) => item.key)],
  };
}

export function cloneOrderingDefinition(
  definition: OrderingDraftDefinition | undefined,
): OrderingDraftDefinition | undefined {
  if (!definition) return undefined;
  return {
    ...definition,
    items: definition.items.map((item) => ({ ...item })),
    acceptedOrders: definition.acceptedOrders.map((order) => [...order]),
  };
}

export function synchronizeOrderingDefinition(
  definition: OrderingDraftDefinition,
  items: OrderingItemDraft[],
): OrderingDraftDefinition {
  const keys = items.map((item) => item.key);
  return {
    ...definition,
    items,
    acceptedOrders: [keys, ...definition.acceptedOrders.slice(1)],
  };
}
