import type { StudentsToolbarProps } from "@/types/student";
import { Search, X } from "lucide-react";

export function StudentsToolbar({
  search, classFilter, gradeFilter, statusFilter, noClass, classes, grades,
  onSearchChange, onClassChange, onGradeChange, onStatusChange, onNoClassChange, onClear,
}: StudentsToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-neutral-subtle" />
          <input aria-label="Search students" value={search} onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, email, or phone"
            className="h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-card-bg pl-9 pr-3 text-body outline-none focus:border-primary" />
        </label>
        <select aria-label="Filter by class" value={classFilter} onChange={(event) => onClassChange(event.target.value)}
          className="h-10 lg:w-44 rounded-[var(--radius-md)] border border-border-color bg-card-bg px-3">
          <option value="all">All classes</option>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select aria-label="Filter by grade" value={gradeFilter} onChange={(event) => onGradeChange(event.target.value)}
          className="h-10 lg:w-44 rounded-[var(--radius-md)] border border-border-color bg-card-bg px-3">
          <option value="all">All grades</option>
          {grades.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select aria-label="Filter by account status" value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}
          className="h-10 lg:w-44 rounded-[var(--radius-md)] border border-border-color bg-card-bg px-3">
          <option value="all">Any account</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Locked</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-body-sm">
        <span className="text-neutral-muted">Quick filter</span>
        <button type="button" onClick={() => onNoClassChange(!noClass)}
          className={"rounded-full border px-3 py-1 " + (noClass ? "border-primary bg-primary-light text-primary" : "border-border-color")}>
          No active class
        </button>
        {(search || classFilter !== "all" || gradeFilter !== "all" || statusFilter !== "all" || noClass) && (
          <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-primary">
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
