"use client";

import { useState } from "react";
import type { GameUnitSummary, GameType, GameMode, PronunciationAccent } from "@/types/vocabulary-game";
import { useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CloudRain, Sparkles, Zap, BookOpen, Rocket, CheckCircle2 } from "lucide-react";
import { StudentDoodle } from "@/components/student-ui/visuals/student-doodle";

interface GameSelectModalProps {
  unit: GameUnitSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameSelectModal({ unit, isOpen, onClose }: GameSelectModalProps) {
  const router = useRouter();
  const [accent, setAccent] = useState<PronunciationAccent | null>(null);

  const close = () => {
    setAccent(null);
    onClose();
  };

  if (!unit) return null;

  const handleLaunchGame = (gameType: GameType, mode: GameMode) => {
    if (!accent) return;
    close();
    router.push(`/student/game/${unit.id}/${gameType}?mode=${mode}&accent=${accent}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="w-[95vw] sm:w-[92vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-5 sm:p-7 md:p-8 rounded-3xl border-2 border-ink/25 bg-card shadow-pop notranslate"
        translate="no"
      >
        <DialogHeader className="space-y-1.5 pb-3 border-b border-ink/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Chọn chế độ học từ vựng
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Bài học: <span className="font-bold text-foreground">{unit.name}</span> •{" "}
            <span className="font-bold text-primary">{unit.vocabularyCount} từ vựng</span>
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Accent Selection */}
        <div className="mt-4 rounded-2xl border-2 border-ink/15 bg-paper-lined/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="student-label text-xs sm:text-sm font-black text-foreground">
              1. Chọn giọng phát âm trước khi chơi
            </p>
            {accent && (
              <span className="student-pill inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Đã chọn {accent}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hệ thống sẽ đọc mẫu từ vựng bằng bộ phát âm chuẩn trên thiết bị của bạn.
          </p>
          <div className="grid grid-cols-2 gap-2.5 pt-1" role="group" aria-label="Giọng phát âm">
            {(["US", "UK"] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={accent === choice}
                onClick={() => setAccent(choice)}
                className={`student-control min-h-[46px] px-3 text-xs sm:text-sm font-black transition-all ${
                  accent === choice
                    ? "student-filter-active shadow-xs"
                    : "student-control--quiet"
                }`}
              >
                {choice === "US" ? "🇺🇸 Anh–Mỹ (US)" : "🇬🇧 Anh–Anh (UK)"}
              </button>
            ))}
          </div>
          {!accent && (
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 pt-0.5">
              ⚠️ Vui lòng chọn US hoặc UK để kích hoạt nút chơi bên dưới.
            </p>
          )}
        </div>

        {/* Step 2: Game Cards */}
        <div className="mt-4 space-y-2">
          <p className="student-label text-xs sm:text-sm font-black text-foreground">
            2. Chọn trò chơi và chế độ
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
            {/* Card 1: Space Shooter / Bubble Pop */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-ink/20 bg-card p-5 sm:p-6 shadow-sm hover:border-ink hover:shadow-pop transition-all">
              <div className="pointer-events-none absolute right-3 top-3 opacity-60">
                <StudentDoodle id="doodle.star-sticker" className="w-8 h-8" />
              </div>

              <div className="space-y-3 z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-600 shadow-xs">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-foreground leading-tight">
                      Chiến hạm Bắn từ
                    </h3>
                    <span className="block text-xs font-bold text-amber-600 dark:text-amber-400">
                      Bubble Pop • Phản xạ nhanh
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lái phi thuyền không gian và ngắm bắn tia Laser vào các bong bóng mang từ tiếng Anh chính xác trước khi rơi xuống đáy!
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-ink/10">
                <button
                  type="button"
                  disabled={!accent}
                  onClick={() => handleLaunchGame("BUBBLE_POP", "CHALLENGE")}
                  className="student-control student-control--action flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="h-4 w-4" />
                  <span>Thử thách</span>
                </button>
                <button
                  type="button"
                  disabled={!accent}
                  onClick={() => handleLaunchGame("BUBBLE_POP", "PRACTICE")}
                  className="student-control student-control--quiet min-h-[46px] px-4 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>Tự luyện</span>
                </button>
              </div>
            </div>

            {/* Card 2: Word Rain */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-ink/20 bg-card p-5 sm:p-6 shadow-sm hover:border-ink hover:shadow-pop transition-all">
              <div className="space-y-3 z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 border-2 border-sky-500/30 text-sky-600 shadow-xs">
                    <CloudRain className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-foreground leading-tight">
                      Cơn mưa Từ vựng
                    </h3>
                    <span className="block text-xs font-bold text-sky-600 dark:text-sky-400">
                      Word Rain • Rèn chính tả
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Những giọt mưa từ vựng rơi nhẹ xuống hồ sen đêm. Gõ chữ cái đầu tiên để khóa mục tiêu và gõ đủ từ trước khi chạm nước!
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-ink/10">
                <button
                  type="button"
                  disabled={!accent}
                  onClick={() => handleLaunchGame("WORD_RAIN", "CHALLENGE")}
                  className="student-control student-control--action flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="h-4 w-4" />
                  <span>Thử thách</span>
                </button>
                <button
                  type="button"
                  disabled={!accent}
                  onClick={() => handleLaunchGame("WORD_RAIN", "PRACTICE")}
                  className="student-control student-control--quiet min-h-[46px] px-4 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>Tự luyện</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
