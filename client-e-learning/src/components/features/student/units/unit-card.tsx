import Link from "next/link";
import { ArrowRight, Lightbulb, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentUnitSummary } from "@/types/student-unit";
import { UnitCover, unitLabel } from "./unit-cover";

export function UnitCard({ unit }: { unit: StudentUnitSummary }) {
  const label = unitLabel(unit.code);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border-color bg-card-bg shadow-2xs transition-all hover:border-primary hover:shadow-md">
      <div className="relative">
        <UnitCover label={label} name={unit.name} coverUrl={unit.coverUrl} className="h-32" />
        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/40 bg-white/95 px-2.5 py-0.5 text-body-sm font-bold text-neutral-dark shadow-xs">
          Unit {label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="text-card-title font-extrabold text-neutral-dark">{unit.name}</h2>
          {unit.description && (
            <p className="mt-1 line-clamp-2 text-body text-neutral-muted">{unit.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm font-medium text-neutral-muted">
          <span className="inline-flex items-center gap-1.5">
            <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
            {unit.sectionCount} sections
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            {unit.activityCount} activities
          </span>
        </div>

        <Button asChild className="mt-auto h-10 w-full rounded-xl bg-primary text-body font-bold text-white shadow-none hover:bg-primary-hover">
          <Link href={`/student/units/${unit.id}`}>
            Open unit
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
