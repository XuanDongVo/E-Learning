import { Plus } from "lucide-react";

interface TableTitleProps {
  title: string;
  count: string | number;
  action: string;
  onAction: () => void;
}

export function TableTitle({
  title,
  count,
  action,
  onAction,
}: TableTitleProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="m-0 text-card-title font-bold text-slate-900">
        {title} <small className="font-normal text-slate-400">({count})</small>
      </h2>

      <button className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-2 text-caption font-bold text-white hover:bg-primary-hover" onClick={onAction}>
        <Plus size={14} />
        {action}
      </button>
    </div>
  );
}