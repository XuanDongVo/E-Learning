import { UserPlus } from "lucide-react";
export function StudentsHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-body-sm font-extrabold uppercase tracking-[0.16em] text-primary">
          Teacher workspace
        </p>
        <h1 className="mt-2 text-ui-3xl font-extrabold tracking-tight">
          Students
        </h1>
        <p className="mt-2 text-body text-neutral-muted">
          Manage student accounts, profiles, and class membership.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-body font-extrabold text-primary-foreground hover:bg-primary-hover"
      >
        <UserPlus className="size-4" /> Add student
      </button>
    </header>
  );
}
