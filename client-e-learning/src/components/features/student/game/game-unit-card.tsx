"use client";

import type { GameUnitSummary } from "@/types/vocabulary-game";
import { Sparkles, Gamepad2 } from "lucide-react";
import Image from "next/image";

interface GameUnitCardProps {
  unit: GameUnitSummary;
  onSelectUnit: (unit: GameUnitSummary) => void;
}

const TOPIC_ASSETS = [
  "/assets/vocabulary/gardening.svg",
  "/assets/vocabulary/music.svg",
  "/assets/vocabulary/recycle.svg",
  "/assets/vocabulary/chess.svg",
  "/assets/vocabulary/healthy.svg",
  "/assets/vocabulary/helmet.svg",
  "/assets/vocabulary/omelette.svg",
];

/**
 * Maps unit code/title to approved educational SVG visuals from /assets/vocabulary/
 * per Leader guidance and student design system.
 */
function getVocabularyTopicVisual(code: string, name: string): string {
  const text = `${code} ${name}`.toLowerCase();
  if (text.includes("garden") || text.includes("plant") || text.includes("flower") || text.includes("vườn")) {
    return "/assets/vocabulary/gardening.svg";
  }
  if (text.includes("music") || text.includes("art") || text.includes("âm nhạc") || text.includes("song")) {
    return "/assets/vocabulary/music.svg";
  }
  if (text.includes("recycle") || text.includes("green") || text.includes("môi trường") || text.includes("rác")) {
    return "/assets/vocabulary/recycle.svg";
  }
  if (text.includes("chess") || text.includes("game") || text.includes("cờ") || text.includes("play")) {
    return "/assets/vocabulary/chess.svg";
  }
  if (text.includes("health") || text.includes("fit") || text.includes("sức khỏe") || text.includes("sport")) {
    return "/assets/vocabulary/healthy.svg";
  }
  if (text.includes("helmet") || text.includes("traffic") || text.includes("giao thông") || text.includes("mũ")) {
    return "/assets/vocabulary/helmet.svg";
  }
  if (text.includes("food") || text.includes("egg") || text.includes("omelette") || text.includes("nấu") || text.includes("món")) {
    return "/assets/vocabulary/omelette.svg";
  }

  // Deterministic fallback based on character code sum
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TOPIC_ASSETS.length;
  return TOPIC_ASSETS[index];
}

export function GameUnitCard({ unit, onSelectUnit }: GameUnitCardProps) {
  const isAvailable = unit.vocabularyCount > 0;
  const visualSrc = unit.coverUrl || getVocabularyTopicVisual(unit.code, unit.name);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-ink/20 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-ink hover:shadow-pop">
      {/* Cover / Educational Visual Header */}
      <div className="relative h-40 w-full overflow-hidden bg-muted/40 border-b-2 border-ink/10 flex items-center justify-center p-2">
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <Image
            src={visualSrc}
            alt={unit.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>

        {/* Unit Code Badge */}
        <span className="student-pill absolute left-3 top-3 text-xs font-black bg-background/90 text-foreground border border-ink/20 shadow-xs backdrop-blur-sm">
          {unit.code}
        </span>

        {/* Word Count Badge */}
        <span className="student-pill absolute right-3 top-3 inline-flex items-center gap-1 text-xs font-black bg-primary text-primary-foreground border border-ink/20 shadow-xs backdrop-blur-sm">
          <Sparkles className="h-3 w-3" />
          {unit.vocabularyCount} từ vựng
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 gap-4">
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-foreground transition-colors group-hover:text-primary leading-tight">
            {unit.name}
          </h3>
          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {unit.description || "Luyện từ vựng theo chủ đề cùng các mini game sinh động."}
          </p>
        </div>

        <div className="pt-2 border-t border-ink/10">
          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => onSelectUnit(unit)}
            className="student-control student-control--action w-full min-h-[44px] inline-flex items-center justify-center gap-2 font-black text-sm"
          >
            <Gamepad2 className="h-4 w-4" />
            {isAvailable ? "Chọn trò chơi" : "Chưa có từ vựng"}
          </button>
        </div>
      </div>
    </div>
  );
}


