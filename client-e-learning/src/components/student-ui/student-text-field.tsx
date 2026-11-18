import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type StudentTextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  id: string;
  label: string;
  leading?: ReactNode;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

/** Accessible native field with consistent label, icon padding and linked feedback. */
export function StudentTextField({
  id,
  label,
  leading,
  hint,
  error,
  containerClassName,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  type = "text",
  ...props
}: StudentTextFieldProps) {
  const hintId = hint ? id + "-hint" : undefined;
  const errorId = error ? id + "-error" : undefined;
  const description = [describedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("min-w-0 space-y-2", containerClassName)}>
      <label htmlFor={id} className="student-label block text-foreground">{label}</label>
      <div className="relative">
        {leading != null && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
            aria-hidden="true">{leading}</span>
        )}
        <input
          {...props}
          id={id}
          type={type}
          aria-describedby={description}
          aria-invalid={Boolean(error) || invalid || undefined}
          className={cn("student-field", leading != null && "student-field--with-leading", className)}
        />
      </div>
      {hint && <p id={hintId} className="student-caption text-muted-foreground">{hint}</p>}
      {error && <p id={errorId} role="alert" className="student-caption text-destructive">{error}</p>}
    </div>
  );
}
