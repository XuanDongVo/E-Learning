"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AnalysisHeader({ title }: { title?: string | null }) {
  const t = useTranslations("teacher.analytics");
  return (
    <header className="border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-sm">
        <Link href="/teacher/assignments" className="text-muted-foreground hover:text-foreground">
          ← {t("backToList")}
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="font-medium text-foreground">
          {t("title")}{title ? ` · ${title}` : ""}
        </span>
      </div>
    </header>
  );
}
