import type { BaseTone } from "@/types/theme";
import { baseToneClasses } from "@/utils/theme";
interface BadgeProps {
  children: React.ReactNode;
  tone?: BaseTone;
}

export function Badge({
  children,
  tone = "green",
}: BadgeProps) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-micro font-bold ${baseToneClasses[tone]}`}>
      {children}
    </span>
  );
}