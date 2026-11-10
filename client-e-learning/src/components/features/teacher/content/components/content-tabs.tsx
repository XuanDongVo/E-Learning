import { cn } from "@/lib/utils";

interface ContentTabItem<T extends string> {
  value: T;
  label: string;
}

interface ContentTabsProps<T extends string> {
  active: T;
  items: ContentTabItem<T>[];
  onChange: (value: T) => void;
  idPrefix: string;
  className?: string;
}

export function ContentTabs<T extends string>({
  active,
  items,
  onChange,
  idPrefix,
  className,
}: ContentTabsProps<T>) {
  const selectAndFocus = (value: T) => {
    onChange(value);
    requestAnimationFrame(() => {
      document.getElementById(`${idPrefix}-tab-${value}`)?.focus();
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Unit content"
      className={cn("flex overflow-x-auto border-b border-ink", className)}
    >
      {items.map((item) => (
        <button
          key={item.value}
          id={`${idPrefix}-tab-${item.value}`}
          type="button"
          role="tab"
          aria-selected={active === item.value}
          aria-controls={`${idPrefix}-panel-${item.value}`}
          tabIndex={active === item.value ? 0 : -1}
          className={cn(
            "relative min-h-10 shrink-0 whitespace-nowrap px-4 py-2.5 text-body-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
            active === item.value &&
              "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
          )}
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => {
            const currentIndex = items.findIndex(
              (candidate) => candidate.value === item.value,
            );
            let nextIndex = currentIndex;

            if (event.key === "ArrowRight") {
              nextIndex = (currentIndex + 1) % items.length;
            } else if (event.key === "ArrowLeft") {
              nextIndex = (currentIndex - 1 + items.length) % items.length;
            } else if (event.key === "Home") {
              nextIndex = 0;
            } else if (event.key === "End") {
              nextIndex = items.length - 1;
            } else {
              return;
            }

            event.preventDefault();
            selectAndFocus(items[nextIndex].value);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
