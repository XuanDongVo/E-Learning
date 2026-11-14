"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, CheckCircle2, Copy, MoreVertical, Plus, Trash2 } from "lucide-react";

import type { DraftQuestion } from "@/types/question";
import { isQuestionComplete } from "./question-validator";
import type { SemanticTone } from "@/types/theme";

export function QuestionList({
  questions,
  activeDraftId,
  showValidation,
  onSelect,
  onAddOne,
  onAddMany,
  onDuplicate,
  onDelete,
}: {
  questions: DraftQuestion[];
  activeDraftId: string;
  onSelect: (draftId: string) => void;
  showValidation: boolean;
  onAddOne: () => void;
  onAddMany: (count: number) => void;
  onDuplicate: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-b-2 border-r-2 border-border bg-card">
      {/* Header */}
      <div className="shrink-0 border-b-2 border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddOne}
            className="
              inline-flex flex-1 items-center justify-center gap-1.5
              rounded-lg border-2 border-primary bg-primary px-3 py-2
              text-body-sm font-bold text-primary-foreground shadow-pop-sm
              transition hover:bg-primary-hover hover:border-primary-hover
            "
          >
            <Plus size={15} />
            Add question
          </button>

          <button
            type="button"
            onClick={() => onAddMany(5)}
            className="
              shrink-0 rounded-lg
              border-2 border-border bg-card
              px-2.5 py-2
              text-body-sm font-bold text-foreground shadow-pop-sm
              transition
              hover:border-primary hover:bg-primary-soft hover:text-primary
            "
            title="Add 5 questions"
          >
            +5
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between px-0.5">
          <span className="text-body-sm font-bold text-muted-foreground">
            {questions.length} questions
          </span>

          <span className="text-body-sm font-semibold text-muted-foreground">
            {questions.filter(isQuestionComplete).length} ready
          </span>
        </div>
      </div>

      {/* Scroll area */}
      <div
        className="
          min-h-0 flex-1 overflow-y-auto
          overscroll-contain
        "
      >
        <ul className="border-b-2 border-border">
          {questions.map((question, index) => (
            <QuestionListItem
              key={question.draftId}
              index={index}
              question={question}
              isActive={question.draftId === activeDraftId}
              showValidation={showValidation}
              canDelete={questions.length > 1}
              onSelect={() => onSelect(question.draftId)}
              onDuplicate={() => onDuplicate(question.draftId)}
              onDelete={() => onDelete(question.draftId)}
            />
          ))}
        </ul>
      </div>

      {/* Bottom Footer Border Bar */}
      <div className="shrink-0 border-t-2 border-border bg-secondary px-3 py-2 text-center text-body-sm font-bold text-muted-foreground">
        End of questions list
      </div>
    </aside>
  );
}

function QuestionListItem({
  index,
  question,
  isActive,
  canDelete,
  onSelect,
  onDuplicate,
  onDelete,
  showValidation,
}: {
  index: number;
  question: DraftQuestion;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  showValidation: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const itemRef = useRef<HTMLLIElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const complete = isQuestionComplete(question);
  const showError = showValidation && !complete;

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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
      className={`group relative flex min-h-[68px] cursor-pointer items-center gap-2.5 border-b-2 border-l-4 px-3 py-2.5 transition ${
        showError
          ? "border-b-destructive/30 border-l-destructive bg-destructive-soft hover:bg-destructive-soft"
          : isActive
            ? "border-b-border border-l-primary bg-primary-soft hover:bg-primary-soft"
            : "border-b-border border-l-transparent bg-card hover:bg-secondary"
      }`}
    >
      {/* Number */}
      <span
        className={`flex w-6 shrink-0 justify-center text-xs font-bold tabular-nums ${
          isActive
            ? "text-primary"
            : "text-muted-foreground"
        }`}
      >
        {index + 1}
      </span>

      {/* Question content */}
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-xs leading-5 ${
            isActive
              ? "font-bold text-foreground"
              : "font-semibold text-foreground"
          }`}
        >
          {question.text || (
            <span className="italic text-muted-foreground">Untitled question</span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-body-sm font-medium text-muted-foreground">
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
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
                Incomplete
              </span>
            </>
          )}
          {question.guidedDefinition?.enabled && (
            <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary">
              <Brain size={12} aria-hidden /> Guided ({question.guidedDefinition.steps.length})
            </span>
          )}
          {complete && (
            <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-success">
              <CheckCircle2 size={12} aria-hidden /> Ready
            </span>
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
          className={`grid h-7 w-7 place-items-center rounded-md border-2 border-transparent transition-all ${
            menuOpen
              ? "border-slate-300 bg-slate-200 text-slate-800 opacity-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              : "text-slate-400 opacity-0 group-hover:opacity-100 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <MoreVertical size={15} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="
              absolute right-0 top-full z-30 mt-1
              w-40 overflow-hidden
              rounded-lg border-2 border-slate-300
              bg-white p-1 shadow-none
              dark:border-slate-600 dark:bg-slate-900
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

            <div className="my-1 border-t-2 border-slate-200 dark:border-slate-700" />

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
  tone?: Extract<SemanticTone, "default" | "danger">;
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
        text-left text-xs font-bold
        transition-colors
        disabled:pointer-events-none
        disabled:opacity-30
        ${
          tone === "danger"
            ? "text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
