"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableAlign = "left" | "center" | "right";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  align?: DataTableAlign;
}

export interface DataTablePagination {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions?: number[];
  totalLabel?: ReactNode;
  showLabel?: ReactNode;
  perPageLabel?: ReactNode;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string | number;
  isLoading?: boolean;
  loadingState?: ReactNode;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  pagination?: DataTablePagination;
  minWidth?: string;
  className?: string;
  rowClassName?: string | ((row: T) => string);
}

const alignmentClasses: Record<DataTableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  loadingState,
  emptyState,
  errorState,
  pagination,
  minWidth = "760px",
  className,
  rowClassName,
}: DataTableProps<T>) {
  if (errorState) return errorState;
  if (isLoading) return loadingState;
  if (!data.length) return emptyState;

  return (
    <div className={cn("overflow-x-auto rounded-2xl border-2 border-ink bg-card shadow-pop", className)}>
      <table className="w-full text-left" style={{ minWidth }}>
        <thead className="border-b-2 border-border bg-background-app/70 text-body-sm tracking-wide text-neutral-muted">
          <tr className="border-b-2 border-border bg-card">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                style={{ width: column.width }}
                className={cn(
                  "px-4 py-3 text-label font-semibold text-neutral-muted",
                  alignmentClasses[column.align ?? "left"],
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color">
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              className={cn(
                "transition-colors hover:bg-background-app",
                typeof rowClassName === "function"
                  ? rowClassName(row)
                  : rowClassName,
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "px-4 py-4 align-middle",
                    alignmentClasses[column.align ?? "left"],
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && <DataTablePaginationBar pagination={pagination} />}
    </div>
  );
}

function DataTablePaginationBar({
  pagination,
}: {
  pagination: DataTablePagination;
}) {
  const {
    page,
    totalPages,
    totalElements,
    pageSize,
    pageSizeOptions = [8, 10, 20, 50, 100],
    totalLabel,
    showLabel,
    perPageLabel,
    previousLabel = "Previous",
    nextLabel = "Next",
    onPageChange,
    onPageSizeChange,
  } = pagination;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-color px-5 py-4 text-body-sm">
      <div className="flex items-center gap-3">
        <b>{totalLabel ?? `Total: ${totalElements}`}</b>
        <label className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{showLabel ?? "Show"}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">{perPageLabel ?? "per page"}</span>
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded border border-border-color px-3 py-2 text-neutral-muted disabled:opacity-40"
        >
          {previousLabel}
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={cn(
                "size-9 rounded border",
                pageNumber === page
                  ? "border-primary bg-primary font-bold text-primary-foreground"
                  : "border-border-color hover:bg-background-app",
              )}
            >
              {pageNumber}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded border border-border-color px-3 py-2 text-neutral-muted disabled:opacity-40"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
