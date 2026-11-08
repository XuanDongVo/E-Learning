import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function ScrapbookHeading({
  as: Heading = "h2",
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }) {
  return <Heading className={cn("student-handwriting", className)} {...props} />;
}
