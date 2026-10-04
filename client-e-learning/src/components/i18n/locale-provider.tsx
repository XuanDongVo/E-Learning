"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "vi" | "en";

const translations = {
  vi: {
    language: "Ngôn ngữ",
    vietnamese: "Tiếng Việt",
    english: "English",
    content: "Nội dung",
    contentDescription: "Khối lớp → Unit → Section → Topic → Ngân hàng câu hỏi.",
    createUnit: "Tạo Unit",
    units: "Danh sách Unit",
    unitCount: "unit",
    sectionsAndTopics: "Section và Topic trong unit",
    selectUnit: "Chọn một Unit để xem Section và Topic",
    noUnits: "Chưa có Unit trong khối này.",
    noTopics: "Chưa có Topic trong Section này.",
    questionBanks: "ngân hàng",
    questions: "câu hỏi",
    search: "Tìm Unit...",
    loading: "Đang tải...",
    retry: "Thử lại",
    overview: "Tổng quan",
    classes: "Lớp học",
    activities: "Hoạt động",
    assignments: "Bài tập",
    analytics: "Phân tích",
    searchGlobal: "Tìm lớp học, unit, học sinh...",
  },
  en: {
    language: "Language",
    vietnamese: "Vietnamese",
    english: "English",
    content: "Content",
    contentDescription: "Grade → Unit → Section → Topic → Question bank.",
    createUnit: "Create Unit",
    units: "Unit list",
    unitCount: "units",
    sectionsAndTopics: "Sections and topics in this unit",
    selectUnit: "Select a Unit to view sections and topics",
    noUnits: "No units in this grade yet.",
    noTopics: "No topics in this section yet.",
    questionBanks: "banks",
    questions: "questions",
    search: "Search units...",
    loading: "Loading...",
    retry: "Retry",
    overview: "Overview",
    classes: "Classes",
    activities: "Activities",
    assignments: "Assignments",
    analytics: "Analytics",
    searchGlobal: "Search classes, units, students...",
  },
} as const;

type TranslationKey = keyof typeof translations.vi;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const saved = window.localStorage.getItem("teacher-locale");
    if (saved === "vi" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem("teacher-locale", nextLocale);
  };

  const value = useMemo(
    () => ({ locale, setLocale, t: (key: TranslationKey) => translations[locale][key] }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
