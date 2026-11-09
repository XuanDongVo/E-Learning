import { Edit3 } from "lucide-react";
import type { ContentStatus, ContentTone } from "@/types/content";

import { Badge } from "./badge";
import { IconTile } from "./icon-tile";
import { ContentActionMenu } from "./content-action-menu";

interface EntityHeaderProps {
  title: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  tone?: ContentTone;
  editLabel: string;
  onEdit?: () => void;
  status?: ContentStatus;
  onStatusChange?: (status: ContentStatus) => void;
  onArchive?: () => void;
  actionPending?: boolean;
  context?: React.ReactNode;
}

export function EntityHeader({
  title,
  label,
  description,
  icon,
  tone = "violet",
  editLabel,
  onEdit,
  status,
  onStatusChange,
  onArchive,
  actionPending,
  context,
}: EntityHeaderProps) {
  return (
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between rounded-lg border border-2 border-ink shadow-pop bg-card shadow-sm">
      <IconTile tone={tone}>{icon}</IconTile>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="m-0 min-w-0 break-words text-page-title font-bold text-foreground">
            {title}
          </h1>
          <Badge>{label}</Badge>
          {status && (
            <Badge tone={status === "PUBLISHED" ? "green" : "gray"}>
              {status}
            </Badge>
          )}
        </div>

        <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">
          {description}
        </p>
        {context && (
          <div className="mt-1.5 text-sm font-semibold text-muted-foreground">
            {context}
          </div>
        )}
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
        <button
          type="button"
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-none"
          onClick={onEdit}
        >
          <Edit3 size={14} />
          {editLabel}
        </button>

        {status && onStatusChange && onArchive && (
          <ContentActionMenu
            status={status}
            onEdit={onEdit ?? (() => undefined)}
            onStatusChange={onStatusChange}
            onArchive={onArchive}
            pending={actionPending}
          />
        )}
      </div>
    </div>
  );
}
