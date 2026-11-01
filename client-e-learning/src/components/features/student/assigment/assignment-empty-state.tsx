"use client";

import { useTranslations } from "next-intl";
import { Pipo } from "@/components/ui/mascot";
import { Button } from "@/components/ui/button";

interface AssignmentEmptyStateProps {
  onClearFilters: () => void;
}

export function AssignmentEmptyState({ onClearFilters }: AssignmentEmptyStateProps) {
  const t = useTranslations("student.assignments");

  return (
    <div className="grid justify-items-center gap-2 rounded-3xl border-2 border-dashed border-border p-8 sm:p-10 text-center">
      <Pipo mood="think" size={100} />
      <h2 className="text-lg font-bold">{t("emptyTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
      <Button type="button" className="mt-3" onClick={onClearFilters}>
        {t("clearFilters")}
      </Button>
    </div>
  );
}
