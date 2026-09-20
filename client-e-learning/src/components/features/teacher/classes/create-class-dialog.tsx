import type { FormEvent } from "react";
import type { Grade } from "@/types/grade";
import { Button } from "@/components/ui/button";

interface ClassForm {
  name: string;
  gradeId: string;
  academicYear: string;
}

interface CreateClassDialogProps {
  grades: Grade[];
  form: ClassForm;
  isSaving: boolean;
  onChange: (form: ClassForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function CreateClassDialog({
  grades,
  form,
  isSaving,
  onChange,
  onSubmit,
  onClose,
}: CreateClassDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-dark/30 p-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-[var(--radius-lg)] bg-card-bg p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-ui-xl font-extrabold">
              Create class
            </h2>

            <p className="mt-1 text-body text-neutral-muted">
              Add a class to your teaching workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ui-xl text-neutral-muted"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-body font-bold">
            Class name

            <input
              required
              value={form.name}
              onChange={(event) =>
                onChange({
                  ...form,
                  name: event.target.value,
                })
              }
              className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-border-color px-3 text-body outline-none focus:border-primary"
              placeholder="6A"
            />
          </label>

          <label className="block text-body font-bold">
            Grade

            <select
              required
              value={form.gradeId}
              onChange={(event) =>
                onChange({
                  ...form,
                  gradeId: event.target.value,
                })
              }
              disabled={grades.length === 0}
              className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-card-bg px-3 text-body outline-none focus:border-primary"
            >
              <option value="" disabled>
                Select a grade
              </option>

              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-body font-bold">
            Academic year

            <input
              required
              value={form.academicYear}
              onChange={(event) =>
                onChange({
                  ...form,
                  academicYear: event.target.value,
                })
              }
              className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-border-color px-3 text-body outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create class"}
          </Button>
        </div>
      </form>
    </div>
  );
}