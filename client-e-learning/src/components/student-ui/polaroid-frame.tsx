import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PolaroidFrame({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption: string;
  className?: string;
}) {
  return (
    <figure className={cn("student-polaroid", className)}>
      <div className="student-polaroid__media">{children}</div>
      <figcaption className="student-polaroid__caption">{caption}</figcaption>
    </figure>
  );
}
