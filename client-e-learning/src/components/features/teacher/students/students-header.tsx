import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

export function StudentsHeader({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations("teacher.students");

  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
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
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-body font-extrabold text-primary-foreground hover:bg-primary-hover"
      >
        <UserPlus className="size-4" /> {t("addStudent")}
      </button>
    </header>
  );
}
