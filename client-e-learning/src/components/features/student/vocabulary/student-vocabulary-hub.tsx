"use client";

import { useTranslations } from "next-intl";

import { useEffect, useMemo, useState } from "react";
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
  isVocabularyCardDue,
  nextVocabularyDueAt,
  type HubTab,
} from "./hub";

export function StudentVocabularyHub({
  unitId,
  initialTab = "browse",
}: {
  unitId: number;
  initialTab?: HubTab;
}) {
  const t = useTranslations("student.vocabulary.hub");
  const [tab, setTab] = useState<HubTab>(initialTab);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const validUnitId = Number.isSafeInteger(unitId) && unitId > 0;
  // const unitQuery = useQuery({
  //   queryKey: QUERY_KEYS.unitDetail(String(unitId)),
  //   queryFn: () => studentUnitService.getUnitDetail(unitId),
  //   enabled: validUnitId,
  // });

  const cardsQuery = useQuery({
    queryKey: vocabularyUnitCardsKey(unitId),
    queryFn: () => studentVocabularyReviewService.listUnitCards(unitId),
    enabled: validUnitId,
    refetchInterval: 30_000,
  });

  const cards = useMemo(() => cardsQuery.data?.data ?? [], [cardsQuery.data?.data]);

  const dueCards = useMemo(() => cards.filter((card) => isVocabularyCardDue(card, nowMs)), [cards, nowMs]);
  const nextDueAt = useMemo(() => nextVocabularyDueAt(cards, nowMs), [cards, nowMs]);

  useEffect(() => {
    if (nextDueAt === null) return;
    const timer = window.setTimeout(() => {
      setNowMs(Date.now());
      void cardsQuery.refetch();
    }, Math.min(2_147_000_000, Math.max(0, nextDueAt - Date.now() + 250)));
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextDueAt, unitId]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      setNowMs(Date.now());
      void cardsQuery.refetch();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  const pickTab = (next: HubTab) => {
    setTab(next);
  };



  if (!validUnitId) return <FullPageState variant="error" title={t("invalidUnit")} />;
  if (cardsQuery.isLoading )
    return <FullPageState variant="loading" title={t("loadingUnit")} />;

  if (cardsQuery.isError ) {
    const error = cardsQuery.error ;
    return (
      <PaperSurface as="section" className="space-y-3 p-6">
        <h1 className="student-card-title text-foreground">{t("loadError")}</h1>
        <p role="alert" className="student-body text-destructive">
          {error instanceof Error ? error.message : t("genericError")}
        </p>
        <button
          type="button"
          className="student-control student-control--action px-4"
          onClick={() => {
            void cardsQuery.refetch();
            // void unitQuery.refetch();
          }}
        >
          {t("retry")}
        </button>
      </PaperSurface>
    );
  }

  return (
    <main className="student-vocab student-vocab-unit mx-auto !max-w-4xl space-y-6 pb-10 p-1">
      <VocabularyHubHeader
        currentTab={tab}
        dueCount={dueCards.length}
        onSelectTab={pickTab}
      />

      {cards.length === 0 && tab !== "games" && (
        <PaperSurface className="space-y-2 p-8 text-center">
          <BookOpen className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="student-card-title text-foreground">{t("emptyTitle")}</h2>
          <p className="student-body text-muted-foreground">{t("emptyText")}</p>
        </PaperSurface>
      )}

      {cards.length > 0 && tab === "browse" && (
        <VocabularyBrowseTab
          cards={cards}
          nowMs={nowMs}
          onGoLearn={() => pickTab("learn")}
        />
      )}

      {(tab === "learn" || tab === "review") && cards.length > 0 && (
        <VocabularyStudyTab
          tab={tab}
          unitId={unitId}
          cards={cards}
          nowMs={nowMs}
        />
      )}

      {tab === "games" && <VocabularyGamesPanel unitId={unitId} wordCount={cards.length} />}
    </main>
  );
}
