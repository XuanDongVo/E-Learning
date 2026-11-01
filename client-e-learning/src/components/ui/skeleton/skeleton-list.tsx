import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../skeleton";

interface SkeletonListProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
  itemClassName?: string;
}

export function SkeletonList({
  count = 5,
  className,
  itemClassName,
  ...props
}: SkeletonListProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải danh sách"
      aria-busy="true"
      className={cn("space-y-3", className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-4 rounded-xl border border-border bg-card p-4",
            itemClassName,
          )}
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}