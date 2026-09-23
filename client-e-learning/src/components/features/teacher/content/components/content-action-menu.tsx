import { Check, Edit3, MoreHorizontal, Archive } from "lucide-react";
import type { ContentStatus } from "@/types/content";

interface ContentActionMenuProps {
  status: ContentStatus;
  onEdit: () => void;
  onStatusChange: (status: ContentStatus) => void;
  onArchive: () => void;
  pending?: boolean;
}

export function ContentActionMenu({
  status,
  onEdit,
  onStatusChange,
  onArchive,
  pending,
}: ContentActionMenuProps) {
  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary
        className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--neutral-muted)] transition hover:border-[var(--neutral-subtle)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30"
        aria-label="Open content actions"
      >
        <MoreHorizontal size={17} />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
        <button
          type="button"
          onClick={onEdit}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--neutral-dark)]/80 hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
        >
          <Edit3 size={15} /> Edit details
        </button>
        <div className="my-1 border-t border-[var(--border-color)]" />
        <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--neutral-subtle)]">
          Status
        </p>
        {(["DRAFT", "PUBLISHED"] as ContentStatus[]).map((nextStatus) => (
          <button
            key={nextStatus}
            type="button"
            disabled={pending || status === nextStatus}
            onClick={() => onStatusChange(nextStatus)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-[var(--neutral-dark)]/80 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:text-[var(--neutral-subtle)] disabled:hover:bg-transparent disabled:hover:text-[var(--neutral-subtle)]"
          >
            {nextStatus}
            {status === nextStatus && (
              <Check size={14} className="text-[var(--primary)]" />
            )}
          </button>
        ))}
        {status !== "ARCHIVED" && (
          <button
            type="button"
            disabled={pending}
            onClick={onArchive}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            <Archive size={15} /> Archive
          </button>
        )}
      </div>
    </details>
  );
}