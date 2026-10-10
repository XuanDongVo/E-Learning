import Link from "next/link";
import { Clock3, Flame, Heart, Lightbulb, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentActivity } from "@/types/student-unit";

const metaItem = "inline-flex items-center gap-1.5";

export function ActivityCard({unitId, activity, topicNames }: { unitId: number; activity: StudentActivity; topicNames: string[] }) {
  const hasPractice = activity.mode !== "TRY_HARD";
  const hasTryHard = activity.mode !== "LEARNING";
  const difficultyLabels = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard", MIXED: "Mixed" } as const;
  const difficultyStyles = {
    EASY: "bg-success/10 text-success",
    MEDIUM: "bg-accent-light text-amber-700",
    HARD: "bg-danger-light text-danger-text",
    MIXED: "bg-background-app text-neutral-dark",
  } as const;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border-color bg-card-bg p-4 shadow-2xs transition-all hover:border-primary hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-body-sm font-medium text-neutral-muted">{activity.totalQuestions} questions</span>
      </div>

      <div>
        <h3 className="text-card-title font-extrabold text-neutral-dark">{activity.name}</h3>
        {activity.description && (
          <p className="mt-1 line-clamp-2 text-body text-neutral-muted">{activity.description}</p>
        )}
      </div>

      {topicNames.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
          {topicNames.map((name) => (
            <li key={name} className="rounded-full bg-background-app px-2.5 py-0.5 text-body-sm text-neutral-dark ring-1 ring-border-color">
              {name}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-1.5">
        {hasPractice && (
          <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-0.5 text-body-sm font-bold text-info">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Practice
          </span>
        )}
        {hasTryHard && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-0.5 text-body-sm font-bold text-amber-700">
            <Flame className="h-3 w-3" aria-hidden="true" />
            Try Hard
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm font-medium text-neutral-muted">
        {hasTryHard ? (
          <>
            {activity.timeLimitSeconds ? (
              <span className={metaItem}>
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {activity.timeLimitSeconds}s / question
              </span>
            ) : null}
            {activity.lives ? (
              <span className={metaItem}>
                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                {activity.lives} lives
              </span>
            ) : null}
          </>
        ) : (
          <span className={metaItem}>
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            Hints and 1 retry
          </span>
        )}
      </div>

      <div className="mt-auto border-t border-border-color pt-3">
        <Button asChild className="h-10 w-full rounded-xl bg-primary text-body font-bold text-white shadow-none hover:bg-primary-hover">
          <Link href={`/student/units/${unitId}/activities/${activity.id}`}>
            Start
            <Play className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
