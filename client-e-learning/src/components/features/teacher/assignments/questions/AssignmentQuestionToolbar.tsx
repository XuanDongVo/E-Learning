"use client";

import Link from "next/link";
import { Eye, Plus } from "lucide-react";

export function AssignmentQuestionToolbar({
  count,
  readyCount,
  locked,
  createHref,
  onPreview,
  previewDisabled,
}: {
  count: number;
  readyCount: number;
  locked: boolean;
  createHref: string;
  onPreview: () => void;
  previewDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-section-title font-bold">Questions</h2>
          <span className="text-body-sm text-muted-foreground">{count}/100</span>
        </div>
        <p className="mt-1 text-body-sm text-muted-foreground">
          {count === 0
            ? "Create questions for this assignment."
            : `${readyCount} ready · ${count - readyCount} incomplete`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          disabled={previewDisabled}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-bold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Eye className="size-4" />
          Preview
        </button>

        <Link
        href={createHref}
        aria-disabled={locked || count >= 100}
        tabIndex={locked || count >= 100 ? -1 : 0}
        className={`inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-body-sm font-bold text-primary-foreground ${
          locked || count >= 100
            ? "pointer-events-none cursor-not-allowed opacity-50"
            : "hover:bg-primary-hover"
        }`}
      >
        <Plus className="size-4" />
        Create questions
        </Link>
      </div>
    </div>
  );
}
