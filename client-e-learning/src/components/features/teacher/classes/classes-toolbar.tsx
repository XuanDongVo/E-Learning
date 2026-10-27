import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Grade } from "@/types/grade";

interface ClassesToolbarProps {
  query: string;
  gradeFilter: string;
  grades: Grade[];
  onQueryChange: (value: string) => void;
  onGradeChange: (value: string) => void;
}

export function ClassesToolbar({
  query,
  gradeFilter,
  grades,
  onQueryChange,
  onGradeChange,
}: ClassesToolbarProps) {
  const t = useTranslations("teacher.classes");

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-4 sm:flex-row">
      <label className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-subtle" />

        <input
          aria-label={t("searchPlaceholder")}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-background-app pl-9 pr-3 text-body outline-none focus:border-primary"
        />
      </label>

      <label className="sm:w-48">
        <span className="sr-only">{t("filterGrade")}</span>

        <select
          aria-label={t("filterGrade")}
          value={gradeFilter}
          onChange={(event) => onGradeChange(event.target.value)}
          className="h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-background-app px-3 text-body outline-none focus:border-primary"
        >
          <option value="all">{t("allGrades")}</option>

          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}