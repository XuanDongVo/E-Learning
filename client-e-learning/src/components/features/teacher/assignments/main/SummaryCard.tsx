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
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-muted-foreground">
          {label}
        </p>

        <span
          className={`grid size-8 place-items-center rounded-lg ${colorToneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-extrabold">
        {value}
      </p>

      <p className="mt-1 text-body-sm text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}