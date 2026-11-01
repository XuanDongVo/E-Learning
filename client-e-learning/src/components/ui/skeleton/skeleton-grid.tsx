import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../skeleton";

type SkeletonGridVariant = "card" | "image-card";

interface SkeletonGridProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
  variant?: SkeletonGridVariant;
  itemClassName?: string;
}

export function SkeletonGrid({
  count = 6,
  variant = "card",
  className,
  itemClassName,
  ...props
}: SkeletonGridProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải danh sách"
      aria-busy="true"
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonGridItem
          key={index}
          variant={variant}
          className={itemClassName}
        />
      ))}

      <span className="sr-only">Đang tải dữ liệu...</span>
    </div>
  );
}

function SkeletonGridItem({
  variant,
  className,
}: {
  variant: SkeletonGridVariant;
  className?: string;
}) {
  if (variant === "image-card") {
    return (
      <div
        className={cn(
          "flex h-80 flex-col rounded-3xl border border-border bg-card p-4",
          className,
        )}
      >
        <Skeleton className="h-36 w-full rounded-2xl" />

        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <Skeleton className="mt-auto h-11 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5",
        className,
      )}
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />

        <div className="pt-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}