import { Plus } from "lucide-react";

interface ClassesHeaderProps {
  onCreate: () => void;
}

export function ClassesHeader({ onCreate }: ClassesHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-body-sm font-extrabold uppercase tracking-[0.16em] text-primary">
          Teacher workspace
        </p>

        <h1 className="mt-2 text-ui-3xl font-extrabold tracking-tight">
          Classes
        </h1>

        <p className="mt-2 text-body text-neutral-muted">
          Organize your classes and keep each learner connected.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-body font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4" />
        Create class
      </button>
    </div>
  );
}