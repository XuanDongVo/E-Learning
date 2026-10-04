import {
  Search,
  Upload,
} from "lucide-react";

type StatusFilter =
  | "ALL"
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type Props = {
  search: string;
  statusFilter: StatusFilter;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onImport: () => void;
};

export function AssignmentFilters({
  search,
  statusFilter,
  resultCount,
  onSearchChange,
  onStatusChange,
  onImport,
}: Props) {
  const filters: {
    value: StatusFilter;
    label: string;
  }[] = [
    { value: "ALL", label: "All" },
    { value: "PUBLISHED", label: "Active" },
    { value: "DRAFT", label: "Draft" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  return (
    <div className="border-b border-border px-4 py-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <h2 className="text-section-title font-bold">
            All assignments
          </h2>

          <p className="text-body-sm text-muted-foreground">
            {resultCount} matching assignments
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-body-sm text-muted-foreground">
            <Search className="size-4" />

            <input
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              placeholder="Search assignments..."
              className="w-44 bg-transparent outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onImport}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-input px-3 text-body-sm font-bold hover:bg-muted"
          >
            <Upload className="size-4" />
            Import questions
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() =>
              onStatusChange(filter.value)
            }
            className={`rounded-lg border px-3 py-1.5 text-body-sm font-semibold ${
              statusFilter === filter.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}