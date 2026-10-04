import type { CreateAssignmentRequest } from "@/types/assignment";

type Props = {
  form: CreateAssignmentRequest;
  onChange: (
    patch: Partial<CreateAssignmentRequest>,
  ) => void;
};

export function AssignmentBasicsStep({
  form,
  onChange,
}: Props) {
  return (
    <div className="space-y-4">
      <label className="block text-body-sm font-bold">
        Assignment name

        <input
          value={form.name}
          onChange={(event) =>
            onChange({
              name: event.target.value,
            })
          }
          placeholder="Unit 2 Review"
          className="mt-1 h-10 w-full rounded-lg border border-input px-3 text-body outline-none focus:ring-2 focus:ring-ring/30"
        />
      </label>

      <label className="block text-body-sm font-bold">
        Grade

        <select
          value={form.gradeLevel}
          onChange={(event) =>
            onChange({
              gradeLevel: Number(
                event.target.value,
              ),
              targets: [],
            })
          }
          className="mt-1 h-10 w-full rounded-lg border border-input px-3 text-body outline-none"
        >
          <option value={6}>Grade 6</option>
          <option value={7}>Grade 7</option>
          <option value={8}>Grade 8</option>
        </select>
      </label>

      <label className="block text-body-sm font-bold">
        Description

        <textarea
          value={form.description}
          onChange={(event) =>
            onChange({
              description: event.target.value,
            })
          }
          className="mt-1 min-h-20 w-full rounded-lg border border-input px-3 py-2 text-body outline-none"
        />
      </label>
    </div>
  );
}