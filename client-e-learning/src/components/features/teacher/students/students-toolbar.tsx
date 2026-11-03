"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
}: StudentsToolbarProps) {
  const t = useTranslations("teacher.students");

  const hasActiveFilters =
    Boolean(search) ||
    classFilter !== "all" ||
    gradeFilter !== "all" ||
    statusFilter !== "all" ||
    noClass;

  return (
    <div className="flex flex-col gap-3 border-b border-border p-5 xl:flex-row xl:items-center bg-card rounded-lg shadow-sm ">
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
        <SearchableFilter
          value={classFilter}
          onChange={onClassChange}
          allLabel={t("allClasses")}
          searchPlaceholder="Tìm kiếm lớp..."
          emptyText="Không tìm thấy lớp học"
          items={classes}
          className="w-full sm:w-40"
        />

        <SearchableFilter
          value={gradeFilter}
          onChange={onGradeChange}
          allLabel={t("allGrades")}
          searchPlaceholder="Tìm kiếm khối..."
          emptyText="Không tìm thấy khối học"
          items={grades}
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

        {/* No class */}
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

        {/* Clear filters */}
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
    </div>
  );
}

/**
 * Searchable combobox dùng cho danh sách Lớp / Khối.
 */
function SearchableFilter({
  value,
  onChange,
  allLabel,
  searchPlaceholder,
  emptyText,
  items,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  searchPlaceholder: string;
  emptyText: string;
  items: Array<{ id: string | number; name: string }>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedName =
    value === "all"
      ? allLabel
      : (items.find((item) => String(item.id) === String(value))?.name ??
        allLabel);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-10 justify-between bg-background px-3 text-left font-normal",
            className,
          )}
        >
          <span className="truncate">{selectedName}</span>

          <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />

          <CommandList className="max-h-56">
            <CommandEmpty className="p-3 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>

            <CommandGroup>
              <CommandItem
                value={allLabel}
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
                className="cursor-pointer text-sm"
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === "all" ? "text-primary opacity-100" : "opacity-0",
                  )}
                />

                {allLabel}
              </CommandItem>

              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
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

                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
