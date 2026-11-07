"use client";

import type { GameUnitSummary, GameType, GameMode } from "@/types/vocabulary-game";
import { useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CloudRain, Sparkles, Zap, BookOpen } from "lucide-react";

interface GameSelectModalProps {
  unit: GameUnitSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameSelectModal({ unit, isOpen, onClose }: GameSelectModalProps) {
  const router = useRouter();

  if (!unit) return null;

  const handleLaunchGame = (gameType: GameType, mode: GameMode) => {
    onClose();
    router.push(`/student/game/${unit.id}/${gameType}?mode=${mode}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[94vw] max-w-[860px] sm:max-w-[860px] md:max-w-[860px] p-6 sm:p-8 notranslate !max-w-[860px]"
        style={{ maxWidth: "860px", width: "94vw" }}
        translate="no"
      >
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
              Chọn chế độ học từ vựng
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Bài học: <span className="font-bold text-foreground">{unit.name}</span> •{" "}
            <span className="font-bold text-primary">{unit.vocabularyCount} từ vựng</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Card 1: Space Shooter */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-amber-500/60 hover:shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25">
                  <span className="text-3xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground leading-tight">Chiến hạm Bắn từ</h3>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Space Shooter • Phong cách Bắn gà
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Lái phi thuyền không gian và ngắm bắn tia Laser vào các bong bóng năng lượng mang từ tiếng Anh chính xác trước khi chúng rơi xuống đáy!
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-5 border-t border-border/80">
              <button
                type="button"
                onClick={() => handleLaunchGame("BUBBLE_POP", "CHALLENGE")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 px-4 text-sm font-black shadow-md shadow-orange-500/25 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>Thử thách tốc độ</span>
              </button>
              <button
                type="button"
                onClick={() => handleLaunchGame("BUBBLE_POP", "PRACTICE")}
                className="flex items-center justify-center gap-2 rounded-xl bg-card hover:bg-muted text-foreground py-3.5 px-5 text-sm font-bold border-2 border-border transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Tự luyện</span>
              </button>
            </div>
          </div>

          {/* Card 2: Word Rain */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-card to-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-sky-500/60 hover:shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
                  <CloudRain className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground leading-tight">Cơn mưa Từ vựng</h3>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                    Word Rain • Rèn luyện chính tả
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Những giọt mưa từ vựng rơi nhẹ xuống mặt hồ đêm thơ mộng. Gõ chữ cái đầu tiên để khóa mục tiêu và gõ đủ từ trước khi chạm nước!
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-5 border-t border-border/80">
              <button
                type="button"
                onClick={() => handleLaunchGame("WORD_RAIN", "CHALLENGE")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3.5 px-4 text-sm font-black shadow-md shadow-sky-500/25 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>Thử thách tốc độ</span>
              </button>
              <button
                type="button"
                onClick={() => handleLaunchGame("WORD_RAIN", "PRACTICE")}
                className="flex items-center justify-center gap-2 rounded-xl bg-card hover:bg-muted text-foreground py-3.5 px-5 text-sm font-bold border-2 border-border transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Tự luyện</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
