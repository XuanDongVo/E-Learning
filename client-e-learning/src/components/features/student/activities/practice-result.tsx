"use client";

import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  Check,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegionState } from "@/components/feedback";
import type { ActivitySession, ActivitySessionReview, ActivityXpRewardReceipt } from "@/types/activity-session";
import { ActivityReviewDetails } from "./review/activity-review-details";

const blueBtn =
  "bg-learning text-primary-foreground shadow-pop-sm hover:bg-learning/90 hover:text-primary-foreground";
const paperBtn =
  "border-2 border-border bg-card-bg text-foreground shadow-pop-sm hover:bg-secondary hover:text-foreground";

export function PracticeResult({
  unitId,
  session,
  xpReward,
  xpRewardPending,
  xpRewardError,
  onRetryXpReward,
  review,
  reviewPending,
  reviewError,
  onRetryReview,
  onRetry,
}: {
  unitId: number;
  session: ActivitySession;
  xpReward?: ActivityXpRewardReceipt | null;
  xpRewardPending: boolean;
  xpRewardError?: string;
  onRetryXpReward: () => void;
  review?: ActivitySessionReview;
  reviewPending: boolean;
  reviewError?: string;
  onRetryReview: () => void;
  onRetry: () => void;
}) {
  const provisional = session.score == null;
  const score = Math.round(
    provisional ? (session.finalCorrectCount / Math.max(1, session.totalQuestions)) * 100 : Number(session.score),
  );
  const stars = score >= 90 ? 3 : score >= 60 ? 2 : score > 0 ? 1 : 0;
  const seconds =
    session.completedAt && session.startedAt
      ? Math.max(0, Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000))
      : undefined;
  const title =
    session.status === "GAME_OVER"
      ? "Hết mạng rồi!"
      : session.status === "ABANDONED"
        ? "Bạn đã nộp bài khi chưa làm hết"
        : "Hoàn thành luyện tập!";

  const stats = [
    { icon: Check, label: "Câu đúng (cuối cùng)", value: `${session.finalCorrectCount}/${session.totalQuestions}` },
    { icon: Target, label: "Đúng ngay lần đầu", value: `${session.firstCorrectCount}` },
    { icon: Lightbulb, label: "Gợi ý đã dùng", value: `${session.hintUsedCount}` },
    ...(seconds === undefined
      ? []
      : [{ icon: Timer, label: "Thời gian", value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` }]),
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <Trophy size={28} />
        </span>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm">
          Chế độ {session.mode === "LEARNING" ? "Luyện tập" : "Thử thách"} · {session.totalQuestions} câu hỏi
        </p>
        <div className="mt-3 flex justify-center gap-1">
          {[0, 1, 2].map((s) => (
            <Star
              key={s}
              size={30}
              className={s < stars ? "text-accent" : "text-muted-foreground/40"}
              fill={s < stars ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p className="mt-2 text-5xl font-extrabold text-learning">
          {score}
          <span className="text-xl text-muted-foreground">%</span>
        </p>
        {provisional && (
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Điểm tạm tính · lượt chưa hoàn thành không được lưu vào thống kê
          </p>
        )}
      </div>

      <XpRewardReceipt
        reward={xpReward}
        pending={xpRewardPending}
        error={xpRewardError}
        onRetry={onRetryXpReward}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border-2 border-border bg-background p-3 text-center">
            <s.icon size={18} className="mx-auto text-learning" />
            <p className="mt-1 text-lg font-extrabold">{s.value}</p>
            <p className="student-caption text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-2 font-extrabold">Chi tiết câu hỏi &amp; đáp án</h2>
        {reviewPending ? (
          <RegionState variant="loading" description="Đang tải lịch sử trả lời…" />
        ) : reviewError ? (
          <RegionState
            variant="error"
            description={reviewError}
            action={
              <Button variant="outline" size="sm" onClick={onRetryReview}>
                <RefreshCw size={15} /> Thử lại
              </Button>
            }
          />
        ) : review ? (
          <ActivityReviewDetails review={review} />
        ) : null}
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Button className={blueBtn} onClick={onRetry}>
          <RotateCcw size={16} />
          Luyện tập lại
        </Button>
        <Button
          nativeButton={false}
          render={<Link href={`/student/activity-sessions/${session.id}/review`} />}
          variant="outline"
          className={paperBtn}
        >
          Xem lại sau
        </Button>
        <Button
          nativeButton={false}
          render={<Link href={`/student/units/${unitId}`} />}
          variant="outline"
          className={paperBtn}
        >
          Về Unit
        </Button>
      </div>
    </div>
  );
}

function XpRewardReceipt({
  reward,
  pending,
  error,
  onRetry,
}: {
  reward?: ActivityXpRewardReceipt | null;
  pending: boolean;
  error?: string;
  onRetry: () => void;
}) {
  if (pending) {
    return (
      <section
        aria-label="Đang tải XP"
        className="animate-pulse rounded-2xl border border-accent/30 bg-accent-soft p-4"
      >
        <div className="h-4 w-28 rounded-full bg-accent/20" />
        <div className="mt-3 h-10 w-40 rounded-xl bg-accent/25" />
        <div className="mt-3 h-4 w-full rounded-full bg-accent/15" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-destructive/40 bg-destructive-soft p-4 text-sm">
        <p className="font-bold text-destructive">Chưa tải được kết quả XP</p>
        <p className="mt-1 text-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          <RefreshCw size={15} /> Thử lại
        </Button>
      </section>
    );
  }

  if (!reward) {
    return (
      <section className="rounded-2xl border border-border bg-background p-4 text-center text-sm text-muted-foreground">
        Lượt học này không thuộc chương trình Activity XP nên không có XP để hiển thị.
      </section>
    );
  }

  const forfeited = reward.status === "ABANDONED";
  return (
    <section className="overflow-hidden rounded-2xl border border-accent/40 bg-accent-soft">
      <div className="grid items-center gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
            {forfeited ? <Trophy size={22} /> : <Sparkles size={22} />}
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-accent-foreground">
              {forfeited ? "Lượt học kết thúc sớm" : "Activity XP đã chốt"}
            </p>
            <p className="text-4xl font-extrabold tabular-nums text-foreground">
              {forfeited ? "0" : `+${reward.committedXp}`}
              <span className="ml-1 text-lg">XP</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-xl bg-card/70 px-4 py-3 text-sm font-extrabold text-foreground">
          Level {reward.levelBefore}
          <ArrowRight size={16} aria-hidden="true" />
          Level {reward.levelAfter}
        </div>
      </div>
      <div className="grid gap-px border-t border-accent/30 bg-accent/20 sm:grid-cols-3">
        <RewardDetail label="Từ câu hỏi" value={`${reward.questionXp} XP`} />
        <RewardDetail label="Thưởng hoàn thành" value={`${reward.completionBonus} XP`} />
        <RewardDetail label="Tổng XP tích lũy" value={`${reward.lifetimeXpAfter} XP`} />
      </div>
      {forfeited && (
        <p className="border-t border-accent/30 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
          Lượt bỏ dở không chuyển XP tạm tính vào tài khoản.
        </p>
      )}
    </section>
  );
}

function RewardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/80 px-4 py-3 text-center">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-extrabold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
