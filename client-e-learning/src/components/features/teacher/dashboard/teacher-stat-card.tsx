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
    <div className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body-sm font-semibold text-neutral-muted">
            {label}
          </p>
          <p className="mt-2 text-ui-2xl font-extrabold tracking-tight text-neutral-dark">
            {value}
          </p>
          <p className="mt-1 text-body-sm text-neutral-muted">{detail}</p>
        </div>
        <div
          className={`grid size-9 place-items-center rounded-lg ${semanticToneClasses[tone]}`}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}
