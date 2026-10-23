import type { CreateAssignmentRequest } from "@/types/assignment";
import type { Grade } from "@/types/grade";
import { useEffect, useState } from "react";

type Props = {
  form: CreateAssignmentRequest;
  grades: Grade[];
  onChange: (patch: Partial<CreateAssignmentRequest>) => void;
};

export function isValidAcademicYear(value: string) {
  const match = value.match(/^(\d{4})\s*-\s*(\d{4})$/);

  if (!match) return false;

  const start = Number(match[1]);
  const end = Number(match[2]);

  return start >= 2000 && end <= 2100 && end === start + 1;
}

export function getAcademicYearError(value: string) {
  const match = value.match(/^(\d{4})\s*-\s*(\d{4})$/);

  if (!match) {
    return "Enter a valid academic year, such as 2026 - 2027.";
  }

  const start = Number(match[1]);
  const end = Number(match[2]);

  if (start > end || start > end - 1) {
    return "The start year cannot be later than the following year. Please review the academic year.";
  }

  if (end !== start + 1 || start < 2000 || end > 2100) {
    return "The academic year must contain two consecutive years, such as 2026 - 2027.";
  }

  return null;
}

export function AssignmentBasicsStep({ form, grades, onChange }: Props) {
  const currentYear = new Date().getFullYear();

  const [startYear, setStartYear] = useState(String(currentYear));
  const [endYear, setEndYear] = useState(String(currentYear + 1));

  useEffect(() => {
    const academicYear = `${startYear} - ${endYear}`;

    if (form.academicYear !== academicYear) {
      onChange({ academicYear });
    }
  }, [startYear, endYear, form.academicYear, onChange]);

  const academicYearError = getAcademicYearError(
    `${startYear} - ${endYear}`,
  );

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
          value={form.gradeId}
          onChange={(event) =>
            onChange({
              gradeId: Number(event.target.value),
            })
          }
          className="mt-1 h-10 w-full rounded-lg border border-input px-3 text-body outline-none"
        >
          <option value={0}>Select a grade</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <label className="block text-body-sm font-bold">Academic year</label>

        <div className="flex items-end gap-3">
          <label className="min-w-0 flex-1 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Start year
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={startYear}
              onChange={(event) =>
                setStartYear(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="2026"
              className="h-10 w-full rounded-lg border border-input px-3 text-body"
            />
          </label>

          <span className="pb-2 text-muted-foreground">–</span>

          <label className="min-w-0 flex-1 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              End year
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={endYear}
              onChange={(event) =>
                setEndYear(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="2027"
              className="h-10 w-full rounded-lg border border-input px-3 text-body"
            />
          </label>
        </div>

        {academicYearError && (startYear || endYear) && (
          <p className="text-sm text-destructive">
            {academicYearError}
          </p>
        )}
      </div>

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
