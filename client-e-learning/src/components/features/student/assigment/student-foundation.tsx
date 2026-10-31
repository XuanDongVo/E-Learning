import { type ReactNode } from "react";
import { Flame, Sparkles, CheckCircle2, Clock3 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function PopButton({
  className = "",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "h-auto min-h-[44px] rounded-xl font-bold text-xs transition-transform duration-150 active:translate-x-[2px] active:translate-y-[2px]",
        variant === "default" &&
          "border-[1.5px] border-foreground bg-primary text-foreground shadow-pop-sm hover:bg-primary-hover active:shadow-none",
        className,
      )}
      {...props}
    />
  );
}
export function PopCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border-[1.5px] border-foreground bg-card shadow-pop-sm",
        className,
      )}
    >
      {children}
    </article>
  );
}
export function XpChip({ xp }: { xp: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent-soft px-2.5 py-1.5 text-xs font-bold text-foreground">
      <Sparkles size={15} className="text-accent-foreground" />
      {xp.toLocaleString()} XP
    </span>
  );
}
export function StreakChip({
  days,
  atRisk = false,
}: {
  days: number;
  atRisk?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-soft px-2.5 py-1.5 text-xs font-bold text-foreground",
        atRisk && "border border-dashed border-primary-hover",
      )}
    >
      <Flame size={15} className="text-primary-hover" />
      {days === 0
        ? "Fresh start today!"
        : `${days} days${atRisk ? " · At risk" : ""}`}
    </span>
  );
}
export function LevelBadge({ level }: { level: number }) {
  return (
    <span className="grid h-[31px] w-[31px] place-items-center rounded-xl bg-accent-soft text-lg font-extrabold text-foreground">
      {level}
    </span>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3 w-full overflow-hidden rounded-full bg-teal-soft"
    >
      <div
        className="h-full rounded-full bg-teal transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
export function ProgressRing({
  value,
  children,
}: {
  value: number;
  children: ReactNode;
}) {
  return (
    <span className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r="25" fill="none" stroke="var(--border)" strokeWidth="4" pathLength="100" />
        <circle
          className="transition-all duration-300"
          cx="30"
          cy="30"
          r="25"
          fill="none"
          stroke="var(--teal)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${Math.min(100, Math.max(0, value))} 100`}
        />
      </svg>
      {children}
    </span>
  );
}
export function StatusPill({ status }: { status: string }) {
  const isDone = status === "Submitted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold",
        isDone ? "bg-success-soft text-foreground" : "bg-primary-soft text-foreground",
      )}
    >
      {isDone ? (
        <CheckCircle2 size={13} className="text-success" />
      ) : (
        <Clock3 size={13} />
      )}{" "}
      {status}
    </span>
  );
}
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2.5">
      <h2 className="text-lg font-bold">{title}</h2>
      {action}
    </div>
  );
}
