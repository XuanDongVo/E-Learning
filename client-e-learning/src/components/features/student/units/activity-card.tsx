import { Link } from "@/i18n/navigation";
import { Clock3, Flame, Heart, Lightbulb, Play, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentActivity } from "@/types/student-unit";

const metaItem = "inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground";

export function ActivityCard({
  unitId,
  activity,
  topicNames,
}: {
  unitId: number;
  activity: StudentActivity;
  topicNames: string[] 
}) {
  const hasPractice = activity.mode !== "TRY_HARD";
  const hasTryHard = activity.mode !== "LEARNING";

  return (
    <article className="group flex flex-col gap-3.5 rounded-3xl border-2 border-border bg-card p-4 sm:p-5 shadow-pop transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-pop-lg">
      {/* ─── Top Header: Icon khối & Số câu hỏi ─── */}
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-border bg-primary-soft text-primary shadow-pop-sm">
          {hasTryHard ? (
            <Flame className="h-5 w-5 text-warning" aria-hidden="true" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          )}
        </span>

        <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary px-2.5 py-1 text-xs font-extrabold text-foreground shadow-pop-sm">
          <Zap className="h-3.5 w-3.5 text-warning" />
          {activity.totalQuestions} câu hỏi
        </span>
      </div>

      {/* ─── Tên & Mô tả hoạt động ─── */}
      <div>
        <h3 className="text-base font-extrabold text-foreground transition-colors group-hover:text-primary">
          {activity.name}
        </h3>
        {activity.description ? (
          <p className="mt-1 line-clamp-2 text-xs font-medium text-muted-foreground">
            {activity.description}
          </p>
        ) : (
          <p className="mt-1 text-xs italic text-muted-foreground/70">
            Thử thách bài tập rèn luyện kỹ năng và phản xạ.
          </p>
        )}
      </div>

      {/* ─── Tags chủ đề ─── */}
      {topicNames.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
          {topicNames.map((name) => (
            <li
              key={name}
              className="rounded-xl border border-border bg-secondary px-2.5 py-0.5 text-xs font-bold text-foreground shadow-pop-sm"
            >
              {name}
            </li>
          ))}
        </ul>
      )}

      {/* ─── Chế độ luyện tập (Mode Badges) ─── */}
      <div className="flex flex-wrap gap-1.5">
        {hasPractice && (
          <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info-soft px-2.5 py-0.5 text-xs font-extrabold text-info shadow-pop-sm">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Luyện tập
          </span>
        )}
        {hasTryHard && (
          <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning-soft px-2.5 py-0.5 text-xs font-extrabold text-warning shadow-pop-sm">
            <Flame className="h-3 w-3" aria-hidden="true" />
            Thử thách
          </span>
        )}
      </div>

      {/* ─── Thông số chi tiết: Mạng sống / Thời gian / Gợi ý ─── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
        {hasTryHard ? (
          <>
            {activity.timeLimitSeconds ? (
              <span className={metaItem}>
                <Clock3 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span>{activity.timeLimitSeconds}s / câu</span>
              </span>
            ) : null}
            {activity.lives ? (
              <span className={metaItem}>
                <Heart className="h-3.5 w-3.5 fill-pink text-pink" aria-hidden="true" />
                <span className="text-pink font-extrabold">{activity.lives} mạng</span>
              </span>
            ) : null}
          </>
        ) : (
          <span className={metaItem}>
            <Lightbulb className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
            <span>Có gợi ý & 1 lượt thử lại</span>
          </span>
        )}
      </div>

      {/* ─── Nút hành động 3D Tactile CTA ─── */}
      <div className="mt-auto border-t border-border pt-3">
        <Button
          asChild
          className="h-11 w-full gap-2 rounded-2xl border-2 border-ink bg-primary text-sm font-extrabold text-primary-foreground shadow-pop transition-all hover:bg-primary-hover active:translate-y-0.5 active:shadow-pop-sm"
        >
          <Link href={`/student/units/${unitId}/activities/${activity.id}`}>
            <span>Bắt đầu</span>
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
