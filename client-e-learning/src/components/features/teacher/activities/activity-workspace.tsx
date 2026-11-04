"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { gradeService } from "@/services/grade.service";
import { unitService } from "@/services/content/content.unit.service";
import { activityService } from "@/services/activity.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { ActivityStatus } from "@/types/activity";
import { ActivityTable } from "./activity-table";
import { RegionState } from "@/components/feedback";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { TeacherPageHeader } from "@/components/features/teacher/shared/teacher-page-header";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

function SearchableSelect({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  items,
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  items: Array<{ id: string | number; label: string }>;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    items.find((item) => String(item.id) === String(value))?.label ?? placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 justify-between bg-background px-3 text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList className="max-h-56">
            <CommandEmpty className="p-3 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.label}
                  onSelect={() => {
                    onChange(String(item.id));
                    setOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      String(value) === String(item.id)
                        ? "text-primary opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ActivityWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const requestedUnitId = Number(params.get("unitId") || 0);
  const [gradeId, setGradeId] = useState<number>();
  const [unitId, setUnitId] = useState(requestedUnitId);
  const [status, setStatus] = useState<"ALL" | ActivityStatus>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const grades = useQuery({
    queryKey: ["grades"],
    queryFn: async () => (await gradeService.list()).data || [],
  });
  const activeGrade = gradeId || grades.data?.[0]?.id;
  const units = useQuery({
    queryKey: QUERY_KEYS.contentUnits(activeGrade || 0),
    queryFn: async () => (await unitService.list(activeGrade!)).data || [],
    enabled: !!activeGrade,
  });

  const selectedUnit =
    units.data?.find((u) => u.id === unitId) ??
    (requestedUnitId > 0
      ? units.data?.find((u) => u.id === requestedUnitId)
      : undefined) ??
    units.data?.[0];
  const includeArchived = status === "ARCHIVED";
  const activities = useQuery({
    queryKey: QUERY_KEYS.activities(selectedUnit?.id || 0, includeArchived),
    queryFn: async () =>
      (await activityService.list(selectedUnit!.id, includeArchived)).data ||
      [],
    enabled: !!selectedUnit,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (activities.data || [])
      .filter((a) => status === "ALL" || a.status === status)
      .filter(
        (a) =>
          !q || `${a.name} ${a.description || ""}`.toLowerCase().includes(q),
      )
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [activities.data, search, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const gradeItems = useMemo(
    () =>
      (grades.data || []).map((g) => ({
        id: g.id,
        label: g.name,
      })),
    [grades.data],
  );

  const unitItems = useMemo(
    () =>
      (units.data || []).map((u) => ({
        id: u.id,
        label: `${u.code} · ${u.name}`,
      })),
    [units.data],
  );

  const selectUnit = (id: number) => {
    setUnitId(id);
    setPage(1);
    const q = new URLSearchParams(params.toString());
    q.set("unitId", String(id));
    router.replace(`/teacher/activities?${q.toString()}`);
  };

  const createHref = selectedUnit
    ? `/teacher/activities/new?unitId=${selectedUnit.id}`
    : undefined;

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Activities"
        description="Create and manage learning activities for your units."
        pipoMood="wave"
        pipoSize={100}
      />

      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative w-full sm:w-[220px] sm:flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search activities..."
            aria-label="Search activities"
            className="h-10 w-full rounded-lg border border-border-input bg-background pl-9 pr-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </label>

        <SearchableSelect
          value={activeGrade ? String(activeGrade) : ""}
          onChange={(next) => {
            setGradeId(Number(next));
            setUnitId(0);
            setPage(1);
          }}
          placeholder="Select grade"
          searchPlaceholder="Tìm khối..."
          emptyText="Không tìm thấy khối"
          items={gradeItems}
          className="w-full sm:w-[160px]"
        />

        <SearchableSelect
          value={selectedUnit ? String(selectedUnit.id) : ""}
          onChange={(next) => selectUnit(Number(next))}
          placeholder="Select unit"
          searchPlaceholder="Tìm unit..."
          emptyText="Không tìm thấy unit"
          items={unitItems}
          disabled={!activeGrade}
          className="w-full sm:w-[220px]"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "ALL" | ActivityStatus);
            setPage(1);
          }}
          aria-label="Status"
          className="h-10 w-full rounded-lg border border-border-input bg-background px-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-[150px]"
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:w-full sm:ml-auto">
          {createHref ? (
            <Link
              href={createHref}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-body-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover sm:w-auto"
            >
              <Plus size={15} />
              Create Activity
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-primary/50 px-3 text-body-sm font-bold text-primary-foreground sm:w-auto"
            >
              <Plus size={15} />
              Create Activity
            </button>
          )}
        </div>
      </div>

      {!selectedUnit ? (
        <RegionState variant="empty" />
      ) : activities.isLoading ? (
        <SkeletonTable columns={5} />
      ) : activities.isError ? (
        <RegionState variant="error" />
      ) : visible.length === 0 ? (
        <RegionState
          variant="empty"
          action={
            <Link
              href={`/teacher/activities/new?unitId=${selectedUnit.id}`}
              className="inline-flex h-10 items-center rounded-xl border border-primary bg-primary px-4 text-body font-bold text-primary-foreground"
            >
              Create activity
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Activity list
                </h2>
                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "activity" : "activities"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {selectedUnit?.code} activities, sorted by most recently
                updated.
              </p>
            </div>
          </div>

          <ActivityTable
            activities={visible}
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            totalPages={pageCount}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        </section>
      )}
    </div>
  );
}
