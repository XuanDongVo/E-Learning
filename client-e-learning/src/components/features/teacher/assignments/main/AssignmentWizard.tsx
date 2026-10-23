"use client";

import { useState } from "react";
import { AlertCircle, Info, X } from "lucide-react";

import type { CreateAssignmentRequest } from "@/types/assignment";
import type { Grade } from "@/types/grade";

import { AssignmentBasicsStep } from "./AssignmentBasicsStep";
import {
  getAcademicYearError,
  isValidAcademicYear,
} from "./AssignmentBasicsStep";
import { AssignmentTargetStep } from "./AssignmentTargetStep";
import { AssignmentScheduleStep } from "./AssignmentScheduleStep";

type Step = "basics" | "target" | "schedule";

type ClassItem = {
  id: number;
  name: string;
  studentCount: number;
  grade: {
    id: number;
    displayOrder: number;
  };
  academicYear: string;
};

type Props = {
  open: boolean;
  form: CreateAssignmentRequest;
  classes: ClassItem[];
  grades: Grade[];
  mode?: "create" | "edit";
  isPending: boolean;
  onClose: () => void;
  onSubmit: (form: CreateAssignmentRequest) => void;
};

const steps = [
  { key: "basics", label: "Basics", hint: "Name and grade" },
  { key: "target", label: "Target", hint: "Choose recipients" },
  { key: "schedule", label: "Schedule", hint: "Set availability" },
] as const;

export function AssignmentWizard({
  open,
  form,
  classes,
  grades,
  mode = "create",
  isPending,
  onClose,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<Step>("basics");
  const [draft, setDraft] = useState<CreateAssignmentRequest>(form);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  if (!open) return null;

  const updateForm = (patch: Partial<CreateAssignmentRequest>) => {
    setValidationMessage(null);
    setDraft((current) => {
      const next = { ...current, ...patch };
      if (patch.gradeId !== undefined || patch.academicYear !== undefined) {
        next.classIds = classes
          .filter(
            (item) =>
              item.grade.id === next.gradeId &&
              item.academicYear.trim() === next.academicYear.trim(),
          )
          .map((item) => item.id);
      }
      return next;
    });
  };

  function getScheduleError(startAt: string, dueAt: string): string | null {
    if (!startAt) {
      return "Please select a start date and time.";
    }

    if (!dueAt) {
      return "Please select a due date and time.";
    }

    const start = new Date(startAt).getTime();
    const due = new Date(dueAt).getTime();

    if (Number.isNaN(start) || Number.isNaN(due)) {
      return "Please enter valid start and due dates.";
    }

    if (due <= start) {
      return "The due date must be later than the start date.";
    }

    return null;
  }

  const next = () => {
    if (step === "basics") {
      if (!draft.name.trim() || !draft.gradeId) {
        setValidationMessage("Enter an assignment name and select a grade.");
        return;
      }

      if (!isValidAcademicYear(draft.academicYear)) {
        setValidationMessage(
          getAcademicYearError(draft.academicYear) ??
            "Please review the academic year.",
        );
        return;
      }
    }

    if (step === "target" && draft.classIds.length === 0) {
      setValidationMessage("Select at least one recipient class.");
      return;
    }

    setValidationMessage(null);

    setStep(step === "basics" ? "target" : "schedule");
  };

  const back = () => {
    setStep(step === "schedule" ? "target" : "basics");
  };

  const submit = () => {
    const scheduleError = getScheduleError(draft.startAt, draft.dueAt);
    if (scheduleError) {
      setValidationMessage(scheduleError);
      return;
    }

    setValidationMessage(null);
    onSubmit(draft);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/20 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <p className="text-body-sm font-bold text-primary">
              {mode === "create" ? "New assignment" : "Edit assignment"}
            </p>
            <h2 className="mt-1 text-section-title font-bold">
              {mode === "create"
                ? "Create the assignment draft"
                : "Update assignment details"}
            </h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              These three steps create the assignment draft. You will add and
              review questions after the draft is created.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-5 pt-5">
          {steps.map((item, index) => (
            <div
              key={item.key}
              className={`border-t-2 pt-2 ${step === item.key ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
            >
              <p className="text-body-sm font-bold">
                {index + 1}. {item.label}
              </p>
              <p className="text-[0.6875rem]">{item.hint}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-b border-border px-5 py-3">
          <div className=" mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-body-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Creating this draft is only the first part. Afterward, open the
              assignment to add questions and review it before publishing.
            </p>
          </div>

          {validationMessage && (
            <div
              role="alert"
              className="flex max-w-md items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-left text-sm text-destructive shadow-sm"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />

              <p className="leading-5">{validationMessage}</p>
            </div>
          )}
        </div>

        <div className="min-h-56 p-5">
          {step === "basics" && (
            <AssignmentBasicsStep
              form={draft}
              grades={grades}
              onChange={updateForm}
            />
          )}
          {step === "target" && (
            <AssignmentTargetStep
              form={draft}
              classes={classes}
              onChange={updateForm}
            />
          )}
          {step === "schedule" && (
            <AssignmentScheduleStep form={draft} onChange={updateForm} />
          )}
        </div>

        <div className="flex justify-between border-t border-border p-5">
          <button
            type="button"
            onClick={back}
            disabled={step === "basics"}
            className="rounded-lg border border-border px-3 py-2 text-body-sm font-bold disabled:invisible"
          >
            Back
          </button>
          <div className="flex flex-col items-end gap-2">
            {step === "schedule" ? (
              <button
                type="button"
                onClick={submit}
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {isPending
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                    ? "Create draft"
                    : "Save changes"}
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
