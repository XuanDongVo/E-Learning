import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

export interface StudentPageHeadingProps {
  eyebrow?: ReactNode;
  titleId?: string;
  /** h1 uses a marker highlight by default; nested headings use no accent. */
  highlight?: "marker" | "underline" | "none";
  title: ReactNode;
  description?: ReactNode;
  artwork?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  artworkClassName?: string;
  /** Use h1 for a page title; h2/h3 for nested sections and Design Lab previews. */
  as?: "h1" | "h2" | "h3";
}

/**
 * Shared Student page introduction — not a fixed hero or a paper surface.
 *
 * Keeps content readable without artwork, allows any feature-owned actions,
 * and adapts naturally to narrow screens. The parent chooses whether to use
 * PaperSurface, a scene illustration, Pipo, or no decoration at all.
 */
export function StudentPageHeading({
  eyebrow,
  titleId,
  highlight,
  title,
  description,
  artwork,
  actions,
  className,
  contentClassName,
  artworkClassName,
  as: Heading = "h1",
}: StudentPageHeadingProps) {
  return (
    <div
      data-heading-level={Heading}
      data-highlight={highlight ?? (Heading === "h1" ? "marker" : "none")}
      data-has-artwork={artwork != null || undefined}
      className={cn(
        "student-page-heading flex w-full min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-6",
        className,
      )}
    >
      <div
        className={cn(
          "student-page-heading__content min-w-0 w-full flex-1 space-y-3",
          contentClassName,
        )}
      >
        {eyebrow != null && (
          <p className="student-page-heading__eyebrow student-meta text-primary">
            {eyebrow}
          </p>
        )}
        <ScrapbookHeading
          id={titleId}
          as={Heading}
          className="student-page-heading__title student-page-title text-foreground"
        >
          <span className="student-page-heading__highlight">{title}</span>
        </ScrapbookHeading>
        {description != null && (
          <p className="student-page-heading__description student-body max-w-prose text-muted-foreground">
            {description}
          </p>
        )}
        {actions != null && (
          <div className="student-page-heading__actions flex min-w-0 flex-wrap items-center gap-2 pt-1">
            {actions}
          </div>
        )}
      </div>

      {artwork != null && (
        <div
          className={cn(
            "student-page-heading__artwork relative min-w-0 max-w-full shrink-0 self-center sm:self-center",
            artworkClassName,
          )}
        >
          {artwork}
        </div>
      )}
    </div>
  );
}
