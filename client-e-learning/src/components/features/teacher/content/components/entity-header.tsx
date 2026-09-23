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
}: EntityHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <IconTile tone={tone}>{icon}</IconTile>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="m-0 truncate text-section-title font-bold text-slate-900">{title}</h1>
          <Badge>{label}</Badge>
          {status && <Badge tone={status === "PUBLISHED" ? "green" : "gray"}>{status}</Badge>}
        </div>

        <p className="mt-1.5 text-body-sm text-slate-400">{description}</p>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-body-sm text-primary transition hover:border-primary sm:flex-none" onClick={onEdit}>
          <Edit3 size={14} />
          {editLabel}
        </button>

        {status && onStatusChange && onArchive && <ContentActionMenu status={status} onEdit={onEdit ?? (() => undefined)} onStatusChange={onStatusChange} onArchive={onArchive} pending={actionPending} />}
      </div>
    </div>
  );
}