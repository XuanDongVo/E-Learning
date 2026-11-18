import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StudentButtonVariant = "action" | "secondary" | "quiet" | "accent" | "danger";

type StudentButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StudentButtonVariant;
  size?: "default" | "compact";
  loading?: boolean;
};

/** Native button; Link callers can use the same student-control CSS variants. */
export function StudentButton({
  variant = "quiet",
  size = "default",
  loading = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: StudentButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn("student-control", "student-control--" + variant,
        size === "compact" && "student-control--compact", className)}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
