import { Check, MoreHorizontal, Archive } from "lucide-react";
import type { ContentStatus } from "@/types/content";

interface ContentActionMenuProps {
  status: ContentStatus;
  onEdit?: () => void;
  onStatusChange: (status: ContentStatus) => void;
  onArchive: () => void;
  pending?: boolean;
}

export function ContentActionMenu({
  status,
  onStatusChange,
  onArchive,
  pending,
}: ContentActionMenuProps) {
  return (
    <details className="relative" onClick={(event) => event.stopPropagation()}>
      <summary
        className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Open content actions"
      >
        <MoreHorizontal size={17} />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
        <p className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm font-semibold text-muted-foreground">
          Edit Status
        </p>
        <div className="my-1 border-t border-border" />
        {(["DRAFT", "PUBLISHED"] as ContentStatus[]).map((nextStatus) => (
          <button
            key={nextStatus}
            type="button"
            disabled={pending || status === nextStatus}
            onClick={() => onStatusChange(nextStatus)}
            className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-body-sm text-foreground hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60"
          >
            {nextStatus}
            {status === nextStatus && (
              <Check size={14} className="text-primary" />
            )}
          </button>
        ))}
        {status !== "ARCHIVED" && (
          <button
            type="button"
            disabled={pending}
            onClick={onArchive}
            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body-sm text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-50"
          >
            <Archive size={15} /> Archive
          </button>
        )}
      </div>
    </details>
  );
}
