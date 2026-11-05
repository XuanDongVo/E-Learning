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
    role="group"
    aria-label="Language selector"
    className="inline-flex h-8 items-center rounded-lg border border-border/80 bg-muted/60 p-0.5 text-xs select-none"
  >
    <button
      type="button"
      onClick={() => switchLocale("vi")}
      aria-pressed={locale === "vi"}
      className={`relative inline-flex h-7 items-center justify-center rounded-md px-2.5 font-semibold transition-all duration-200 ${
        locale === "vi"
          ? "bg-primary text-card shadow-xs"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      VI
    </button>
    <button
      type="button"
      onClick={() => switchLocale("en")}
      aria-pressed={locale === "en"}
      className={`relative inline-flex h-7 items-center justify-center rounded-md px-2.5 font-semibold transition-all duration-200 ${
        locale === "en"
          ? "bg-primary text-card shadow-xs"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      EN
    </button>
  </div>
);


}
