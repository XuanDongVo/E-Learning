interface BadgeProps {
  children: React.ReactNode;
  tone?: "green" | "gray" | "blue" | "violet" | "easy" | "medium" | "hard";
}

const toneClasses = {
  green: "bg-emerald-50 text-emerald-600",
  gray: "bg-slate-100 text-slate-500",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-rose-50 text-rose-600",
} as const;

export function Badge({
  children,
  tone = "green",
}: BadgeProps) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-micro font-bold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}