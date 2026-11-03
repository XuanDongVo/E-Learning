/** Shared pure display helpers for teacher student hub (no locale strings). */

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = value.length > 10 ? value.slice(0, 10) : value;
  const [y, m, day] = d.split("-");
  if (y && m && day) return `${day}/${m}/${y}`;
  return value;
}
