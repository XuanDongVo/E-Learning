export function SketchProgress({
  value,
  max,
  label,
  tone = "mustard",
}: {
  value: number;
  max: number;
  label: string;
  tone?: "mustard" | "denim";
}) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(safeMax, value)) : 0;
  const percent = (safeValue / safeMax) * 100;

  return (
    <div
      className="student-sketch-meter"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
    >
      <div
        className={"student-sketch-meter__fill" + (tone === "denim" ? " student-sketch-meter__fill--denim" : "")}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
