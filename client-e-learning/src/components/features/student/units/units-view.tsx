"use client";

import { useQuery } from "@tanstack/react-query";
import { studentUnitService } from "@/services/student-unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { Button } from "@/components/ui/button";
import { UnitCard } from "./unit-card";

export function UnitsView() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.units,
    queryFn: studentUnitService.list,
  });

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 p-4 pb-24 sm:p-5 lg:p-6 lg:pb-6">
      <header>
        <p className="text-body-sm font-extrabold uppercase tracking-wider text-primary">My learning</p>
        <h1 className="text-ui-2xl font-extrabold tracking-tight text-neutral-dark">Your units</h1>
        <p className="mt-0.5 text-body font-medium text-neutral-muted">
          Choose a unit to see its sections and activities.
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading units">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      )}

      {isError && (
        <div role="alert" className="space-y-3 rounded-2xl border border-border-color bg-card-bg p-8 text-center">
          <p className="text-body font-semibold text-neutral-dark">Couldn&apos;t load your units.</p>
          <p className="text-body-sm text-neutral-muted">{error.message}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-2xl border border-border-color bg-card-bg p-8 text-center">
          <p className="text-body font-semibold text-neutral-dark">No units yet</p>
          <p className="mt-1 text-body-sm text-neutral-muted">Your teacher hasn&apos;t published any units for your class.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}
