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
import { useTranslations } from "next-intl";

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
    items.find((item) => String(item.id) === String(value))?.label ??
    placeholder;

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

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0"
        align="start"
      >
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
  const t = useTranslations("teacher.activities.workspace");
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
    queryKey: ["teacher", "activities", "grades"],
    queryFn: async () => {
      const response = await gradeService.list();

      if (!Array.isArray(response.data)) {
        console.error("Invalid grades response:", response);
        throw new Error("INVALID_GRADES_RESPONSE");
      }

      return response.data;
    },
  });
  const activeGrade = gradeId || grades.data?.[0]?.id;

  const units = useQuery({
    queryKey: QUERY_KEYS.contentUnits(activeGrade ?? 0),
    queryFn: async () => {
      const response = await unitService.list(activeGrade!);

      if (!Array.isArray(response.data)) {
        console.error("Invalid units response:", response);
        throw new Error("INVALID_UNITS_RESPONSE");
      }

      return response.data;
    },
    enabled: activeGrade != null,
  });

  const selectedUnit =
    units.data?.find((u) => u.id === unitId) ??
    (requestedUnitId > 0
      ? units.data?.find((u) => u.id === requestedUnitId)
      : undefined) ??
    units.data?.[0];

  const includeArchived = status === "ARCHIVED";

  const activities = useQuery({
    queryKey: QUERY_KEYS.activities(selectedUnit?.id ?? 0, includeArchived),
    queryFn: async () => {
      const response = await activityService.list(
        selectedUnit!.id,
        includeArchived,
      );

      if (!Array.isArray(response.data)) {
        console.error("Invalid activities response:", response);
        throw new Error("INVALID_ACTIVITIES_RESPONSE");
      }

      return response.data;
    },
    enabled: selectedUnit != null,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const data = Array.isArray(activities.data) ? activities.data : [];

    return data
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
      (Array.isArray(grades.data) ? grades.data : []).map((g) => ({
        id: g.id,
        label: g.name,
      })),
    [grades.data],
  );

  const unitItems = useMemo(
    () =>
      (Array.isArray(units.data) ? units.data : []).map((u) => ({
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
        title={t("title")}
        description={t("description")}
        pipoMood="wave"
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
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
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
          placeholder={t("selectGrade")}
          searchPlaceholder={t("searchGrade")}
          emptyText={t("gradeNotFound")}
          items={gradeItems}
          className="w-full sm:w-[160px]"
        />

        <SearchableSelect
          value={selectedUnit ? String(selectedUnit.id) : ""}
          onChange={(next) => selectUnit(Number(next))}
          placeholder={t("selectUnit")}
          searchPlaceholder={t("searchUnit")}
          emptyText={t("unitNotFound")}
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
          aria-label={t("statusLabel")}
          className="h-10 w-full rounded-lg border border-border-input bg-background px-3 text-body outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-[150px]"
        >
          <option value="ALL">{t("statuses.all")}</option>
          <option value="DRAFT">{t("statuses.draft")}</option>
          <option value="PUBLISHED">{t("statuses.published")}</option>
          <option value="ARCHIVED">{t("statuses.archived")}</option>
        </select>

        <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:w-full sm:ml-auto">
          {createHref ? (
            <Link
              href={createHref}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-body-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover sm:w-auto"
            >
              <Plus size={15} />
              {t("createActivity")}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-primary/50 px-3 text-body-sm font-bold text-primary-foreground sm:w-auto"
            >
              <Plus size={15} />
              {t("createActivity")}
            </button>
          )}
        </div>
      </div>

      {grades.isLoading || units.isLoading || activities.isLoading ? (
        <SkeletonTable columns={5} />
      ) : grades.isError || units.isError || activities.isError ? (
        <RegionState
          variant="error"
          title={t("loadErrorTitle")}
          description={t("loadErrorDescription")}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (grades.isError) void grades.refetch();
                if (units.isError) void units.refetch();
                if (activities.isError) void activities.refetch();
              }}
            >
              {t("retry")}
            </Button>
          }
        />
      ) : !selectedUnit ? (
        <RegionState
          variant="empty"
          title={t("noUnitTitle")}
          description={t("noUnitDescription")}
        />
      ) : visible.length === 0 ? (
        <RegionState
          variant="empty"
          action={
            <Link
              href={`/teacher/activities/new?unitId=${selectedUnit.id}`}
              className="inline-flex h-10 items-center rounded-xl border border-primary bg-primary px-4 text-body font-bold text-primary-foreground"
            >
              {t("createActivity")}
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  {t("listTitle")}
                </h2>
                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {filtered.length}{" "}
                  {t("activityCount", { count: filtered.length })}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {t("sortedDescription", { unitCode: selectedUnit?.code ?? "" })}
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
