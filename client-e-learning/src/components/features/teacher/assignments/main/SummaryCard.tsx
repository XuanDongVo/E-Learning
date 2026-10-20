import type { ReactNode } from "react";
import type { ColorTone } from "@/types/theme";
import { colorToneClasses } from "@/utils/theme";

type Props = {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint: string;
  tone: ColorTone;
};

export function SummaryCard({
  icon,
  label,
  value,
  hint,
  tone,
}: Props) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-card p-5 shadow-pop transition hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-body-sm font-bold text-neutral-muted">
          {label}
        </p>

        <span
          className={`grid size-9 place-items-center rounded-xl border border-border shadow-pop-sm ${colorToneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-extrabold text-foreground">
        {value}
      </p>

      <p className="mt-1 text-body-sm font-medium text-neutral-muted">
        {hint}
      </p>
    </div>
  );
}