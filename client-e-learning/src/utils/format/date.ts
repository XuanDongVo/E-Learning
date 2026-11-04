export const EMPTY_DISPLAY = "—";

/**
 * Format only date (no time).
 * Prioritizes YYYY-MM-DD input → dd/MM/yyyy.
 * Falls back to Intl.DateTimeFormat according to locale for non-ISO input.
 */
export function formatDate(value?: string | null, locale?: string): string {
  if (!value) return EMPTY_DISPLAY;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }

  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return EMPTY_DISPLAY;
    return new Intl.DateTimeFormat(locale || undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(parsed);
  } catch {
    return EMPTY_DISPLAY;
  }
}

/**
 * Format date + time (short).
 * Example: 28/10/2026, 20:00 or 28/10 20:00
 */
export function formatDateTime(value?: string | null, locale?: string): string {
  if (!value) return EMPTY_DISPLAY;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return EMPTY_DISPLAY;
    return new Intl.DateTimeFormat(locale || undefined, {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return EMPTY_DISPLAY;
  }
}

/**
 * Format due date/time.
 * style:
 *  - "short": e.g. "Wed, Oct 28, 8:00 PM" / "T4, 28 thg 10, 20:00"
 *  - "long": e.g. "Wednesday, 28/10/2026, 20:00" / "Thứ Tư, 28/10/2026, 20:00"
 */
export function formatDueAt(
  value?: string | null,
  locale?: string,
  style: "short" | "long" = "short",
): string {
  if (!value) return EMPTY_DISPLAY;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return EMPTY_DISPLAY;

    if (style === "long") {
      return new Intl.DateTimeFormat(locale || undefined, {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    }

    return new Intl.DateTimeFormat(locale || undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return EMPTY_DISPLAY;
  }
}
