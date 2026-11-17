
"use client";

import { useState } from "react";
import {
  AlertCircle,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { OrderingDraftDefinition } from "@/types/question";

type Props = {
  value: OrderingDraftDefinition;
  onChange: (value: OrderingDraftDefinition) => void;
};

type SortableItemProps = {
  itemKey: string;
  content: string;
  index: number;
};

function SortableItem({
  itemKey,
  content,
  index,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemKey });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
      className={[
        "flex items-center gap-2 rounded-xl border-2 bg-card p-2",
        isDragging
          ? "border-primary shadow-lg"
          : "border-border",
      ].join(" ")}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Drag item ${index + 1} to reorder`}
        className="flex size-10 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-primary"
      >
        <GripVertical size={19} aria-hidden />
      </button>

      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold tabular-nums text-foreground">
        {index + 1}
      </span>

      <span className="min-w-0 flex-1 break-words text-sm font-medium text-foreground">
        {content.trim() || "Untitled item"}
      </span>
    </li>
  );
}

function AlternativeOrder({
  order,
  index,
  contentByKey,
  primary,
  needsReview,
  onUpdate,
  onRemove,
}: {
  order: string[];
  index: number;
  contentByKey: Map<string, string>;
  primary: string[];
  needsReview: boolean;
  onUpdate: (order: string[]) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 1 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));

    if (oldIndex < 0 || newIndex < 0) return;

    onUpdate(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <article className="rounded-xl border-2 border-border bg-secondary/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className="text-left text-xs font-bold text-foreground hover:text-primary"
          >
            Alternative {index + 1}
          </button>

          {needsReview && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive-soft px-2 py-1 text-[11px] font-semibold text-destructive">
              <AlertCircle size={12} />
              Needs review
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdate([...primary])}
            aria-label={`Reset alternative ${index + 1}`}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-primary"
            title="Reset from primary"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Delete alternative ${index + 1}`}
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive-soft hover:text-destructive"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={order}
              strategy={verticalListSortingStrategy}
            >
              <ol className="space-y-2">
                {order.map((key, itemIndex) => (
                  <SortableItem
                    key={`${key}-${itemIndex}`}
                    itemKey={key}
                    index={itemIndex}
                    content={contentByKey.get(key) ?? ""}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">
          {order
            .map((key) => contentByKey.get(key)?.trim() || "Untitled item")
            .join(" / ")}
        </p>
      )}
    </article>
  );
}

export function OrderingAcceptedOrdersEditor({
  value,
  onChange,
}: Props) {
  const primary = value.items.map((item) => item.key);
  const alternatives = value.acceptedOrders.slice(1);

  const contentByKey = new Map(
    value.items.map((item) => [item.key, item.content]),
  );
  const expectedKeys = new Set(primary);

  const needsReview = (order: string[]) =>
    order.length !== primary.length ||
    new Set(order).size !== order.length ||
    order.some((key) => !expectedKeys.has(key));

  const updateAlternative = (index: number, order: string[]) => {
    onChange({
      ...value,
      acceptedOrders: value.acceptedOrders.map((current, currentIndex) =>
        currentIndex === index + 1 ? order : current,
      ),
    });
  };

  const addAlternative = () => {
    onChange({
      ...value,
      acceptedOrders: [
        ...value.acceptedOrders,
        [...primary],
      ],
    });
  };

  const removeAlternative = (index: number) => {
    onChange({
      ...value,
      acceptedOrders: value.acceptedOrders.filter(
        (_, currentIndex) => currentIndex !== index + 1,
      ),
    });
  };

  return (
    <section
      aria-labelledby="accepted-orders-heading"
      className="space-y-3 border-t-2 border-border pt-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3
            id="accepted-orders-heading"
            className="text-sm font-bold text-foreground"
          >
            Alternative accepted orders
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Add other valid arrangements. Drag items to reorder.
          </p>
        </div>

        <button
          type="button"
          onClick={addAlternative}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border-2 border-border bg-card px-3 text-xs font-bold text-primary transition hover:border-primary"
        >
          <Plus size={16} aria-hidden />
          Add alternative
        </button>
      </div>

      {alternatives.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-secondary/50 px-3 py-4 text-center text-xs text-muted-foreground">
          No alternative order. The primary order is the only accepted answer.
        </p>
      ) : (
        <div className="space-y-3">
          {alternatives.map((order, index) => (
            <AlternativeOrder
              key={index}
              index={index}
              order={order}
              contentByKey={contentByKey}
              primary={primary}
              needsReview={needsReview(order)}
              onUpdate={(next) => updateAlternative(index, next)}
              onRemove={() => removeAlternative(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
