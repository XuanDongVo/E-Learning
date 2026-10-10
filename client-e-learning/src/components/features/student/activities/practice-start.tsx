"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import garden from "../../../../../public/assets/practice-garden.jpg";
import type {
  ActivitySessionMode,
  ActivitySessionOptions,
  SelectionStrategy,
} from "@/types/activity-session";

const blueBtn =
  "text-practice-light bg-practice-blue shadow-[0_2px_0_var(--color-practice-blue-dark)] hover:text-practice-light hover:bg-practice-blue-dark";
const glassBtn =
  "text-practice-light bg-practice-blue/28 border-practice-light/30 hover:bg-practice-blue/65 hover:text-practice-light";
const card = "bg-practice-paper shadow-[0_6px_0_var(--color-practice-shadow)]";

const MODES: Record<ActivitySessionMode, { title: string; desc: string }> = {
  LEARNING: {
    title: "Luyện tập",
    desc: "Không bấm giờ · được thử lại 1 lần · có gợi ý",
  },
  TRY_HARD: {
    title: "Thử thách",
    desc: "Bấm giờ từng câu · có số mạng · không thử lại",
  },
};

const STRATEGIES: Record<SelectionStrategy, { title: string; desc: string }> = {
  RANDOM: { title: "Ngẫu nhiên", desc: "Trộn đều các câu hỏi hiện có." },
  WEAKNESS_PRIORITY: {
    title: "Ưu tiên phần còn yếu",
    desc: "Ưu tiên những câu bạn cần luyện thêm.",
  },
};

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
      className={`flex min-h-[72px] w-full items-center justify-between gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
        active
          ? "border-practice-blue bg-practice-hint shadow-[0_3px_0_var(--color-practice-blue-dark)]"
          : "border-practice-border bg-practice-light shadow-[0_3px_0_var(--color-practice-border)] hover:border-practice-blue"
      }`}
    >
      <span>
        <span className="block text-base font-extrabold">{title}</span>
        <span className="block text-sm text-practice-subtle">{desc}</span>
      </span>
      {icon}
    </button>
  );
}

export function PracticeStart(p: Props) {
  const modes = (["LEARNING", "TRY_HARD"] as const).filter(
    (m) => p.options?.activityMode === "BOTH" || p.options?.activityMode === m,
  );
  const strategies = p.options?.selectionStrategies ?? [];
  const difficultyLabels = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó", MIXED: "Hỗn hợp" } as const;
  const ready = !!p.mode && !!p.strategy && !!p.options;

  return (
    <section
      className="fixed inset-0 z-[45] overflow-y-auto bg-practice-blue text-practice-ink"
      aria-label="Bắt đầu luyện tập"
    >
      <img
        src={garden.src}
        alt=""
        width={1920}
        height={1024}
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div className="relative mx-auto flex min-h-svh max-w-[640px] flex-col px-4 pb-6 pt-7">
        <div>
          <Button asChild variant="outline" className={`${glassBtn} px-3`}>
            <Link href={`/student/units/${p.unitId}`}>
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </Link>
          </Button>
        </div>

        <div className={`${card} mt-6 rounded-[24px] p-5`}>
          <h1 className="text-xl font-extrabold">Chọn cách luyện tập</h1>

          {p.loading && (
            <p role="status" className="mt-4 text-sm font-semibold">
              Đang tải cấu hình hoạt động…
            </p>
          )}

          {p.loadError && (
            <div role="alert" className="mt-4 text-sm font-semibold">
              <p className="text-practice-bad">{p.loadError}</p>
              <Button className={`${blueBtn} mt-3`} onClick={p.onReload}>
                Thử lại
              </Button>
            </div>
          )}

          {p.options && (
            <>
              <div className="mt-4 rounded-xl border-2 border-practice-border bg-practice-light px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-practice-subtle">Độ khó câu hỏi</p>
                <p className="mt-1 text-base font-extrabold">{difficultyLabels[p.options.questionDifficulty]}</p>
                <p className="mt-1 text-sm text-practice-subtle">Độ khó do giáo viên thiết lập cho hoạt động này.</p>
              </div>
              <div className="mt-4 grid gap-3">
                {modes.map((m) => (
                  <Choice
                    key={m}
                    active={p.mode === m}
                    title={MODES[m].title}
                    desc={
                      m === "TRY_HARD"
                        ? [
                            MODES[m].desc,
                            p.options?.timeLimitSeconds
                              ? `${p.options.timeLimitSeconds}s/câu`
                              : null,
                            p.options?.lives ? `${p.options.lives} mạng` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : MODES[m].desc
                    }
                    icon={
                      m === "LEARNING" ? (
                        <Sparkles size={20} className="shrink-0 text-practice-blue" />
                      ) : (
                        <span className="flex shrink-0 gap-1 text-practice-subtle">
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
                  <h2 className="mt-6 text-base font-extrabold">Trọng tâm câu hỏi</h2>
                  <div className="mt-3 grid gap-3">
                    {strategies.map((s) => (
                      <Choice
                        key={s}
                        active={p.strategy === s}
                        title={STRATEGIES[s].title}
                        desc={STRATEGIES[s].desc}
                        onClick={() => p.onStrategyChange(s)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {p.starting && p.slow && (
            <p role="status" className="mt-4 text-sm font-semibold">
              Máy chủ phản hồi chậm, vui lòng chờ thêm chút…
            </p>
          )}
          {p.startError && (
            <p role="alert" className="mt-4 text-sm font-semibold text-practice-bad">
              {p.startError}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              className={blueBtn}
              disabled={!ready || p.starting}
              onClick={p.onStart}
            >
              {p.starting ? "Đang bắt đầu…" : p.startError ? "Thử lại" : "Bắt đầu luyện tập"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
