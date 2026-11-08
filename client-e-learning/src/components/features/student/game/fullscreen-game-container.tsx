"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  LogOut,
  Flame,
  Award,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FullscreenGameContainerProps {
  title: string;
  unitName: string;
  currentWordIndex: number;
  totalWords: number;
  score: number;
  combo: number;
  isMuted: boolean;
  onToggleMute: () => void;
  children: React.ReactNode;
}

export function FullscreenGameContainer({
  title,
  unitName,
  currentWordIndex,
  totalWords,
  score,
  combo,
  isMuted,
  onToggleMute,
  children,
}: FullscreenGameContainerProps) {
  const router = useRouter();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor browser fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans notranslate"
      translate="no"
    >
      {/* Top Header */}
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 sm:px-6 backdrop-blur-md">
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors"
            title="Thoát trò chơi"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-white tracking-tight">{title}</span>
            <span className="hidden sm:inline text-xs rounded-full bg-white/10 px-2.5 py-0.5 font-bold text-slate-300">
              {unitName}
            </span>
          </div>
        </div>

        {/* Center: Score & Combo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1 text-amber-400 shadow-sm">
            <Award className="h-4 w-4 shrink-0" />
            <span className="text-sm font-black">{score}</span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-orange-400 font-black text-xs animate-pulse shadow-sm">
              <Flame className="h-3.5 w-3.5 fill-orange-400" />
              <span>Combo x{combo}</span>
            </div>
          )}
        </div>

        {/* Right: Word Progress & Controls */}
        <div className="flex items-center gap-2">
          {totalWords > 0 && (
            <span className="hidden sm:inline-flex text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <span>{Math.min(currentWordIndex + 1, totalWords)} / {totalWords} từ</span>
            </span>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-red-400" /> : <Volume2 className="h-5 w-5 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={toggleBrowserFullscreen}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="relative flex-1 overflow-hidden flex flex-col notranslate" translate="no">
        {children}
      </main>

      {/* Confirm Exit Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="notranslate" translate="no">
          <AlertDialogHeader>
            <AlertDialogTitle>Dừng chơi game?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời khỏi trò chơi? Tiến trình hiện tại sẽ không được lưu vào kỷ lục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chơi</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
                router.push("/student/game");
              }}
            >
              Rời khỏi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
