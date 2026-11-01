import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../skeleton";

interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  rowClassName?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  showHeader = true,
  className,
  rowClassName,
  ...props
}: SkeletonTableProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải bảng dữ liệu"
      aria-busy="true"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
      {...props}
    >
      {showHeader && (
        <div
          className="grid items-center gap-4 border-b border-border bg-muted/30 px-4 py-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-3/4" />
          ))}
        </div>
      )}

      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "grid items-center gap-4 px-4 py-4",
              rowClassName,
            )}
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={cn(
                  "h-4",
                  columnIndex === 0 ? "w-3/4" : "w-1/2",
                )}
              />
            ))}
          </div>
        ))}
      </div>

      <span className="sr-only">Đang tải dữ liệu...</span>
    </div>
  );
}