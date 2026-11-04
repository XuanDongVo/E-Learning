"use client";

import { useTranslations } from "next-intl";
import { TeacherPageHeader } from "@/components/features/teacher/shared/teacher-page-header";

export function ClassesHeader() {
  const t = useTranslations("teacher.classes");

  return (
    <TeacherPageHeader
      title={t("title")}
      description={t("subtitle")}
      pipoMood="wave"
    />
  );
}
