"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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

export type SearchableSelectItem = {
  id: string | number;
  label: string;
};

export type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  items: SearchableSelectItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Nếu set → hiện option đầu (vd. "Tất cả") với value này */
  allOption?: { value: string; label: string };
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
};

export function SearchableSelect({
  value,
  onChange,
  items,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results.",
  allOption,
  disabled,
  className,
  contentClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    allOption && value === allOption.value
      ? allOption.label
      : (items.find((item) => String(item.id) === String(value))?.label ??
        placeholder);

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
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0",
          contentClassName,
        )}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList className="max-h-56">
            <CommandEmpty className="p-3 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {allOption ? (
                <CommandItem
                  value={allOption.label}
                  onSelect={() => {
                    onChange(allOption.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === allOption.value
                        ? "text-primary opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {allOption.label}
                </CommandItem>
              ) : null}

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