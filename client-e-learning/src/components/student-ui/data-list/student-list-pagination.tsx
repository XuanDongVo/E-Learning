"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StudentListPaginationProps = {
  page: number;
  totalPages: number;
  pageLabel: string;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

/** 1-based pagination; avoids generating every page number for large lists. */
export function StudentListPagination({
  page,
  totalPages,
  pageLabel,
  previousLabel,
  nextLabel,
  onPageChange,
  disabled = false,
  className,
}: StudentListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={pageLabel} className={cn("flex flex-wrap items-center justify-between gap-2 pt-1", className)}>
      <button
        type="button"
        aria-label={previousLabel}
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="student-control student-control--quiet inline-flex min-h-11 items-center gap-1.5 px-3 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{previousLabel}</span>
      </button>
      <span aria-live="polite" className="student-meta text-center text-muted-foreground">{pageLabel}</span>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="student-control student-control--quiet inline-flex min-h-11 items-center gap-1.5 px-3 disabled:cursor-not-allowed"
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
