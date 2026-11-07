import { Link } from "@/i18n/navigation";
import {
  Clock3,
  Flame,
  Heart,
  Lightbulb,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import type { StudentActivity } from "@/types/student-unit";
import { PaperSurface } from "@/components/student-ui/paper-surface";

const metaItem =
  "student-meta inline-flex items-center gap-1.5 text-muted-foreground";

export function ActivityCard({
  unitId,
  activity,
  topicNames,
}: {
  unitId: number;
  activity: StudentActivity;
  topicNames: string[];
}) {
  const hasPractice = activity.mode !== "TRY_HARD";
  const hasTryHard = activity.mode !== "LEARNING";

  return (
    <PaperSurface as="article" interactive className="student-activity-card group flex flex-col gap-4 p-4 sm:p-5">
      {/* ─── Top Header: Icon khối & Số câu hỏi ─── */}
      <div className="flex items-center justify-between">
        <span className="student-activity-card__icon">
          {hasTryHard ? (
            <Flame className="h-5 w-5 text-warning" aria-hidden="true" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          )}
        </span>

        <span className="student-chip">
          <Zap className="h-3.5 w-3.5 text-warning" />
          {activity.totalQuestions} câu hỏi
        </span>
      </div>

      {/* ─── Tên & Mô tả hoạt động ─── */}
      <div>
        <h3 className="student-card-title text-foreground transition-colors group-hover:text-primary">
          {activity.name}
        </h3>
        {activity.description ? (
          <p className="student-body mt-1 line-clamp-2 text-muted-foreground">
            {activity.description}
          </p>
        ) : (
          <p className="student-body mt-1 italic text-muted-foreground/70">
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
              className="student-chip"
            >
              {name}
            </li>
          ))}
        </ul>
      )}

      {/* ─── Chế độ luyện tập (Mode Badges) ─── */}
      <div className="flex flex-wrap gap-1.5">
        {hasPractice && (
          <span className="student-chip border-info bg-info-soft text-info">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Luyện tập
          </span>
        )}
        {hasTryHard && (
          <span className="student-chip border-warning bg-warning-soft text-warning">
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
                <Clock3
                  className="h-3.5 w-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span>{activity.timeLimitSeconds}s / câu</span>
              </span>
            ) : null}
            {activity.lives ? (
              <span className={metaItem}>
                <Heart
                  className="h-3.5 w-3.5 fill-destructive text-destructive"
                  aria-hidden="true"
                />
                <span className="font-extrabold text-destructive">
                  {activity.lives} mạng
                </span>
              </span>
            ) : null}
          </>
        ) : (
          <span className={metaItem}>
            <Lightbulb
              className="h-3.5 w-3.5 text-warning"
              aria-hidden="true"
            />
            <span>Có gợi ý & 1 lượt thử lại</span>
          </span>
        )}
      </div>

      {/* ─── Nút hành động 3D Tactile CTA ─── */}
      <div className="mt-auto border-t border-border pt-3">
        <Link
          href={`/student/units/${unitId}/activities/${activity.id}`}
          className="student-control student-control--action w-full"
        >
            <span>Bắt đầu</span>
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        </Link>
      </div>
    </PaperSurface>
  );
}
