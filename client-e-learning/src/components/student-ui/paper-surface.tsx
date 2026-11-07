import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaperSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  variant?: "plain" | "lined" | "kraft";
  tape?: boolean;
  children: ReactNode;
};

/** Reusable Student-only surface without changing the shared Teacher Card. */
export function PaperSurface({
  as: Element = "div",
  variant = "plain",
  tape = false,
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
      {...props}
    >
      {tape && <span aria-hidden="true" className="student-washi" />}
      {children}
    </Element>
  );
}
