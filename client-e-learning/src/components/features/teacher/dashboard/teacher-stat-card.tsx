import type { LucideIcon } from "lucide-react";

export function TeacherStatCard({ icon: Icon, value, label, tone }: { icon: LucideIcon; value: string; label: string; tone: "primary" | "secondary" | "accent" }) {
  const tones = {
    primary: "bg-primary-light text-primary",
    secondary: "bg-secondary-light text-secondary-hover",
    accent: "bg-accent-light text-accent",
  };
  return <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5 shadow-sm"><div className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div><p className="text-ui-2xl font-extrabold tracking-tight text-neutral-dark">{value}</p><p className="text-body-sm font-semibold text-neutral-muted">{label}</p></div></div>;
}