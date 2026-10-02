import type { LucideIcon } from "lucide-react";

export function TeacherStatCard({ icon: Icon, value, label, tone, detail }: { icon: LucideIcon; value: string; label: string; detail: string; tone: "primary" | "secondary" | "accent" | "success" }) {
  const tones = {
    primary: "bg-primary-light text-primary",
    secondary: "bg-secondary-light text-secondary-hover",
    accent: "bg-accent-light text-accent",
    success: "bg-success-soft text-success",
  };
  return <div className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-body-sm font-semibold text-neutral-muted">{label}</p><p className="mt-2 text-ui-2xl font-extrabold tracking-tight text-neutral-dark">{value}</p><p className="mt-1 text-body-sm text-neutral-muted">{detail}</p></div><div className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}><Icon className="size-4" /></div></div></div>;
}