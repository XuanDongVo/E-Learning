import { Link } from "@/i18n/navigation";
import { MoreHorizontal, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ClassCardProps } from "@/types/class";

export function ClassCard({ classItem, onEdit, onArchive }: ClassCardProps) {
  const t = useTranslations("teacher.classes");

  return (
    <article className="rounded-2xl border-2 border-ink bg-card p-6 shadow-pop transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-pop-sm">
          <Users className="h-6 w-6" />
        </div>
        <details className="relative">
          <summary
            className="grid size-8 place-items-center rounded-lg border border-border bg-background-app list-none cursor-pointer text-muted-foreground shadow-pop-sm transition hover:border-primary hover:text-primary"
            aria-label={t("moreOptions", { name: classItem.name })}
          >
            <MoreHorizontal className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-36 rounded-xl border-2 border-ink bg-card p-1.5 shadow-pop">
            <button
              type="button"
              onClick={() => onEdit(classItem)}
              className="block w-full rounded-lg px-3 py-2 text-left text-body-sm font-semibold hover:bg-muted"
            >
              {t("edit")}
            </button>
            {classItem.status === "ACTIVE" && (
              <button
                type="button"
                onClick={() => onArchive(classItem)}
                className="block w-full rounded-lg px-3 py-2 text-left text-body-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                {t("archive")}
              </button>
            )}
          </div>
        </details>
      </div>
      <h2 className="mt-5 text-ui-lg font-extrabold text-foreground">{classItem.name}</h2>
      <p className="mt-1 text-body font-medium text-neutral-muted">
        {classItem.grade.name} · {classItem.studentCount} {t("studentsCount")}
      </p>
      <div className="mt-5 flex items-center justify-between border-t-2 border-border/80 pt-4 text-body-sm font-bold text-neutral-muted">
        <span>{classItem.academicYear}</span>
        <div className="flex items-center gap-3">
          {classItem.status === "ARCHIVED" && (
            <span className="rounded-lg border border-border bg-muted px-2 py-0.5 text-xs text-neutral-muted">
              {t("archived")}
            </span>
          )}
          <Link
            href={"/teacher/classes/" + classItem.id + "/students"}
            className="inline-flex items-center gap-1 font-extrabold text-primary hover:underline"
          >
            {t("viewStudents")}
          </Link>
        </div>
      </div>
    </article>
  );
}
