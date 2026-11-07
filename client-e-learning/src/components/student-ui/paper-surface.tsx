import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaperSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  variant?: "plain" | "lined" | "kraft";
  tape?: boolean;
  tapePosition?: "left" | "center" | "right";
  interactive?: boolean;
  children: ReactNode;
};

/** Reusable Student-only surface without changing the shared Teacher Card. */
export function PaperSurface({
  as: Element = "div",
  variant = "plain",
  tape = false,
  tapePosition = "left",
  interactive = false,
  className,
  children,
  ...props
}: PaperSurfaceProps) {
  return (
    <Element
      className={cn(
        "student-paper",
        variant === "lined" && "student-paper--lined",
        variant === "kraft" && "student-paper--kraft",
        className,
      )}
      data-interactive={interactive || undefined}
      {...props}
    >
      {tape && (
        <span
          aria-hidden="true"
          className={cn(
            "student-washi",
            tapePosition === "center" && "student-washi--center",
            tapePosition === "right" && "student-washi--right",
          )}
        />
      )}
      {children}
    </Element>
  );
}
