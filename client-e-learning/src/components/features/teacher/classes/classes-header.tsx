import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface ClassesHeaderProps {
  onCreate: () => void;
}

export function ClassesHeader({ onCreate }: ClassesHeaderProps) {
  const t = useTranslations("teacher.classes");

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-body-sm font-extrabold uppercase tracking-[0.16em] text-primary">
          {t("workspace")}
        </p>

        <h1 className="mt-2 text-ui-3xl font-extrabold tracking-tight">
          {t("title")}
        </h1>

        <p className="mt-2 text-body text-neutral-muted">
          {t("subtitle")}
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-body font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4" />
        {t("createClass")}
      </button>
    </div>
  );
}