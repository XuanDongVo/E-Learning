"use client";

import { Plus, Upload } from "lucide-react";

export function AssignmentQuestionToolbar({
  count,
  readyCount,
  locked,
  onAdd,
  onImport,
}: {
  count: number;
  readyCount: number;
  locked: boolean;
  onAdd: () => void;
  onImport: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-section-title font-bold">Questions</h2>
          <span className="text-body-sm text-muted-foreground">
            {count}/100
          </span>
        </div>

        <p className="mt-1 text-body-sm text-muted-foreground">
          {count === 0
            ? "Add questions manually or import them from the official Excel template."
            : `${readyCount} ready · ${count - readyCount} incomplete`}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onImport}
          disabled={locked}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="size-4" />
          Import Excel
        </button>

        <button
          type="button"
          onClick={onAdd}
          disabled={locked || count >= 100}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-body-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" />
          Add manually
        </button>
      </div>
    </div>
  );
}
