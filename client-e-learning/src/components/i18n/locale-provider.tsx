"use client";

import { createContext, useContext, useMemo } from "react";
import { useLocale as useIntlLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export type Locale = "vi" | "en";

const translationKeys = [
  "language", "vietnamese", "english", "content", "contentExplorer",
  "questionBanksNav", "contentDescription", "createUnit", "units", "unitCount",
  "sectionsAndTopics", "selectUnit", "noUnits", "noTopics", "questionBanks",
  "questions", "search", "loading", "retry", "overview", "classes", "students",
  "activities", "assignments", "analytics", "searchGlobal",
] as const;

type TranslationKey = (typeof translationKeys)[number];

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Compatibility adapter for existing teacher content components.
 * The URL/next-intl locale is the source of truth; no localStorage state.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useIntlLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const tMessages = useTranslations();

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        if (nextLocale !== locale) {
          const query = window.location.search.slice(1);
          router.replace(query ? `${pathname}?${query}` : pathname, { locale: nextLocale });
        }
      },
      t: (key) => tMessages(key),
    }),
    [locale, pathname, router, tMessages],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
