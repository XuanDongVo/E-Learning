"use client";

import { useState } from "react";
import { CloudRain, Gamepad2, Zap } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentDoodle } from "@/components/student-ui/visuals/student-doodle";
import Image from "next/image";
import type { GameMode, GameType, PronunciationAccent } from "@/types/vocabulary-game";

export function VocabularyGamesPanel({ unitId, wordCount }: { unitId: number; wordCount: number }) {
  const router = useRouter();
  const [accent, setAccent] = useState<PronunciationAccent | null>(null);
  const [mode, setMode] = useState<GameMode>("PRACTICE");
  const launch = (type: GameType) => {
    if (!accent || wordCount < 4) return;
    router.push(`/student/game/${unitId}/${type}?mode=${mode}&accent=${accent}`);
  };

  return (
    <PaperSurface as="section" variant="lined" className="space-y-5 p-5 sm:p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute right-3 top-3 opacity-60 hidden sm:block">
        <StudentDoodle id="doodle.star-sticker" className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <p className="student-meta text-primary">VOCABULARY GAMES · UNIT</p>
        <h2 className="student-card-title text-foreground">Chơi với bộ từ của Unit</h2>
        <p className="student-body text-muted-foreground">Bubble Pop và Word Rain là mini-game riêng. Điểm chơi không làm thay đổi lịch ôn FSRS.</p>
      </div>

      <div className="space-y-2">
        <p className="student-label text-foreground">1. Chọn giọng phát âm</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Giọng phát âm trong trò chơi">
          {(["US", "UK"] as const).map((choice) => (
            <button key={choice} type="button" aria-pressed={accent === choice} onClick={() => setAccent(choice)}
              className={`student-control min-h-[44px] px-4 font-black ${accent === choice ? "student-filter-active" : "student-control--quiet"}`}>
              {choice === "US" ? "🇺🇸 Anh–Mỹ · US" : "🇬🇧 Anh–Anh · UK"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="student-label text-foreground">2. Chọn cách chơi</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Chế độ trò chơi">
          {(["PRACTICE", "CHALLENGE"] as const).map((choice) => (
            <button key={choice} type="button" aria-pressed={mode === choice} onClick={() => setMode(choice)}
              className={`student-control min-h-[44px] px-4 font-black ${mode === choice ? "student-filter-active" : "student-control--quiet"}`}>
              {choice === "PRACTICE" ? "Tự luyện" : "Thử thách"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {([
          {
            type: "BUBBLE_POP",
            title: "Bubble Pop",
            detail: "Chọn nhanh từ đúng",
            icon: Gamepad2,
            visual: "/assets/vocabulary/chess.svg",
          },
          {
            type: "WORD_RAIN",
            title: "Word Rain",
            detail: "Gõ đúng từ trước khi rơi",
            icon: CloudRain,
            visual: "/assets/vocabulary/gardening.svg",
          },
        ] as const).map(({ type, title, detail, icon: Icon, visual }) => (
          <div key={type} className="student-soft-panel flex flex-col justify-between gap-3 p-4 border border-ink/15 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-ink/15 bg-background p-1">
                <Image src={visual} alt={title} fill className="object-contain p-0.5" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <h3 className="student-card-title text-foreground truncate">{title}</h3>
                </div>
                <p className="student-body text-xs text-muted-foreground truncate">{detail}</p>
              </div>
            </div>

            <button
              type="button"
              disabled={!accent || wordCount < 4}
              onClick={() => launch(type)}
              className="student-control student-control--action min-h-[44px] inline-flex items-center justify-center gap-2 px-4 font-black disabled:opacity-40"
            >
              <Zap className="size-4" aria-hidden="true" /> Chơi {title}
            </button>
          </div>
        ))}
      </div>

      {wordCount < 4 ? (
        <p className="student-body text-warning" role="status">Unit cần ít nhất 4 từ đang dùng để chơi trọn vẹn mini-game.</p>
      ) : !accent ? (
        <p className="student-body text-muted-foreground" role="status">Chọn US hoặc UK để bắt đầu chơi.</p>
      ) : null}

      <div className="pt-2 border-t border-ink/10">
        <Link href="/student/game" className="student-label inline-flex min-h-11 items-center text-primary underline font-bold">
          Mở Game Hub · Khám phá các Unit khác →
        </Link>
      </div>
    </PaperSurface>
  );
}
