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
import { Pipo } from "@/components/ui/mascot";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";

export function UnitsView() {
  const tErrors = useTranslations("errors");
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
          eyebrow="BÀI HỌC"
          title="Chọn Unit để học"
          description="Khám phá phần học và hoạt động luyện tập do giáo viên công bố."
          artwork={<Pipo mood="happy" size={92} color="primary" stage={2} />}
          artworkClassName="hidden sm:block"
        />
      </PaperSurface>

      {units.length > 0 && (
        <StudentTextField
          id="student-unit-search"
          label="Tìm bài học"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập tên Unit..."
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
          title="Không thể tải danh sách bài học"
          description={getAppErrorMessage(error, tErrors as (key: string) => string)}
          action={
            <StudentButton variant="secondary" onClick={() => void refetch()}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Thử lại
            </StudentButton>
          }
        />
      )}

      {/* ─── Empty State ─── */}
      {units.length === 0 && !isLoading && !isError && (
        <StudentCollectionEmptyState
          illustration="illustration.no-lessons"
          title="Chưa có bài học nào"
          description="Giáo viên của bạn chưa công bố Unit nào cho lớp học này. Hãy quay lại sau nhé!"
        />
      )}

      {/* ─── Không khớp tìm kiếm ─── */}
      {units.length > 0 && filteredUnits.length === 0 && (
        <StudentCollectionEmptyState
          title={`Không tìm thấy Unit phù hợp với từ khóa "${searchTerm}"`}
          action={
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="student-label min-h-11 text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Xóa tìm kiếm
            </button>
          }
        />
      )}

      {/* The count comes from the same server-backed Unit list as the cards. */}
      {!isLoading && !isError && units.length > 0 && (
        <p className="student-meta text-muted-foreground" role="status">
          {searchTerm.trim()
            ? `Hiển thị ${filteredUnits.length}/${units.length} Unit phù hợp`
            : `${units.length} Unit có thể khám phá`}
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
