/**
 * Extract initials from full name (max characters from the end).
 * Example: "Nguyễn Minh Anh" -> "MA" (when max = 2)
 */
export function getInitials(fullName?: string | null, max = 2): string {
  if (!fullName) return "";
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";

  const initials = parts.map((part) => part[0]).join("");
  return initials.slice(-max).toUpperCase();
}

