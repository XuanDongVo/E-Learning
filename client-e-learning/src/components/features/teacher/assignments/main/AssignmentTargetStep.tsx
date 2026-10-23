import { Users } from "lucide-react";

import type { CreateAssignmentRequest } from "@/types/assignment";

type ClassItem = {
  id: number;
  name: string;
  studentCount: number;
  grade: {
    id: number;
    displayOrder: number;
  };
  academicYear: string;
  status?: "ACTIVE" | "ARCHIVED";
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
      item.grade.id === form.gradeId &&
      item.academicYear.trim() === form.academicYear.trim(),
  );

  const toggleClass = (classId: number) => {
    const classIds = form.classIds.includes(classId)
      ? form.classIds.filter((id) => id !== classId)
      : [...form.classIds, classId];
    onChange({ classIds });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-body font-bold">
          Who should receive this assignment?
        </h3>

        <p className="mt-1 text-body-sm text-muted-foreground">
          All matching classes are selected by default. Remove any class that should not receive it.
        </p>
      </div>

      <div className="space-y-2">
          {visibleClasses.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-body-sm text-muted-foreground">
              No classes found for the selected grade and academic year.
            </p>
          ) : (
            visibleClasses.map((item) => {
              const checked = form.classIds.includes(item.id);

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
                    onChange={() => toggleClass(item.id)}
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
    </div>
  );
}