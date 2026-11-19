import type { ComponentProps, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Back navigation belongs to the page's real hierarchy, not browser history. */
export function StudentBackLink({
  href,
  children,
  className,
}: {
  href: ComponentProps<typeof Link>["href"];
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "student-label inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
