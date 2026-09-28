"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function BulkSaveBar({
  total,
  validCount,
  isSaving,
  onSave,
}: {
  total: number;
  validCount: number;
  isSaving: boolean;
  onSave: () => void;
}) {
  const incompleteCount = total - validCount;
  const isAllValid = total > 0 && validCount === total;

  return (
    <div className="sticky bottom-4 mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-body-sm">
        <span className="font-semibold text-slate-800">{total} questions</span>
        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
          <CheckCircle2 size={14} /> {validCount} ready
        </span>
        {incompleteCount > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
            <AlertTriangle size={14} /> {incompleteCount} incomplete
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isSaving || !isAllValid}
          onClick={onSave}
          title={!isAllValid ? "Please complete all questions before saving to server" : undefined}
          className="rounded-lg bg-primary px-5 py-2 text-body-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Saving to Server..."
            : isAllValid
            ? `Save ${total} Questions`
            : `Complete all questions to save (${validCount}/${total})`}
        </button>
      </div>
    </div>
  );
}