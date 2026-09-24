"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function BulkSaveBar({
  total,
  validCount,
  isSaving,
  onSaveDraft,
  onSave,
}: {
  total: number;
  validCount: number;
  isSaving: boolean;
  onSaveDraft: () => void;
  onSave: () => void;
}) {
  const incompleteCount = total - validCount;

  return (
    <div className="sticky bottom-4 mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-body-sm">
        <span className="font-semibold text-slate-800">{total} questions</span>
        <span className="inline-flex items-center gap-1 text-emerald-600">
          <CheckCircle2 size={14} /> {validCount} ready
        </span>
        {incompleteCount > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <AlertTriangle size={14} /> {incompleteCount} incomplete
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={onSaveDraft}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-body-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={isSaving || validCount === 0}
          onClick={onSave}
          className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : `Save questions`}
        </button>
      </div>
    </div>
  );
}