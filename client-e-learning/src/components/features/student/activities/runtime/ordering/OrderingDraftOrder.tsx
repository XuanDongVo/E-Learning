
"use client";

import { GripVertical, X } from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type {
  RuntimeOrdering,
  RuntimeOrderingItem,
} from "./ordering-types";

type Props = {
  ordering: RuntimeOrdering;
  items: RuntimeOrderingItem[];
  describedBy?: string;
  disabled?: boolean;
  onReorder: (nextKeys: string[]) => void;
  onRemove: (key: string) => void;
};

type SortablePieceProps = {
  item: RuntimeOrderingItem;
  index: number;
  sentenceLayout: boolean;
  disabled: boolean;
  onRemove: (key: string) => void;
};

function SortablePiece({
  item,
  index,
  sentenceLayout,
  disabled,
  onRemove,
}: SortablePieceProps) {
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
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.9 : 1,
        zIndex: isDragging ? 20 : undefined,
        position: "relative",
      }}
      className={[
        "group flex min-w-0 items-center gap-1.5",
        "rounded-xl border-2 bg-card-bg",
        "transition-[border-color,box-shadow,background-color]",
        "duration-150",
        sentenceLayout
          ? "w-full px-1 py-1.5 sm:px-2 sm:py-2.5"
          : "max-w-full px-1.5 py-1.5",
        isDragging
          ? "border-primary bg-primary-soft shadow-pop"
          : "border-border shadow-sm",
      ].join(" ")}
    >
      {/* Drag handle */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={`Kéo mảnh ${index + 1}: ${item.content}`}
        className={[
          "flex size-11 shrink-0 items-center justify-center",
          "touch-none cursor-grab rounded-lg",
          "text-muted-foreground",
          "hover:bg-secondary hover:text-foreground",
          "active:cursor-grabbing",
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-primary",
          "disabled:cursor-not-allowed",
        ].join(" ")}
      >
        <GripVertical size={19} aria-hidden="true" />
      </button>

      {/* Content */}
      <span
        className={[
          "student-body min-w-0 flex-1 break-words",
          "font-semibold leading-relaxed text-foreground",
          sentenceLayout ? "py-1" : "px-0.5",
        ].join(" ")}
      >
        {item.content}
      </span>

      {/* Remove / return to pool */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRemove(item.key)}
        aria-label={`Trả mảnh ${index + 1} về danh sách`}
        className={[
          "flex size-11 shrink-0 items-center justify-center",
          "rounded-lg text-muted-foreground",
          "hover:bg-destructive-soft hover:text-destructive",
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-primary",
          "disabled:cursor-not-allowed",
          "disabled:opacity-40",
        ].join(" ")}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

export function OrderingDraftOrder({
  ordering,
  items,
  describedBy,
  disabled = false,
  onReorder,
  onRemove,
}: Props) {
  const sentenceLayout = ordering.subtype === "SENTENCE";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (disabled || !over || active.id === over.id) return;

    const oldIndex = items.findIndex(
      (item) => item.key === active.id,
    );

    const newIndex = items.findIndex(
      (item) => item.key === over.id,
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(
      items,
      oldIndex,
      newIndex,
    );

    onReorder(reordered.map((item) => item.key));
  };

  if (items.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.key)}
        strategy={
          sentenceLayout
            ? verticalListSortingStrategy
            : rectSortingStrategy
        }
      >
        <ol
          aria-label="Thứ tự câu trả lời"
          aria-describedby={describedBy}
          className={
            sentenceLayout
              ? "grid min-w-0 gap-2"
              : "flex min-w-0 flex-wrap content-start gap-2"
          }
        >
          {items.map((item, index) => (
            <SortablePiece
              key={item.key}
              item={item}
              index={index}
              sentenceLayout={sentenceLayout}
              disabled={disabled}
              onRemove={onRemove}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
