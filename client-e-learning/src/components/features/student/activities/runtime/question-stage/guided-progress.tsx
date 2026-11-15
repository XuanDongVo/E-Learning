
type GuidedProgressProps = {
  intro?: string | null;
  position?: number;
  total?: number;
};

export function GuidedProgress({
  intro,
  position,
  total,
}: GuidedProgressProps) {
  const hasProgress =
    position !== undefined &&
    total !== undefined &&
    Number.isInteger(position) &&
    Number.isInteger(total) &&
    total > 0;

  const current = hasProgress
    ? Math.min(Math.max(position + 1, 1), total)
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground sm:text-base">
          Cùng giải từng bước
        </h2>

        {hasProgress && (
          <span className="shrink-0 text-sm font-semibold text-muted-foreground">
            Bước {current}/{total}
          </span>
        )}
      </div>

      {hasProgress && (
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-label="Tiến độ hướng dẫn"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current - 1}
          aria-valuetext={`Đang làm bước ${current} trên ${total}`}
        >
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={[
                "h-1.5 min-w-0 flex-1 rounded-full",
                "transition-colors duration-200",
                index < current - 1
                  ? "bg-success"
                  : index === current - 1
                    ? "bg-learning"
                    : "bg-border",
              ].join(" ")}
            />
          ))}
        </div>
      )}

      {intro?.trim() && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {intro}
        </p>
      )}
    </div>
  );
}
