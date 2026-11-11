"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { FullPageState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { studentUnitService } from "@/services/student/student-unit.service";
import { studentVocabularyReviewService } from "@/services/student/student-vocabulary-review.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { VocabularyGamesPanel } from "./vocabulary-games-panel";
import {
  VocabularyBrowseTab,
  VocabularyHubHeader,
  VocabularyStudyTab,
  vocabularyUnitCardsKey,
  type HubTab,
} from "./hub";

export function StudentVocabularyHub({
  unitId,
  initialTab = "browse",
}: {
  unitId: number;
  initialTab?: HubTab;
}) {
  const [tab, setTab] = useState<HubTab>(initialTab);

  const validUnitId = Number.isSafeInteger(unitId) && unitId > 0;
  const unitQuery = useQuery({
    queryKey: QUERY_KEYS.unitDetail(String(unitId)),
    queryFn: () => studentUnitService.getUnitDetail(unitId),
    enabled: validUnitId,
  });

  const cardsQuery = useQuery({
    queryKey: vocabularyUnitCardsKey(unitId),
    queryFn: () => studentVocabularyReviewService.listUnitCards(unitId),
    enabled: validUnitId,
    refetchInterval: 30_000,
  });

  const unit = unitQuery.data?.data;
  const cards = useMemo(() => cardsQuery.data?.data ?? [], [cardsQuery.data?.data]);

  const dueCards = useMemo(() => cards.filter((card) => card.state !== "NEW" && card.due), [cards]);

  const pickTab = (next: HubTab) => {
    setTab(next);
  };



  if (!validUnitId) return <FullPageState variant="error" title="Unit không hợp lệ" />;
  if (cardsQuery.isLoading || unitQuery.isLoading)
    return <FullPageState variant="loading" title="Đang mở sổ từ vựng" />;

  if (cardsQuery.isError || unitQuery.isError || !unit) {
    const error = cardsQuery.error ?? unitQuery.error;
    return (
      <PaperSurface as="section" className="space-y-3 p-6">
        <h1 className="student-card-title text-foreground">Không mở được sổ từ vựng</h1>
        <p role="alert" className="student-body text-destructive">
          {error instanceof Error ? error.message : "Vui lòng thử lại sau."}
        </p>
        <button
          type="button"
          className="student-control student-control--action px-4"
          onClick={() => {
            void cardsQuery.refetch();
            void unitQuery.refetch();
          }}
        >
          Thử lại
        </button>
      </PaperSurface>
    );
  }

  return (
    <main className="student-vocab student-vocab-unit mx-auto !max-w-4xl space-y-6 pb-10">
      <VocabularyHubHeader
        currentTab={tab}
        dueCount={dueCards.length}
        onSelectTab={pickTab}
      />

      {cards.length === 0 && tab !== "games" && (
        <PaperSurface className="space-y-2 p-8 text-center">
          <BookOpen className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="student-card-title text-foreground">Unit này chưa có từ vựng đang dùng</h2>
          <p className="student-body text-muted-foreground">Hãy quay lại khi giáo viên cập nhật bộ từ nhé.</p>
        </PaperSurface>
      )}

      {cards.length > 0 && tab === "browse" && (
        <VocabularyBrowseTab
          cards={cards}
          onGoLearn={() => pickTab("learn")}
        />
      )}

      {(tab === "learn" || tab === "review") && cards.length > 0 && (
        <VocabularyStudyTab
          tab={tab}
          unitId={unitId}
          cards={cards}
        />
      )}

      {tab === "games" && <VocabularyGamesPanel unitId={unitId} wordCount={cards.length} />}
    </main>
  );
}
