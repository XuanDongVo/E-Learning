"use client";

import { useTranslations } from "next-intl";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock3, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import garden from "../../../../../public/assets/practice-garden.jpg";
import type {
  ActivitySessionMode,
  ActivitySessionOptions,
  SelectionStrategy,
} from "@/types/activity-session";
import { RegionState } from "@/components/feedback";
import { SkeletonCard } from "@/components/ui/skeleton/skeleton-card";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

const blueBtn = "student-control student-control--action";
const glassBtn = "student-control student-control--quiet";

type Props = {
  unitId: number;
  options?: ActivitySessionOptions;
  loading: boolean;
  loadError?: string;
  onReload: () => void;
  mode?: ActivitySessionMode;
  onModeChange: (mode: ActivitySessionMode) => void;
  strategy?: SelectionStrategy;
  onStrategyChange: (strategy: SelectionStrategy) => void;
  starting: boolean;
  slow: boolean;
  startError?: string;
  onStart: () => void;
};

function Choice({
  active,
  title,
  desc,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`student-practice-choice ${
        active
          ? "student-practice-choice--active"
          : ""
      }`}
    >
      <span>
        <span className="student-label block">{title}</span>
        <span className="student-body block text-muted-foreground">{desc}</span>
      </span>
      {icon}
    </button>
  );
}

export function PracticeStart(p: Props) {
  const t = useTranslations("student.activities.start");
  const modes = (["LEARNING", "TRY_HARD"] as const).filter(
    (m) => p.options?.activityMode === "BOTH" || p.options?.activityMode === m,
  );
  const strategies = p.options?.selectionStrategies ?? [];
  const ready = !!p.mode && !!p.strategy && !!p.options;

  return (
    <section
      className="student-practice-runtime fixed inset-0 z-[45] overflow-y-auto bg-learning text-foreground"
      aria-label={t("aria")}
    >
      <Image
        src={garden}
        alt=""
        width={1920}
        height={1024}
        priority
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div className="student-practice-start-layout relative mx-auto flex min-h-svh flex-col px-4 pb-6 pt-7">
        <div>
           <Link href={`/student/units/${p.unitId}`}>
          <Button  variant="outline" className={`${glassBtn} px-3`}>
              <ArrowLeft size={16} />
              <span>{t("back")}</span>
          </Button>
           </Link>
        </div>

        <PaperSurface as="section" tape tapePosition="right" className="student-practice-start-card mt-6 p-5">
          <ScrapbookHeading as="h1" className="student-section-title">{t("title")}</ScrapbookHeading>

          {p.loading && (
            <SkeletonCard className="mt-4" lines={4} />
          )}

          {p.loadError && (
            <RegionState
              className="mt-4"
              variant="error"
              description={p.loadError}
              action={<Button className={`${blueBtn} mt-3`} onClick={p.onReload}>{t("retry")}</Button>}
            />
          )}

          {p.options && (
            <>
              <div className="student-soft-panel mt-4 px-4 py-3">
                <p className="student-meta text-muted-foreground">{t("difficultyLabel")}</p>
                <p className="student-label mt-1">{t(`difficulty.${p.options.questionDifficulty}`)}</p>
                <p className="student-body mt-1 text-muted-foreground">{t("difficultyHint")}</p>
              </div>
              <div className="mt-4 grid gap-3 ">
                {modes.map((m) => (
                  <Choice 
                    key={m}
                    active={p.mode === m}
                    title={t(`modes.${m}.title`)}
                    desc={
                      m === "TRY_HARD"
                        ? [
                            t(`modes.${m}.description`),
                            p.options?.timeLimitSeconds
                              ? t("perQuestion", { count: p.options.timeLimitSeconds })
                              : null,
                            p.options?.lives ? t("lives", { count: p.options.lives }) : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : t(`modes.${m}.description`)
                    }
                    icon={
                      m === "LEARNING" ? (
                        <Sparkles size={20} className="shrink-0 text-learning" />
                      ) : (
                        <span className="flex shrink-0 gap-1 text-muted-foreground">
                          <Clock3 size={20} />
                          <Heart size={20} />
                        </span>
                      )
                    }
                    onClick={() => p.onModeChange(m)}
                  />
                ))}
              </div>

              {strategies.length > 1 && (
                <>
                  <h2 className="student-card-title mt-6">{t("questionFocus")}</h2>
                  <div className="mt-3 grid gap-3">
                    {strategies.map((s) => (
                      <Choice
                        key={s}
                        active={p.strategy === s}
                        title={t(`strategies.${s}.title`)}
                        desc={t(`strategies.${s}.description`)}
                        onClick={() => p.onStrategyChange(s)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {p.starting && p.slow && (
            <p role="status" className="student-label mt-4">
              {t("slow")}
            </p>
          )}
          {p.startError && (
            <p role="alert" className="student-label mt-4 text-destructive">
              {p.startError}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              className={blueBtn}
              disabled={!ready || p.starting}
              onClick={p.onStart}
            >
              {p.starting ? t("starting") : p.startError ? t("retry") : t("startButton")}
            </Button>
          </div>
        </PaperSurface>
      </div>
    </section>
  );
}
