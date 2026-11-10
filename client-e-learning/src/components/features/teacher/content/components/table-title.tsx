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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 text-section-title font-bold text-foreground">
        {title} <small className="font-normal text-muted-foreground">({count})</small>
      </h2>

      <button type="button" className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-body-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" onClick={onAction}>
        <Plus size={14} />
        {action}
      </button>
    </div>
  );
}
