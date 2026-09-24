"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "./badge";
import type { DraftQuestion } from "@/types/content";
import { isQuestionComplete } from "./question-form";

export function QuestionList({
  questions,
  activeDraftId,
  onSelect,
  onAddOne,
  onAddMany,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  questions: DraftQuestion[];
  activeDraftId: string;
  onSelect: (draftId: string) => void;
  onAddOne: () => void;
  onAddMany: (count: number) => void;
  onDuplicate: (draftId: string) => void;
  onMoveUp: (draftId: string) => void;
  onMoveDown: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}) {
  return (
    <aside className="flex min-h-0 h-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddOne}
            className="
              inline-flex flex-1 items-center justify-center gap-1.5
              rounded-lg bg-primary px-3 py-2
              text-xs font-semibold text-white
              transition-colors hover:bg-primary-hover
            "
          >
            <Plus size={14} />
            Add question
          </button>

          <button
            type="button"
            onClick={() => onAddMany(5)}
            className="
              shrink-0 rounded-lg
              border border-slate-200 bg-white
              px-2.5 py-2
              text-xs font-semibold text-slate-600
              transition-colors
              hover:border-primary/30
              hover:bg-primary-light
              hover:text-primary
            "
            title="Add 5 questions"
          >
            +5
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {questions.length} questions
          </span>

          <span className="text-[11px] text-slate-400">
            {questions.filter(isQuestionComplete).length} ready
          </span>
        </div>
      </div>

      {/* Scroll area */}
      <div
        className="
          min-h-0 flex-1 overflow-y-auto
          overscroll-contain
          [scrollbar-color:#CBD5E1_transparent]
          [scrollbar-width:thin]
        "
      >
        <ul className="divide-y divide-slate-100">
          {questions.map((question, index) => (
            <QuestionListItem
              key={question.draftId}
              index={index}
              question={question}
              isActive={question.draftId === activeDraftId}
              isFirst={index === 0}
              isLast={index === questions.length - 1}
              canDelete={questions.length > 1}
              onSelect={() => onSelect(question.draftId)}
              onDuplicate={() => onDuplicate(question.draftId)}
              onMoveUp={() => onMoveUp(question.draftId)}
              onMoveDown={() => onMoveDown(question.draftId)}
              onDelete={() => onDelete(question.draftId)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
}

function QuestionListItem({
  index,
  question,
  isActive,
  isFirst,
  isLast,
  canDelete,
  onSelect,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  index: number;
  question: DraftQuestion;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const itemRef = useRef<HTMLLIElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const complete = isQuestionComplete(question);

  // Auto-scroll active question into view
  useEffect(() => {
    if (!isActive) return;

    itemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [isActive]);

  // Close action menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen]);

  return (
    <li
      ref={itemRef}
      onClick={onSelect}
      className={`
        group relative
        flex min-h-[64px] cursor-pointer
        items-center gap-2.5
        px-3 py-2.5
        transition-colors
        ${
          isActive
            ? "bg-primary-light/60"
            : "bg-white hover:bg-slate-50"
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <span
          className="
            absolute inset-y-0 left-0 w-[3px]
            rounded-r-full bg-primary
          "
        />
      )}

      {/* Number */}
      <span
        className={`
          flex w-6 shrink-0 justify-center
          text-[11px] font-semibold tabular-nums
          ${
            isActive
              ? "text-primary"
              : "text-slate-400"
          }
        `}
      >
        {index + 1}
      </span>

      {/* Question content */}
      <div className="min-w-0 flex-1">
        <div
          className={`
            truncate text-xs leading-5
            ${
              isActive
                ? "font-semibold text-slate-800"
                : "font-medium text-slate-600"
            }
          `}
        >
          {question.text || (
            <span className="italic text-slate-300">
              Untitled question
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">
            {question.type === "SINGLE_CHOICE"
              ? "Single choice"
              : question.type === "MULTIPLE_CHOICE"
                ? "Multiple choice"
                : question.type === "TRUE_FALSE"
                  ? "True / False"
                  : question.type === "FILL_IN_BLANK"
                    ? "Fill in blank"
                    : "Type answer"}
          </span>

          {!complete && (
            <>
              <span className="text-slate-300">•</span>
              <Badge tone="gray">Draft</Badge>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        ref={menuRef}
        className="relative shrink-0"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Question actions"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className={`
            grid h-7 w-7 place-items-center
            rounded-md
            transition-all
            ${
              menuOpen
                ? "bg-slate-100 text-slate-600 opacity-100"
                : "text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
            }
          `}
        >
          <MoreVertical size={14} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="
              absolute right-0 top-full z-30 mt-1
              w-40 overflow-hidden
              rounded-lg
              border border-slate-200
              bg-white
              p-1
              shadow-[0_12px_30px_rgba(15,23,42,0.12)]
            "
          >
            <MenuItem
              icon={<Copy size={14} />}
              label="Duplicate"
              onClick={() => {
                setMenuOpen(false);
                onDuplicate();
              }}
            />

            <MenuItem
              icon={<ArrowUp size={14} />}
              label="Move up"
              disabled={isFirst}
              onClick={() => {
                setMenuOpen(false);
                onMoveUp();
              }}
            />

            <MenuItem
              icon={<ArrowDown size={14} />}
              label="Move down"
              disabled={isLast}
              onClick={() => {
                setMenuOpen(false);
                onMoveDown();
              }}
            />

            <div className="my-1 border-t border-slate-100" />

            <MenuItem
              icon={<Trash2 size={14} />}
              label="Delete"
              tone="danger"
              disabled={!canDelete}
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
            />
          </div>
        )}
      </div>
    </li>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex w-full items-center gap-2
        rounded-md px-2.5 py-2
        text-left text-xs font-medium
        transition-colors
        disabled:pointer-events-none
        disabled:opacity-30
        ${
          tone === "danger"
            ? "text-rose-600 hover:bg-rose-50"
            : "text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}