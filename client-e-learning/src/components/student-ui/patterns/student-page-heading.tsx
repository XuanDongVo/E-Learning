import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

/**
 * The shared information hierarchy of a Student page, not a fixed hero layout.
 * Place it inside a page-specific PaperSurface (or use it without a surface).
 * A single H1 remains prominent; optional artwork is chosen by the page.
 */
export function StudentPageHeading({
  eyebrow,
  title,
  description,
  artwork,
  actions,
  className,
  contentClassName,
  artworkClassName,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  artwork?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  artworkClassName?: string;
}) {
  return (
    <div className={cn("flex w-full min-w-0 items-center justify-between gap-4", className)}>
      <div className={cn("min-w-0 flex-1 space-y-2", contentClassName)}>
        {eyebrow != null && <p className="student-meta text-primary">{eyebrow}</p>}
        <ScrapbookHeading as="h1" className="student-page-title text-foreground">
          {title}
        </ScrapbookHeading>
        {description != null && (
          <p className="student-body max-w-prose text-muted-foreground">{description}</p>
        )}
        {actions != null && (
          <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>
        )}
      </div>
      {artwork != null && (
        <div className={cn("shrink-0", artworkClassName)}>{artwork}</div>
      )}
    </div>
  );
}
