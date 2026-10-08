"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Gamepad2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import type { Activity } from "@/types/activity";

export function ActivityHub({ unitId }: { unitId?: number }) {
  const activities = useQuery({
    queryKey: ["student-activities", unitId],
    queryFn: () => activityService.list(unitId!),
    enabled: !!unitId,
  });

  return (
    <main className="min-h-screen bg-background-app px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-body-sm font-bold uppercase tracking-[0.12em] text-primary">Activities</p>
          <h1 className="mt-2 text-display font-extrabold tracking-tight text-neutral-dark">Practice your English</h1>
          <p className="mt-3 text-body text-neutral-muted">
            Short activities to build vocabulary, grammar and confidence. Choose a challenge and start playing.
          </p>
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-ui-xl font-extrabold text-neutral-dark">Available activities</h2>
              <p className="mt-1 text-body-sm text-neutral-muted">
                {unitId ? "Activities from your selected unit." : "Open Activities from a Unit to see its activities."}
              </p>
            </div>
          </div>

          {!unitId && (
            <div className="mt-5 border border-border-color bg-card-bg p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-ui-lg font-extrabold text-neutral-dark">Choose a unit first</h3>
              <p className="mt-2 max-w-lg text-body-sm text-neutral-muted">
                Activities are scoped to a unit. Open a Unit and choose Activities to start a practice session.
              </p>
              <Link href="/student/units" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-body-sm font-bold text-primary-foreground hover:bg-primary-hover">
                Browse units <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {activities.isLoading && (
            <div className="mt-5 border border-border-color bg-card-bg p-8 text-body-sm text-neutral-muted">
              Loading activities…
            </div>
          )}

          {activities.isError && (
            <div role="alert" className="mt-5 border border-destructive/20 bg-danger-light p-5 text-body-sm text-danger-text">
              {activities.error.message}
            </div>
          )}

          {activities.data?.data && activities.data.data.length > 0 && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {activities.data.data.filter((activity) => activity.status === "PUBLISHED").map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}

          {activities.data?.data && activities.data.data.filter((activity) => activity.status === "PUBLISHED").length === 0 && (
            <div className="mt-5 border border-border-color bg-card-bg p-8 text-body-sm text-neutral-muted">
              No published activities are available for this unit yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const supportsPractice = activity.mode === "LEARNING" || activity.mode === "BOTH";
  const supportsTryHard = activity.mode === "TRY_HARD" || activity.mode === "BOTH";

  return (
    <article className="group border border-border-color bg-card-bg p-6 transition hover:border-primary/30">
      <div className="flex items-start justify-between gap-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-body-sm font-semibold text-neutral-muted">{activity.totalQuestions} questions</span>
      </div>

      <h3 className="mt-6 text-ui-xl font-extrabold tracking-tight text-neutral-dark">{activity.name}</h3>
      {activity.description && <p className="mt-2 line-clamp-2 text-body-sm leading-6 text-neutral-muted">{activity.description}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm text-neutral-muted">
        <span>{activity.unitName}</span>
        {supportsPractice && <span>Practice</span>}
        {supportsTryHard && <span>Try Hard</span>}
        {supportsTryHard && activity.timeLimitSeconds && (
          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {activity.timeLimitSeconds}s / question</span>
        )}
      </div>

      <div className="mt-6 border-t border-border-color pt-5">
        <Link
          href={"/student/activities/" + activity.id}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-body-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
        >
          Play activity <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
