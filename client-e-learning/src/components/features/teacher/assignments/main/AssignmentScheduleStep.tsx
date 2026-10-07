import type { CreateAssignmentRequest } from "@/types/assignment";

type Props = {
  form: CreateAssignmentRequest;
  onChange: (
    patch: Partial<CreateAssignmentRequest>,
  ) => void;
};

export function AssignmentScheduleStep({
  form,
  onChange,
}: Props) {
  return (
    <div className="space-y-4">
      <label className="block text-body-sm font-bold">
        Academic year

        <input
          value={form.academicYear}
          onChange={(event) =>
            onChange({
              academicYear: event.target.value,
            })
          }
          className="mt-1 h-10 w-full rounded-lg border border-input px-3 text-body"
        />
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-body-sm">
        <input
          type="checkbox"
          checked={form.showAnswersAfterSubmit}
          onChange={(event) =>
            onChange({ showAnswersAfterSubmit: event.target.checked })
          }
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          <span className="block font-bold">Show answers after submit</span>
          <span className="font-normal text-muted-foreground">
            Students can see correct answers and explanations after submitting.
          </span>
        </span>
      </label>

      <label className="block text-body-sm font-bold">
        Due date

        <input
          type="datetime-local"
          value={form.dueAt}
          onChange={(event) =>
            onChange({
              dueAt: event.target.value,
            })
          }
          className="mt-1 h-10 w-full rounded-lg border border-input px-3 text-body"
        />
      </label>

      <label className="block text-body-sm font-bold">
        Time limit
        <span className="font-normal text-muted-foreground">
          {" "}
          (optional, minutes)
        </span>

        <input
          type="number"
          min={1}
          value={
            form.timeLimitSeconds
              ? form.timeLimitSeconds / 60
              : ""
          }
          onChange={(event) =>
            onChange({
              timeLimitSeconds: event.target.value
                ? Number(event.target.value) * 60
                : undefined,
            })
          }
          className="mt-1 h-10 w-full rounded-lg border border-input px-3 text-body"
        />
      </label>

      <p className="rounded-lg bg-primary-light p-3 text-body-sm text-primary">
        This creates a private Draft. Questions and
        publishing are the next steps.
      </p>
    </div>
  );
}