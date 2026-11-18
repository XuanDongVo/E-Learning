import type { ReactNode } from "react";
import { RegionState } from "@/components/feedback";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { cn } from "@/lib/utils";

type EmptyIllustration = "illustration.no-results" | "illustration.no-lessons";

/**
 * A truthful state composed from the existing shared RegionState.
 * Text and recovery actions remain useful when the decoration is hidden.
 */
export function StudentCollectionEmptyState({
  title,
  description,
  action,
  illustration = "illustration.no-results",
  minHeight,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: EmptyIllustration | null;
  minHeight?: number | string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {illustration && (
        <StudentIllustration
          id={illustration}
          decorative
          className="mx-auto w-28 sm:w-36"
        />
      )}
      <RegionState
        variant="empty"
        title={title}
        description={description}
        action={action}
        minHeight={minHeight}
      />
    </div>
  );
}
