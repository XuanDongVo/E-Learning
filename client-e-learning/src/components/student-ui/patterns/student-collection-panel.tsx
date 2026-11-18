import type { ReactNode } from "react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { cn } from "@/lib/utils";

/**
 * Collection composition only: the caller owns data, search, filters,
 * query state, pagination and list/grid choice.
 * Its toolbar can contain unrelated controls; no shared domain state is implied.
 */
export function StudentCollectionPanel({
  toolbar,
  children,
  footer,
  separator = true,
  ariaLive = "off",
  className,
  resultClassName,
}: {
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  separator?: boolean;
  ariaLive?: "polite" | "off";
  className?: string;
  resultClassName?: string;
}) {
  return (
    <PaperSurface as="section" className={cn("space-y-4 p-4 sm:p-5", className)}>
      {toolbar != null && <div className="space-y-4">{toolbar}</div>}
      <div
        aria-live={ariaLive}
        className={cn(
          "min-w-0 space-y-3",
          toolbar != null && separator && "border-t border-dashed border-border pt-4",
          resultClassName,
        )}
      >
        {children}
      </div>
      {footer != null && <div>{footer}</div>}
    </PaperSurface>
  );
}
