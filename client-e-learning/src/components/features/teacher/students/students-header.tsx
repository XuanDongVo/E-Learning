"use client";

import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface StudentsHeaderProps {
  onCreate: () => void;
}

export function StudentsHeader({ onCreate }: StudentsHeaderProps) {
  const t = useTranslations("teacher.students");

  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          {t("workspace")}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <Button
        type="button"
        onClick={onCreate}
        className="h-10 gap-2 px-4 font-bold shadow-sm"
      >
        <UserPlus className="size-4" />
        {t("addStudent")}
      </Button>
    </header>
  );
}
