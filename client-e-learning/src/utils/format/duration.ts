import { EMPTY_DISPLAY } from "./date";

/**
 * Format seconds to "m:ss" (e.g., 192 -> "3:12").
 */
export function formatDurationSeconds(seconds?: number | null): string {
  if (seconds == null || !Number.isFinite(Number(seconds))) return EMPTY_DISPLAY;
  const total = Math.max(0, Math.floor(Number(seconds)));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Format start and end ISO timestamps to duration string, e.g. "3m 12s" or "15s".
 */
export function formatDurationRange(
  start?: string | null,
  end?: string | null,
): string {
  if (!start || !end) return EMPTY_DISPLAY;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return EMPTY_DISPLAY;

  const diffSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
