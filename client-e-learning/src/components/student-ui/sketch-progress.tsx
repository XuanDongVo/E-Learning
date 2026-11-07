export function SketchProgress({
  value,
  max,
  label,
  tone = "mustard",
  className,
}: {
  value: number;
  max: number;
  label: string;
  tone?: "mustard" | "denim" | "sage";
  className?: string;
}) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(safeMax, value)) : 0;
  const percent = (safeValue / safeMax) * 100;

  return (
    <div
      className={["student-sketch-meter", className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
    >
      <div
        className={[
          "student-sketch-meter__fill",
          tone === "denim" && "student-sketch-meter__fill--denim",
          tone === "sage" && "student-sketch-meter__fill--sage",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
