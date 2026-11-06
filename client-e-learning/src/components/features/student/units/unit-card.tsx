import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, ListTree } from "lucide-react";
import type { StudentUnitSummary } from "@/types/student-unit";
import { UnitCover, unitLabel } from "./unit-cover";

export function UnitCard({
  unit,
}: {
  unit: StudentUnitSummary;
}) {
  const label = unitLabel(unit.code);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary focus-within:border-primary"
    >
      <div className="relative overflow-hidden">
        <UnitCover
          label={label}
          name={unit.name}
          coverUrl={unit.coverUrl}
          className="h-36 w-full object-cover"
        />
        <span
          className="absolute left-3 top-3 rounded-lg bg-card px-2.5 py-1 text-sm font-bold text-foreground"
        >
          Unit {label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <h2 className="text-base font-bold text-foreground group-hover:text-primary">
            {unit.name}
          </h2>
          {unit.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {unit.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Mở Unit để xem phần học và hoạt động luyện tập.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ListTree className="h-4 w-4" aria-hidden="true" />
            <span>{unit.sectionCount} phần học</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{unit.activityCount} hoạt động</span>
          </span>
        </div>

        <Link
          href={`/student/units/${unit.id}`}
          className="mt-auto inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-lg bg-primary-soft px-4 text-base font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span>Xem phần học</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
