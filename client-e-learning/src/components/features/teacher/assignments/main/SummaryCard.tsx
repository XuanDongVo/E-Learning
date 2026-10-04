import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint: string;
  tone: "orange" | "amber" | "green" | "blue";
};

export function SummaryCard({
  icon,
  label,
  value,
  hint,
  tone,
}: Props) {

  const tones = {
    orange: "bg-orange-100 text-orange-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-sky-100 text-sky-600",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-muted-foreground">
          {label}
        </p>

        <span
          className={`grid size-8 place-items-center rounded-lg ${tones[tone]}`}
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