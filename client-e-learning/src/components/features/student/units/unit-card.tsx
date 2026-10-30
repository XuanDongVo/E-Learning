import { Link } from "@/i18n/navigation";
import { ArrowRight, Lightbulb, ListTree, Sparkles } from "lucide-react";
import type { StudentUnitSummary } from "@/types/student-unit";
import { UnitCover, unitLabel } from "./unit-cover";

// Luân phiên các accent token học tập chuẩn theme (teal, primary, warning, learning)
const UNIT_THEME_TOKENS = [
  {
    badge: "border-primary/30 bg-primary-soft text-primary",
    hoverBorder: "hover:border-primary",
  },
  {
    badge: "border-teal/30 bg-teal-soft text-teal",
    hoverBorder: "hover:border-teal",
  },
  {
    badge: "border-warning/30 bg-warning-soft text-warning",
    hoverBorder: "hover:border-warning",
  },
  {
    badge: "border-learning/30 bg-learning-soft text-learning",
    hoverBorder: "hover:border-learning",
  },
];

export function UnitCard({
  unit,
  index = 0,
}: {
  unit: StudentUnitSummary;
  index?: number;
}) {
  const label = unitLabel(unit.code);
  const theme = UNIT_THEME_TOKENS[index % UNIT_THEME_TOKENS.length];

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-pop transition-all duration-200 hover:-translate-y-1 hover:shadow-pop-lg ${theme.hoverBorder}`}
    >
      {/* ─── Cover ─── */}
      <div className="relative overflow-hidden">
        <UnitCover
          label={label}
          name={unit.name}
          coverUrl={unit.coverUrl}
          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge Unit */}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-pop-sm ${theme.badge}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Unit {label}
        </span>
      </div>

      {/* ─── Nội dung thẻ ─── */}
      <div className="flex flex-1 flex-col gap-3.5 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {unit.name}
          </h2>
          {unit.description ? (
            <p className="mt-1 line-clamp-2 text-sm font-medium text-muted-foreground">
              {unit.description}
            </p>
          ) : (
            <p className="mt-1 text-sm italic text-muted-foreground/70">
              Khám phá từ vựng, ngữ pháp và hoạt động luyện tập của bài học.
            </p>
          )}
        </div>

        {/* Chips thống kê xúc giác */}
        <div className="flex flex-wrap gap-2 text-xs font-bold text-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 shadow-pop-sm">
            <ListTree className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>{unit.sectionCount} phần học</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5 shadow-pop-sm">
            <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
            <span>{unit.activityCount} hoạt động</span>
          </span>
        </div>

        {/* Nút hành động Tactile Button 3D */}
        <Link
          href={`/student/units/${unit.id}`}
          className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-primary text-sm font-extrabold text-primary-foreground shadow-pop transition-all hover:bg-primary-hover active:translate-y-0.5 active:shadow-pop-sm"
        >
          <span>Khám phá bài học</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
