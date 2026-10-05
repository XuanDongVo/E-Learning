"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { AssignmentQuestion } from "@/types/assignment";

export function AssignmentQuestionItem({
  item,
  active,
  questionNumber,
  locked,
  onSelect,
  onDelete,
}: {
  item: AssignmentQuestion;
  active: boolean;
  questionNumber: number;
  locked: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const complete =
    item.question.complete || item.question.is_complete === true;

  return (
    <li
      className={`border-b border-slate-100 last:border-b-0 ${
        active ? "bg-primary-light/50" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span className="flex size-7 shrink-0 items-center justify-center text-xs font-bold tabular-nums text-muted-foreground">
            {questionNumber}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-body-sm font-semibold text-foreground">
              {item.question.content || "Untitled question"}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>{formatQuestionType(item.question.type)}</span>
              <span>·</span>
              <span>{item.question.difficulty}</span>
              <span>·</span>
              <span className={complete ? "text-emerald-600" : "text-amber-600"}>
                {complete ? "Ready" : "Incomplete"}
              </span>
            </span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onSelect}
            disabled={locked}
            aria-label="Edit question"
            className="grid size-7 place-items-center text-muted-foreground hover:bg-muted disabled:opacity-30"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={locked}
            aria-label="Delete question"
            className="grid size-7 place-items-center text-rose-500 hover:bg-rose-50 disabled:opacity-30"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

function formatQuestionType(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
