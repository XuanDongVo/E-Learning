import { Plus } from "lucide-react";
import { ContentToolbarProps } from "@/types/content";

export function ContentToolbar({
  title,
  description,
  action,
  onAction,
  children,
}: ContentToolbarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="mb-1.5 text-page-title font-bold tracking-[-0.4px] text-slate-900">{title}</h1>

        {description && <p className="text-body-sm text-slate-400">{description}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}

        {action && (
          <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-body-sm sm:text-section-text font-bold text-white shadow-[0_5px_12px_rgba(79,70,229,0.18)] hover:bg-primary-hover" onClick={onAction}>
            <Plus size={15} />
            {action}
          </button>
        )}
      </div>
    </div>
  );
}
