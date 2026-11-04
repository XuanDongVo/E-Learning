import { EMPTY_DISPLAY } from "./date";

/**
 * Format score percentage.
 * Example: 85 -> "85%" (digits=0) or "85.0%" (digits=1, or only when decimal)
 * null / undefined / NaN -> "—"
 */
export function formatScorePercent(value?: number | null, digits: 0 | 1 = 1): string {
  if (value == null || !Number.isFinite(Number(value))) return EMPTY_DISPLAY;
  const num = Number(value);
  if (digits === 0) {
    return `${Math.round(num)}%`;
  }
  const formatted = Math.round(num * 10) / 10;
  return `${formatted}%`;
}
