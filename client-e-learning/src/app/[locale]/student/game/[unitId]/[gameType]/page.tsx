import { GameRunner } from "@/components/features/student/game/game-runner";
import type { GameType, GameMode, PronunciationAccent } from "@/types/vocabulary-game";

export default async function StudentGamePlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string; gameType: string }>;
  searchParams: Promise<{ mode?: string; accent?: string }>;
}) {
  const { unitId, gameType } = await params;
  const { mode, accent } = await searchParams;

  const validGameType: GameType =
    gameType === "WORD_RAIN" ? "WORD_RAIN" : "BUBBLE_POP";
  const validMode: GameMode = mode === "CHALLENGE" ? "CHALLENGE" : "PRACTICE";
  const validAccent: PronunciationAccent = accent === "UK" ? "UK" : "US";

  return (
    <GameRunner
      unitId={Number(unitId)}
      gameType={validGameType}
      mode={validMode}
      accent={validAccent}
    />
  );
}

