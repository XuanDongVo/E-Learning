import { Users } from "lucide-react";

import type { CreateAssignmentRequest } from "@/types/assignment";

type ClassItem = {
  id: number;
  name: string;
  studentCount: number;
  grade: {
    displayOrder: number;
  };
};

type Props = {
  form: CreateAssignmentRequest;
  classes: ClassItem[];
  onChange: (
    patch: Partial<CreateAssignmentRequest>,
  ) => void;
};

export function AssignmentTargetStep({
  form,
  classes,
  onChange,
}: Props) {
  const visibleClasses = classes.filter(
    (item) =>
      item.grade.displayOrder === form.gradeLevel,
  );

  const isGradeTarget = form.targets.some(
    (target) => target.type === "GRADE",
  );

  const isClassTarget =
    !isGradeTarget ||
    form.targets.some((target) => target.type === "CLASS");

  const selectGrade = () => {
    onChange({
      targets: [
        {
          type: "GRADE",
        },
      ],
    });
  };

  const selectClasses = () => {
    onChange({
      targets: [],
    });
  };

  const toggleClass = (classId: number) => {
    const exists = form.targets.some(
      (target) =>
        target.type === "CLASS" &&
        target.classId === classId,
    );

    const targets = exists
      ? form.targets.filter(
          (target) =>
            !(
              target.type === "CLASS" &&
              target.classId === classId
            ),
        )
      : [
          ...form.targets.filter(
            (target) => target.type === "CLASS",
          ),
          {
            type: "CLASS" as const,
            classId,
          },
        ];

    onChange({ targets });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-body font-bold">
          Who should receive this assignment?
        </h3>

        <p className="mt-1 text-body-sm text-muted-foreground">
          Choose the entire grade or specific classes.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={selectGrade}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            isGradeTarget
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 grid size-5 place-items-center rounded-full border ${
                isGradeTarget
                  ? "border-primary"
                  : "border-input"
              }`}
            >
              {isGradeTarget && (
                <span className="size-2.5 rounded-full bg-primary" />
              )}
            </span>

            <div>
              <p className="text-body-sm font-bold">
                Entire Grade {form.gradeLevel}
              </p>

              <p className="mt-1 text-body-sm text-muted-foreground">
                All classes in Grade {form.gradeLevel}
                will receive this assignment.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={selectClasses}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            isClassTarget
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 grid size-5 place-items-center rounded-full border ${
                isClassTarget
                  ? "border-primary"
                  : "border-input"
              }`}
            >
              {isClassTarget && (
                <span className="size-2.5 rounded-full bg-primary" />
              )}
            </span>

            <div>
              <p className="text-body-sm font-bold">
                Specific classes
              </p>

              <p className="mt-1 text-body-sm text-muted-foreground">
                Select one or more classes.
              </p>
            </div>
          </div>
        </button>
      </div>

      {isClassTarget && (
        <div className="space-y-2">
          {visibleClasses.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-body-sm text-muted-foreground">
              No classes found for Grade{" "}
              {form.gradeLevel}.
            </p>
          ) : (
            visibleClasses.map((item) => {
              const checked = form.targets.some(
                (target) =>
                  target.type === "CLASS" &&
                  target.classId === item.id,
              );

              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                    checked
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleClass(item.id)
                    }
                  />

                  <Users className="size-4 text-primary" />

                  <span className="flex-1 text-body-sm font-semibold">
                    {item.name}
                  </span>

                  <span className="text-body-sm text-muted-foreground">
                    {item.studentCount} students
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}