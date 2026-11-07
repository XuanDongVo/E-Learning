import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, ListTree } from "lucide-react";
import type { StudentUnitSummary } from "@/types/student-unit";
import { UnitCover, unitLabel } from "./unit-cover";
import { PaperSurface } from "@/components/student-ui/paper-surface";

export function UnitCard({
  unit,
}: {
  unit: StudentUnitSummary;
}) {
  const label = unitLabel(unit.code);

  return (
    <PaperSurface as="article" interactive className="student-unit-card group flex flex-col overflow-hidden">
      <div className="relative overflow-hidden">
        <UnitCover
          label={label}
          name={unit.name}
          coverUrl={unit.coverUrl}
          className="h-36 w-full object-cover"
        />
        <span
          className="student-chip absolute left-3 top-3"
        >
          Unit {label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <h2 className="student-card-title text-foreground group-hover:text-primary">
            {unit.name}
          </h2>
          {unit.description ? (
            <p className="student-body mt-2 line-clamp-2 text-muted-foreground">
              {unit.description}
            </p>
          ) : (
            <p className="student-body mt-2 text-muted-foreground">
              Mở Unit để xem phần học và hoạt động luyện tập.
            </p>
          )}
        </div>

        <div className="student-meta flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
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
          className="student-control student-control--action mt-auto w-full justify-between"
        >
          <span>Xem phần học</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </PaperSurface>
  );
}
