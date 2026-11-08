"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GameType, GameMode } from "@/types/vocabulary-game";
import { studentGameService } from "@/services/student/student-game.service";
import { BubblePopGame } from "./bubble-pop-game";
import { WordRainGame } from "./word-rain-game";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface GameRunnerProps {
  unitId: number;
  gameType: GameType;
  mode: GameMode;
}

export function GameRunner({ unitId, gameType, mode }: GameRunnerProps) {
  const router = useRouter();
  const [gameKey, setGameKey] = useState(0);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["student", "game", "session", unitId, gameType, mode, gameKey],
    queryFn: () => studentGameService.startSession({ unitId, gameType, mode }),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const sessionData = response?.data;

  const handleReplay = useCallback(() => {
    setGameKey((prev) => prev + 1);
  }, []);

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white notranslate select-none"
        translate="no"
      >
        <Spinner className="h-10 w-10 text-primary" />
        <p className="mt-4 text-base font-bold text-slate-300 animate-pulse">
          Đang chuẩn bị bộ từ vựng cho bạn...
        </p>
      </div>
    );
  }

  if (isError || !sessionData) {
    const errObj = error as { message?: string } | null;
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6 text-white text-center notranslate select-none"
        translate="no"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Không thể bắt đầu trò chơi</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          {errObj?.message || "Unit này hiện chưa có đủ từ vựng để chơi."}
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/student/game")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang trò chơi
          </Button>
          <Button type="button" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (gameType === "BUBBLE_POP") {
    return (
      <BubblePopGame
        key={gameKey}
        sessionId={sessionData.sessionId}
        unitName={sessionData.unitName}
        words={sessionData.words}
        onReplay={handleReplay}
      />
    );
  }

  return (
    <WordRainGame
      key={gameKey}
      sessionId={sessionData.sessionId}
      unitName={sessionData.unitName}
      words={sessionData.words}
      mode={mode}
      onReplay={handleReplay}
    />
  );
}
