"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Search, RefreshCw } from "lucide-react";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { studentUnitService } from "@/services/student/student-unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { StudentButton } from "@/components/student-ui/student-button";
import { StudentTextField } from "@/components/student-ui/student-text-field";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";
import { UnitCard } from "./unit-card";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";

export function UnitsView() {
  const tErrors = useTranslations("errors");
  const t = useTranslations("student.learning.units");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.units,
    queryFn: studentUnitService.list,
  });

  const units = response?.data ?? [];

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  return (
    <div className="student-units-page mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <PaperSurface as="section" variant="kraft" emphasis="accent" className="student-units-hero">
        <StudentPageHeading
          eyebrow={t("eyebrow")}
          title={<>{t("titlePrefix")} <span className="student-highlight">Unit</span> {t("titleSuffix")}</>}
          description={t("intro")}
          artwork={<StudentIllustration id="illustration.unit-journey" decorative className="w-32 lg:w-44" />}
          artworkClassName="hidden sm:block"
        />
      </PaperSurface>

      {units.length > 0 && (
        <StudentTextField
          id="student-unit-search"
          label={t("searchLabel")}
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("searchPlaceholder")}
          leading={<Search className="size-4" />}
          containerClassName="max-w-md"
        />
      )}

      {/* ─── Loading State (Skeleton) ─── */}
      {isLoading && <SkeletonGrid />}

      {/* ─── Error State (Dùng token destructive) ─── */}
      {isError && (
        <RegionState
          variant="error"
          title={t("loadError")}
          description={getAppErrorMessage(error, tErrors as (key: string) => string)}
          action={
            <StudentButton variant="secondary" onClick={() => void refetch()}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              {t("retry")}
            </StudentButton>
          }
        />
      )}

      {/* ─── Empty State ─── */}
      {units.length === 0 && !isLoading && !isError && (
        <StudentCollectionEmptyState
          illustration="illustration.no-lessons"
          title={t("empty")}
          description={t("emptyDescription")}
        />
      )}

      {/* ─── Không khớp tìm kiếm ─── */}
      {units.length > 0 && filteredUnits.length === 0 && (
        <StudentCollectionEmptyState
          title={t("searchEmpty", { search: searchTerm })}
          action={
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="student-label min-h-11 text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t("clearSearch")}
            </button>
          }
        />
      )}

      {/* The count comes from the same server-backed Unit list as the cards. */}
      {!isLoading && !isError && units.length > 0 && (
        <p className="student-meta text-muted-foreground" role="status">
          {searchTerm.trim()
            ? t("results", { shown: filteredUnits.length, total: units.length })
            : t("available", { count: units.length })}
        </p>
      )}

      {filteredUnits.length > 0 && !isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">
          {filteredUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}
