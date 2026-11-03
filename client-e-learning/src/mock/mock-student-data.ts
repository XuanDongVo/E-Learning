/** Shared display helpers for teacher student hub (no mock lists). */

export type AccountStatusLabel = "Tài khoản hoạt động" | "Tài khoản đã khóa";

export function accountStatusLabel(status?: string | null): AccountStatusLabel {
  return status === "INACTIVE" || status === "Tài khoản đã khóa" ? "Tài khoản đã khóa" : "Tài khoản hoạt động";
}

export function membershipLabel(status?: string | null, className?: string | null): string {
  if (!className) return "Chưa có lớp";
  return status === "ACTIVE" ? "Đang trong lớp" : "Đã rời lớp";
}

export function genderLabel(g?: string | null): string {
  if (g === "MALE" || g === "Nam") return "Nam";
  if (g === "FEMALE" || g === "Nữ") return "Nữ";
  if (g === "OTHER" || g === "Khác") return "Khác";
  return "—";
}

export function relationshipLabel(r?: string | null): string {
  const map: Record<string, string> = {
    MOTHER: "Mẹ",
    FATHER: "Bố",
    GUARDIAN: "Người giám hộ",
    OTHER: "Khác",
    Mẹ: "Mẹ",
    Bố: "Bố",
  };
  return r ? map[r] ?? r : "—";
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = value.length > 10 ? value.slice(0, 10) : value;
  const [y, m, day] = d.split("-");
  if (y && m && day) return `${day}/${m}/${y}`;
  return value;
}
