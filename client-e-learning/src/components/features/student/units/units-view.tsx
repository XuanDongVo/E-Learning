"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Search, RefreshCw } from "lucide-react";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { studentUnitService } from "@/services/student/student-unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { Button } from "@/components/ui/button";
import { UnitCard } from "./unit-card";
import { Pipo } from "@/components/ui/mascot";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";
import { RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

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
    <div className="student-units-page space-y-6 pb-8">
      <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-units-hero">
        <div className="space-y-2">
          <p className="student-meta text-primary">Learning</p>
          <ScrapbookHeading as="h1" className="student-page-title text-foreground">
            Chọn Unit để học
          </ScrapbookHeading>
          <p className="student-body max-w-xl text-muted-foreground">
            Khám phá phần học và hoạt động luyện tập do giáo viên công bố.
          </p>
        </div>
        <div className="hidden shrink-0 sm:block" aria-hidden="true">
          <Pipo mood="happy" size={92} color="primary" stage={2} />
        </div>
      </PaperSurface>

      {units.length > 0 && (
        <div className="relative max-w-md">
          <label htmlFor="student-unit-search" className="student-label mb-2 block text-foreground">
            Tìm bài học
          </label>
          <Search className="absolute bottom-3 left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            id="student-unit-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nhập tên Unit..."
            className="student-field pl-10 pr-4 placeholder:text-muted-foreground"
          />
        </div>
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
            <Button type="button" variant="secondary" onClick={() => void refetch()}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Thử lại
            </Button>
          }
        />
      )}

      {/* ─── Empty State ─── */}
      {units.length === 0 && !isLoading && !isError && (
        <RegionState
          variant="empty"
          title="Chưa có bài học nào"
          description="Giáo viên của bạn chưa công bố Unit nào cho lớp học này. Hãy quay lại sau nhé!"
        />
      )}

      {/* ─── Không khớp tìm kiếm ─── */}
      {units.length > 0 && filteredUnits.length === 0 && (
        <RegionState
          variant="empty"
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

      {/* ─── Lưới Unit Cards ─── */}
      {filteredUnits.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}
