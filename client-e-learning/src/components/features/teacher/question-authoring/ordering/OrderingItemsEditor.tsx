"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type {
  OrderingDraftDefinition,
  OrderingItemDraft,
} from "@/types/question";

import {
  makeOrderingItem,
  synchronizeOrderingDefinition,
} from "./ordering-draft";
import { orderingContentLimit } from "./ordering-validation";

const fieldClass =
  "w-full min-w-0 rounded-lg border-2 border-border " +
  "bg-card py-2.5 pl-3 pr-16 text-sm text-foreground " +
  "outline-none transition placeholder:text-muted-foreground " +
  "focus:border-primary focus:ring-0";

type EditorProps = {
  value: OrderingDraftDefinition;
  onChange: (value: OrderingDraftDefinition) => void;
};

type SortableItemProps = {
  item: OrderingItemDraft;
  index: number;
  total: number;
  subtype: OrderingDraftDefinition["subtype"];
  limit: number;
  onContentChange: (key: string, content: string) => void;
  onEnter: (index: number) => void;
  onRemove: (item: OrderingItemDraft) => void;
  registerInput: (
    key: string,
    element: HTMLInputElement | HTMLTextAreaElement | null,
  ) => void;
};

function SortableOrderingItem({
  item,
  index,
  total,
  subtype,
  limit,
  onContentChange,
  onEnter,
  onRemove,
  registerInput,
}: SortableItemProps) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.key,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 20 : undefined,
    position: "relative",
  };

  const isSentence = subtype === "SENTENCE";
  const showCount =
    focused || item.content.length >= limit * 0.8;

  const placeholder =
    subtype === "WORD"
      ? "Enter a word"
      : subtype === "PHRASE"
        ? "Enter a phrase"
        : "Enter a sentence";

  // Auto-resize for SENTENCE only.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [item.content, isSentence]);

  const commonInputProps = {
    value: item.content,
    maxLength: limit,
    placeholder,
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >,
    ) => onContentChange(item.key, event.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className: fieldClass,
    "aria-label": `Item ${index + 1}`,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        "flex items-start gap-2 rounded-xl border-2",
        "bg-card p-2.5 transition-colors",
        isDragging
          ? "border-primary shadow-lg"
          : "border-border",
      ].join(" ")}
    >
      {/* Drag handle — only this element activates drag */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Drag item ${index + 1} to reorder`}
        className={[
          "mt-0.5 flex size-10 shrink-0",
          "touch-none cursor-grab items-center justify-center",
          "rounded-lg text-muted-foreground",
          "hover:bg-secondary hover:text-foreground",
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-primary",
          "active:cursor-grabbing",
        ].join(" ")}
      >
        <GripVertical size={20} aria-hidden />
      </button>

      {/* Automatically numbered */}
      <span
        className={[
          "mt-1 grid size-8 shrink-0 place-items-center",
          "rounded-lg bg-secondary",
          "text-xs font-bold tabular-nums text-foreground",
        ].join(" ")}
        aria-hidden
      >
        {index + 1}
      </span>

      {/* Input area */}
      <div className="relative min-w-0 flex-1">
        {isSentence ? (
          <textarea
            {...commonInputProps}
            ref={(el) => {
              textareaRef.current = el;
              registerInput(item.key, el);
            }}
            rows={2}
            onKeyDown={(event) => {
              // Enter = newline for SENTENCE.
              // Ctrl/Cmd + Enter = next item.
              if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
              ) {
                event.preventDefault();
                onEnter(index);
              }
            }}
            className={`${fieldClass} resize-none overflow-hidden`}
          />
        ) : (
          <input
            {...commonInputProps}
            ref={(el) => registerInput(item.key, el)}
            type="text"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onEnter(index);
              }
            }}
          />
        )}

        {/* Inline character counter */}
        {showCount && (
          <span
            className={[
              "pointer-events-none absolute bottom-3 right-3",
              "text-[10px] tabular-nums",
              item.content.length >= limit
                ? "font-semibold text-destructive"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {item.content.length}/{limit}
          </span>
        )}
      </div>

      {/* Delete — one action only */}
      <button
        type="button"
        disabled={total <= 3}
        onClick={() => onRemove(item)}
        aria-label={`Delete item ${index + 1}`}
        className={[
          "mt-0.5 flex size-10 shrink-0",
          "items-center justify-center rounded-lg",
          "text-muted-foreground transition-colors",
          "hover:bg-destructive-soft",
          "hover:text-destructive",
          "focus-visible:outline-2",
          "focus-visible:outline-primary",
          "disabled:cursor-not-allowed",
          "disabled:opacity-30",
        ].join(" ")}
      >
        <Trash2 size={17} aria-hidden />
      </button>
    </li>
  );
}

export function OrderingItemsEditor({
  value,
  onChange,
}: EditorProps) {
  const inputRefs = useRef(
    new Map<
      string,
      HTMLInputElement | HTMLTextAreaElement
    >(),
  );

  const pendingFocusKey = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const limit = orderingContentLimit(value.subtype);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      // Immediate drag from handle on touch screens.
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateItems = (items: OrderingItemDraft[]) => {
    onChange(synchronizeOrderingDefinition(value, items));
  };

  const registerInput = (
    key: string,
    element: HTMLInputElement | HTMLTextAreaElement | null,
  ) => {
    if (element) {
      inputRefs.current.set(key, element);
    } else {
      inputRefs.current.delete(key);
    }
  };

  // Focus newly created item after React renders it.
  useEffect(() => {
    const key = pendingFocusKey.current;
    if (!key) return;

    const input = inputRefs.current.get(key);

    if (input) {
      input.focus();
      pendingFocusKey.current = null;
    }
  }, [value.items]);

  const addItem = (afterIndex?: number) => {
    if (value.items.length >= 8) {
      // At the limit, focus the next existing field if available.
      if (afterIndex !== undefined) {
        const next = value.items[afterIndex + 1];
        if (next) inputRefs.current.get(next.key)?.focus();
      }
      return;
    }

    const newItem = makeOrderingItem();
    pendingFocusKey.current = newItem.key;

    const items = [...value.items];

    if (afterIndex === undefined) {
      items.push(newItem);
    } else {
      items.splice(afterIndex + 1, 0, newItem);
    }

    updateItems(items);
  };

  const updateContent = (key: string, content: string) => {
    updateItems(
      value.items.map((item) =>
        item.key === key ? { ...item, content } : item,
      ),
    );
  };

  const removeItem = (item: OrderingItemDraft) => {
    if (value.items.length <= 3) return;

    if (
      value.acceptedOrders.length > 1 &&
      !window.confirm(
        "Removing this item will mark alternative accepted orders as needing review. Continue?",
      )
    ) {
      return;
    }

    updateItems(
      value.items.filter((current) => current.key !== item.key),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = value.items.findIndex(
      (item) => item.key === active.id,
    );
    const newIndex = value.items.findIndex(
      (item) => item.key === over.id,
    );

    if (oldIndex < 0 || newIndex < 0) return;

    updateItems(arrayMove(value.items, oldIndex, newIndex));
  };

  return (
    <section
      aria-labelledby="ordering-items-heading"
      className="space-y-3"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3
            id="ordering-items-heading"
            className="text-sm font-bold text-foreground"
          >
            Items and primary answer
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Drag items to define the correct order.
            Use 3–8 items.
          </p>
        </div>

        <button
          type="button"
          disabled={value.items.length >= 8}
          onClick={() => addItem()}
          className={[
            "inline-flex min-h-10 items-center gap-1.5",
            "rounded-lg border-2 border-border",
            "bg-card px-3 text-xs font-bold text-primary",
            "transition hover:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-40",
          ].join(" ")}
        >
          <Plus size={16} aria-hidden />
          Add item
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={value.items.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          <ol
            className="space-y-2.5"
            aria-label="Ordering answer items"
            aria-describedby="ordering-sort-help"
          >
            {value.items.map((item, index) => (
              <SortableOrderingItem
                key={item.key}
                item={item}
                index={index}
                total={value.items.length}
                subtype={value.subtype}
                limit={limit}
                onContentChange={updateContent}
                onEnter={addItem}
                onRemove={removeItem}
                registerInput={registerInput}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <p
        id="ordering-sort-help"
        className="text-xs text-muted-foreground"
      >
        Drag using the handle. Keyboard: focus the handle,
        press Space to pick up, arrow keys to move,
        and Space to drop.
        {value.subtype === "SENTENCE"
          ? " Ctrl+Enter adds the next item."
          : " Enter adds the next item."}
      </p>

      <span className="sr-only" aria-live="polite">
        {activeId ? "Reordering item" : ""}
      </span>
    </section>
  );
}