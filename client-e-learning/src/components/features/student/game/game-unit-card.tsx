"use client";

import type { GameUnitSummary } from "@/types/vocabulary-game";
import { Sparkles, BookA } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameUnitCardProps {
  unit: GameUnitSummary;
  onSelectUnit: (unit: GameUnitSummary) => void;
}

export function GameUnitCard({ unit, onSelectUnit }: GameUnitCardProps) {
  const isAvailable = unit.vocabularyCount > 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
      {/* Cover / Header Banner */}
      <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
        {unit.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unit.coverUrl}
            alt={unit.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookA className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-card/90 px-2.5 py-1 text-xs font-bold text-foreground backdrop-blur-sm">
          {unit.code}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground backdrop-blur-sm shadow-sm">
          <Sparkles className="h-3 w-3" />
          {unit.vocabularyCount} từ vựng
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
            {unit.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {unit.description || "Luyện từ vựng theo chủ đề cùng các mini game sinh động."}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-border/60">
          <Button
            type="button"
            className="w-full font-bold gap-2"
            disabled={!isAvailable}
            onClick={() => onSelectUnit(unit)}
          >
            {isAvailable ? "Chọn trò chơi" : "Chưa có từ vựng"}
          </Button>
        </div>
      </div>
    </div>
  );
}

