"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lightbulb, ListTree, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchStudentUnit } from "@/services/student-unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { ActivityCard } from "./activity-card";
import { UnitCover, unitLabel } from "./unit-cover";

type Filter = number | "all";

const chipBase = "rounded-full border px-3.5 py-1.5 text-body font-medium transition-colors";
const chipOn = "border-primary bg-primary font-bold text-white";
const chipOff = "border-border-color bg-card-bg text-neutral-dark hover:border-primary";

export function UnitDetailView({ unitId }: { unitId: number }) {
  const [sectionId, setSectionId] = useState<Filter>("all");
  const [topicId, setTopicId] = useState<Filter>("all");

  const { data: unit, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.unitDetail(String(unitId)),
    queryFn: () => fetchStudentUnit(unitId),
  });

  // Activity chỉ biết topicIds → suy ra Section/Topic từ cây Section → Topic.
  const topicName = useMemo(() => {
    const map = new Map<number, string>();
    unit?.sections.forEach((s) => s.topics.forEach((t) => map.set(t.id, t.name)));
    return map;
  }, [unit]);

  const activitiesIn = (ids: number[]) =>
    (unit?.activities ?? []).filter((a) => a.topicIds.some((id) => ids.includes(id)));

  const selectedSection = unit?.sections.find((s) => s.id === sectionId);
  const visible = useMemo(() => {
    if (!unit) return [];
    if (topicId !== "all") return unit.activities.filter((a) => a.topicIds.includes(topicId));
    if (selectedSection) {
      const ids = selectedSection.topics.map((t) => t.id);
      return unit.activities.filter((a) => a.topicIds.some((id) => ids.includes(id)));
    }
    return unit.activities;
  }, [unit, selectedSection, topicId]);

  const pickSection = (id: Filter) => {
    setSectionId(id);
    setTopicId("all");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-4 p-4 sm:p-5 lg:p-6" role="status" aria-label="Loading unit">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-9 w-2/3 animate-pulse rounded-full bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="mx-auto max-w-[1100px] p-4 sm:p-5 lg:p-6">
        <div role="alert" className="space-y-3 rounded-2xl border border-border-color bg-card-bg p-8 text-center">
          <p className="text-body font-semibold text-neutral-dark">Couldn&apos;t load this unit.</p>
          <p className="text-body-sm text-neutral-muted">{error?.message}</p>
          <div className="flex justify-center gap-2">
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/student/units">My units</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const label = unitLabel(unit.displayOrder);
  const topicCount = unit.sections.reduce((sum, s) => sum + s.topics.length, 0);

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 p-4 pb-24 sm:p-5 lg:p-6 lg:pb-6">
      <Link
        href="/student/units"
        className="inline-flex items-center gap-1 text-body font-medium text-neutral-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My units
      </Link>

      <section className="flex flex-col overflow-hidden rounded-2xl border border-border-color bg-card-bg shadow-2xs sm:flex-row">
        <UnitCover
          label={label}
          name={unit.name}
          coverUrl={unit.coverUrl}
          className="h-36 shrink-0 sm:h-auto sm:w-52"
        />
        <div className="flex flex-col gap-2 p-4 sm:p-5">
          <p className="text-body-sm font-extrabold uppercase tracking-wider text-primary">Unit {label}</p>
          <h1 className="text-ui-2xl font-extrabold tracking-tight text-neutral-dark">{unit.name}</h1>
          {unit.description && <p className="text-body text-neutral-muted">{unit.description}</p>}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-body-sm font-medium text-neutral-muted">
            <span className="inline-flex items-center gap-1.5">
              <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
              {unit.sections.length} sections
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              {topicCount} topics
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              {unit.activities.length} activities
            </span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Sections">
        <button
          type="button"
          aria-pressed={sectionId === "all"}
          className={cn(chipBase, sectionId === "all" ? chipOn : chipOff)}
          onClick={() => pickSection("all")}
        >
          Overview <span className="ml-1 opacity-75">{unit.activities.length}</span>
        </button>
        {unit.sections.map((section) => (
          <button
            key={section.id}
            type="button"
            aria-pressed={sectionId === section.id}
            className={cn(chipBase, sectionId === section.id ? chipOn : chipOff)}
            onClick={() => pickSection(section.id)}
          >
            {section.name}
            <span className="ml-1 opacity-75">{activitiesIn(section.topics.map((t) => t.id)).length}</span>
          </button>
        ))}
      </div>

      {selectedSection && selectedSection.topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Topics">
          <span className="mr-1 text-body-sm text-neutral-muted">Topics</span>
          {(["all", ...selectedSection.topics] as const).map((t) => {
            const id: Filter = t === "all" ? "all" : t.id;
            const on = topicId === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setTopicId(id)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-body-sm transition-colors",
                  on ? "border-primary bg-primary-light font-bold text-primary" : "border-border-color bg-card-bg text-neutral-dark hover:border-primary",
                )}
              >
                {t === "all" ? "All topics" : t.name}
              </button>
            );
          })}
        </div>
      )}

      <section aria-live="polite">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-section-title font-extrabold text-neutral-dark">
            {selectedSection ? `${selectedSection.name} activities` : "All activities"}
          </h2>
          <span className="text-body text-neutral-muted">{visible.length}</span>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-border-color bg-card-bg p-8 text-center">
            <p className="text-body font-semibold text-neutral-dark">No activities yet</p>
            <p className="mt-1 text-body-sm text-neutral-muted">
              Your teacher hasn&apos;t published activities for this topic.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                topicNames={activity.topicIds.map((id) => topicName.get(id)).filter((n): n is string => !!n)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
