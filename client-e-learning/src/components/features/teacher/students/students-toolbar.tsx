"use client";

import { useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface StudentsToolbarProps {
  search: string;
  classFilter: string;
  gradeFilter: string;
  statusFilter: string;
  noClass: boolean;
  classes: Array<{ id: string | number; name: string }>;
  grades: Array<{ id: string | number; name: string }>;
  onSearchChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onNoClassChange: (value: boolean) => void;
  onClear: () => void;
  /** Primary actions (e.g. Add student) — rendered on the right */
  actions?: ReactNode;
}

export function StudentsToolbar({
  search,
  classFilter,
  gradeFilter,
  statusFilter,
  noClass,
  classes,
  grades,
  onSearchChange,
  onClassChange,
  onGradeChange,
  onStatusChange,
  onNoClassChange,
  onClear,
  actions,
}: StudentsToolbarProps) {
  const t = useTranslations("teacher.students");

  const hasActiveFilters =
    Boolean(search) ||
    classFilter !== "all" ||
    gradeFilter !== "all" ||
    statusFilter !== "all" ||
    noClass;

  return (
    <div className="flex flex-col gap-3 border-b border-border p-5 xl:flex-row xl:items-center bg-card rounded-lg shadow-sm border-2 border border-ink shadow-pop">
      {/* Search */}
      <div className="relative w-full xl:w-72 xl:shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          aria-label={t("searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-10 bg-background pl-9 pr-3"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchableSelect
          value={classFilter}
          onChange={onClassChange}
          allOption={{
            value: "all",
            label: t("allClasses"),
          }}
          searchPlaceholder="Tìm kiếm lớp..."
          emptyText="Không tìm thấy lớp học"
          items={classes.map((c) => ({ id: c.id, label: c.name }))}
          className="w-full sm:w-40"
        />

        <SearchableSelect
          value={gradeFilter}
          onChange={onGradeChange}
          allOption={{
            value: "all",
            label: t("allGrades"),
          }}
          searchPlaceholder="Tìm kiếm khối..."
          emptyText="Không tìm thấy khối học"
          items={grades.map((g) => ({ id: g.id, label: g.name }))}
          className="w-full sm:w-40"
        />

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger
            aria-label={t("anyAccount")}
            className="h-10 w-full bg-background sm:w-44"
          >
            <SelectValue placeholder={t("anyAccount")} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">{t("anyAccount")}</SelectItem>
            <SelectItem value="ACTIVE">{t("active")}</SelectItem>
            <SelectItem value="INACTIVE">{t("locked")}</SelectItem>
          </SelectContent>
        </Select>

        <label
          className={cn(
            "flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors",
            noClass
              ? "border-primary/40 bg-brand-soft text-primary"
              : "border-input bg-background text-foreground hover:bg-muted/50",
          )}
        >
          <Checkbox
            checked={noClass}
            onCheckedChange={(checked) => onNoClassChange(checked === true)}
          />
          <span className="whitespace-nowrap">{t("noActiveClass")}</span>
        </label>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-10 gap-1.5 px-3 text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
            {t("clearFilters")}
          </Button>
        )}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 xl:ml-auto max-sm:w-full max-sm:[&>button]:flex-1">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
