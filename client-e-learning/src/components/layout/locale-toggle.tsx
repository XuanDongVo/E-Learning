"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: "vi" | "en") {
    if (nextLocale !== locale) {
      const query = typeof window !== "undefined" ? window.location.search.slice(1) : "";
      router.replace(query ? `${pathname}?${query}` : pathname, { locale: nextLocale });
    }
  }

  return (
    <div
      className="flex h-9 items-center rounded-lg border border-border bg-card p-0.5"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => switchLocale("vi")}
        className={`rounded-md px-2 text-[0.6875rem] font-bold ${
          locale === "vi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
        aria-pressed={locale === "vi"}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`rounded-md px-2 text-[0.6875rem] font-bold ${
          locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
