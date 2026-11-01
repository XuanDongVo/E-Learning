import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../skeleton";

interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export function SkeletonCard({
  showHeader = true,
  showFooter = false,
  lines = 3,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải nội dung"
      aria-busy="true"
      className={cn(
        "rounded-2xl border border-border bg-card p-5",
        className,
      )}
      {...props}
    >
      {showHeader && (
        <div className="mb-5 flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-xl" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              "h-4",
              index === lines - 1 ? "w-2/3" : "w-full",
            )}
          />
        ))}
      </div>

      {showFooter && (
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      )}
    </div>
  );
}