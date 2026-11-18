import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type StudentDataListProps = HTMLAttributes<HTMLUListElement> & {
  density?: "compact" | "comfortable";
};

export function StudentDataList({
  density = "compact",
  className,
  children,
  ...props
}: StudentDataListProps) {
  return (
    <ul
      className={cn(
        "divide-y divide-border/70 overflow-hidden rounded-xl border border-border/75 bg-card/70",
        density === "compact"
          ? "[&>li]:px-3 [&>li]:py-3 sm:[&>li]:px-4"
          : "[&>li]:px-3 [&>li]:py-4 sm:[&>li]:px-5",
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
}
