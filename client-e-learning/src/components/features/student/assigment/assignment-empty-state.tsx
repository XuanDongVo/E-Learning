import { Pipo } from "./student-foundation";

interface AssignmentEmptyStateProps {
  onClearFilters: () => void;
}

export function AssignmentEmptyState({ onClearFilters }: AssignmentEmptyStateProps) {
  return (
    <div className="grid justify-items-center gap-2 rounded-3xl border-2 border-dashed border-border p-8 sm:p-10 text-center">
      <Pipo mood="think" size={100} />
      <h2 className="text-lg font-bold">No assignments found</h2>
      <p className="text-sm text-muted-foreground">Try another title or keyword.</p>
      <button
        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-foreground bg-primary px-5 text-sm font-extrabold text-foreground shadow-[0_3px_0_var(--foreground)] transition-all hover:bg-primary-hover active:translate-y-1 active:shadow-none cursor-pointer"
        onClick={onClearFilters}
      >
        Clear filters
      </button>
    </div>
  );
}

