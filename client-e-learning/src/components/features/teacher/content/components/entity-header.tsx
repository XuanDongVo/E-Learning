import { Edit3, MoreHorizontal } from "lucide-react";
import type { ContentTone } from "@/types/content";

import { Badge } from "./badge";
import { IconTile } from "./icon-tile";

interface EntityHeaderProps {
  title: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  tone?: ContentTone;
  editLabel: string;
  onEdit?: () => void;
}

export function EntityHeader({
  title,
  label,
  description,
  icon,
  tone = "violet",
  editLabel,
  onEdit,
}: EntityHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <IconTile tone={tone}>{icon}</IconTile>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="m-0 truncate text-section-title font-bold text-slate-900">{title}</h1>
          <Badge>{label}</Badge>
        </div>

        <p className="mt-1.5 text-body-sm text-slate-400">{description}</p>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-caption text-primary sm:flex-none" onClick={onEdit}>
          <Edit3 size={14} />
          {editLabel}
        </button>

        <button className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-500">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}