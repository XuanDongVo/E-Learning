import type { LiHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type StudentDataListItemProps = Omit<LiHTMLAttributes<HTMLLIElement>, "children" | "content"> & {
  leading?: ReactNode;
  content: ReactNode;
  metadata?: ReactNode;
  trailing?: ReactNode;
  actions?: ReactNode;
};

export function StudentDataListItem({
  leading, content, metadata, trailing, actions, className, ...props
}: StudentDataListItemProps) {
  return (
    <li className={cn("min-w-0 transition-colors hover:bg-secondary/25 focus-within:bg-secondary/25", className)} {...props}>
      <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
        {leading != null && (
          <div className="hidden size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary/40 text-muted-foreground sm:flex">{leading}</div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          {content}
          {metadata != null && <div className="min-w-0">{metadata}</div>}
        </div>
        {(trailing != null || actions != null) && (
          <div className="flex min-w-0 items-center justify-between gap-3 sm:shrink-0 sm:justify-end sm:gap-4">
            {trailing != null && <div className="min-w-0 sm:text-right">{trailing}</div>}
            {actions != null && <div className="shrink-0">{actions}</div>}
          </div>
        )}
      </div>
    </li>
  );
}
