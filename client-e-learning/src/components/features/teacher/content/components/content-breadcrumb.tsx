import { ChevronRight } from "lucide-react";

import { Link } from "@/i18n/navigation";

type ContentBreadcrumbItem = {
  label: string;
  href?: string;
};

export function ContentBreadcrumb({
  items,
}: {
  items: ContentBreadcrumbItem[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto pb-1">
      <ol className="flex w-max min-w-full items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
              )}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  title={item.label}
                  className="max-w-32 truncate rounded-lg px-1.5 py-1 font-semibold transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:max-w-48"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  title={item.label}
                  className={
                    isCurrent
                      ? "max-w-40 truncate px-1.5 py-1 font-semibold text-foreground sm:max-w-64"
                      : "max-w-32 truncate px-1.5 py-1 sm:max-w-48"
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
