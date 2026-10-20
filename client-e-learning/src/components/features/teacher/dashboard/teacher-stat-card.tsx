import type { LucideIcon } from "lucide-react";
import type { SemanticTone } from "@/types/theme";

import { semanticToneClasses } from "@/utils/theme";

export function TeacherStatCard({
  icon: Icon,
  value,
  label,
  tone,
  detail,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  detail: string;
  tone: SemanticTone;
}) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-card p-5 shadow-pop transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body-sm font-bold text-neutral-muted">
            {label}
          </p>
          <p className="mt-2 text-ui-2xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-body-sm text-neutral-muted">{detail}</p>
        </div>
        <div
          className={`grid size-10 place-items-center rounded-xl border border-border shadow-pop-sm ${semanticToneClasses[tone]}`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
