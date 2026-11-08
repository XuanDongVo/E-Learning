"use client";

import { useState } from "react";
import type { FinishGameSessionResponse } from "@/types/vocabulary-game";
import { soundEffects } from "./sound-effects";
import { Pipo } from "@/components/ui/mascot";
import { Star, Volume2, RotateCcw, Home, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

interface GameResultModalProps {
  result: FinishGameSessionResponse;
  onReplay: () => void;
}

export function GameResultModal({ result, onReplay }: GameResultModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"review" | "mastered">(
    result.wordsToReview.length > 0 ? "review" : "mastered"
  );

  const accuracy = Number(result.accuracyPercentage) || 0;
  const starsCount = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto animate-in fade-in zoom-in-95 duration-200 notranslate"
      translate="no"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-white/10 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl my-auto">
        {/* Top Celebration */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Pipo mood="celebrate" size={100} color="primary" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              +{result.earnedXp} XP
            </div>
          </div>

          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {starsCount === 3 ? "Xuất Sắc! Bạn Nhớ Rất Tốt!" : starsCount === 2 ? "Rất Tốt! Hãy Tiếp Tục Phát Huy!" : "Hoàn Thành Ván Học!"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Chủ đề: <strong className="text-white">{result.unitName}</strong>
          </p>

          {/* Stars */}
          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3].map((starIndex) => (
              <Star
                key={starIndex}
                className={`h-8 w-8 sm:h-9 sm:w-9 ${
                  starIndex <= starsCount
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-bounce"
                    : "fill-slate-800 text-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Key Metrics */}
          <div className="mt-5 grid grid-cols-3 gap-3 w-full max-w-md">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
              <span className="block text-xs font-medium text-slate-400">Điểm số</span>
              <span className="mt-0.5 block text-xl font-black text-amber-400">{result.totalScore}</span>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
              <span className="block text-xs font-medium text-slate-400">Độ chính xác</span>
              <span className="mt-0.5 block text-xl font-black text-emerald-400">{Math.round(accuracy)}%</span>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
              <span className="block text-xs font-medium text-slate-400">Thời gian</span>
              <span className="mt-0.5 block text-xl font-black text-blue-400">{result.timeSpentSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Word Review / Mastered Section */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "review"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              Từ cần ôn lại ({result.wordsToReview.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mastered")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "mastered"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Từ đã nhớ ({result.wordsMastered.length})
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {(activeTab === "review" ? result.wordsToReview : result.wordsMastered).length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400 italic">
                {activeTab === "review" ? "Bạn đã nhớ tốt tất cả các từ trong ván này!" : "Chưa có từ nào hoàn thành ở lần thử đầu tiên."}
              </p>
            ) : (
              (activeTab === "review" ? result.wordsToReview : result.wordsMastered).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => soundEffects.speakWord(item.word)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 hover:bg-primary/40 text-primary transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-white text-sm sm:text-base">{item.word}</span>
                        {item.pronunciation && (
                          <span className="text-xs text-slate-400 font-mono">{item.pronunciation}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-300">{item.meaningVi}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onReplay}
            className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 font-bold transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            <RotateCcw className="h-4 w-4" />
            Chơi lại ván này
          </button>
          <button
            type="button"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              router.push("/student/game");
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white py-3 px-5 font-bold transition-all active:scale-95"
          >
            <Home className="h-4 w-4" />
            Danh sách bài học
          </button>
        </div>
      </div>
    </div>
  );
}
