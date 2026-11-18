import { BookOpen, CalendarClock, Gamepad2, Layers3 } from "lucide-react";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

export type HubTab = "browse" | "learn" | "review" | "games";

export const TAB_ITEMS = [
  { key: "browse", label: "Xem từ", icon: BookOpen },
  { key: "learn", label: "Học", icon: Layers3 },
  { key: "review", label: "Ôn tập", icon: CalendarClock },
  { key: "games", label: "Chơi", icon: Gamepad2 },
] as const;

export const vocabularyUnitCardsKey = (unitId: number) =>
  ["student", "vocabulary", "units", unitId, "cards"] as const;

/** NEW cards are available for Learn, but they are NOT FSRS reviews due. */
export function isVocabularyCardDue(card: StudentVocabularyStudyCard, nowMs = Date.now()): boolean {
  if (card.state === "NEW") return false;
  if (!card.dueAt) return card.due;
  const timestamp = Date.parse(card.dueAt);
  return Number.isFinite(timestamp) ? timestamp <= nowMs : card.due;
}

/** Nearest pending review, used to update the UI as soon as it becomes due. */
export function nextVocabularyDueAt(cards: StudentVocabularyStudyCard[], nowMs: number): number | null {
  let next: number | null = null;
  for (const card of cards) {
    if (card.state === "NEW" || !card.dueAt) continue;
    const timestamp = Date.parse(card.dueAt);
    if (Number.isFinite(timestamp) && timestamp > nowMs && (next === null || timestamp < next)) {
      next = timestamp;
    }
  }
  return next;
}

export function formatVocabularyReviewDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Chưa xác định";
  return new Date(timestamp).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Friendly delay only; the absolute dueAt from the server remains authoritative. */
export function formatVocabularyReviewDelay(value?: string, nowMs = Date.now()): string {
  if (!value) return "Theo FSRS";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Theo FSRS";
  const remaining = timestamp - nowMs;
  if (remaining <= 0) return "Ngay";
  if (remaining < 60_000) return "Dưới 1 phút";
  if (remaining < 3_600_000) return `${Math.ceil(remaining / 60_000)} phút`;
  if (remaining < 86_400_000) return `${Math.round(remaining / 3_600_000)} giờ`;
  return `${Math.round(remaining / 86_400_000)} ngày`;
}

export function getVocabularyDueLabel(card: StudentVocabularyStudyCard, nowMs = Date.now()): string {
  if (card.state === "NEW") return "Từ mới";
  if (isVocabularyCardDue(card, nowMs)) return "Đến hạn ôn";
  if (!card.dueAt) return "Đã học";
  return `Ôn tiếp ${formatVocabularyReviewDate(card.dueAt)}`;
}

