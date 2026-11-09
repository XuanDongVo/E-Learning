import type { ReactNode } from "react";

type SummaryTone = "primary" | "success" | "warning" | "info";

const toneClasses: Record<SummaryTone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

type Props = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint: string;
  tone: SummaryTone;
};

export function SummaryCard({
  icon,
  label,
  value,
  hint,
  tone,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted-foreground">
          {label}
        </p>

        <span
          className={`grid size-9 place-items-center rounded-lg ${toneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 text-2xl font-extrabold ">
        {value}
      </div>

      <p className="mt-1 text-sm font-medium text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
