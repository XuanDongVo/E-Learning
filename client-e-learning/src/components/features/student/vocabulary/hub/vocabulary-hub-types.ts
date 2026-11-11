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

export function getVocabularyDueLabel(card: StudentVocabularyStudyCard): string {
  if (card.state === "NEW") return "Từ mới";
  if (card.due) return "Đến hạn ôn";
  if (!card.dueAt) return "Đã học";
  return `Ôn tiếp ${new Date(card.dueAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}`;
}

