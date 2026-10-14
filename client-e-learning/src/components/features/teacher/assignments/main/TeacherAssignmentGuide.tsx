"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileQuestion,
  ListChecks,
  Target,
  X,
} from "lucide-react";

const guideSteps = [
  {
    icon: BookOpen,
    title: "Start with assignment details",
    description:
      "Create a draft first. Enter a clear assignment name, select the grade, and add a short description so the purpose is easy to understand.",
    tips: ["Use a name students will recognize.", "Choose the grade that matches the target class."],
  },
  {
    icon: Target,
    title: "Choose the students",
    description:
      "Select one or more classes that should receive the assignment. Check the target carefully before publishing.",
    tips: ["You can target multiple classes.", "Only choose classes that should actually receive this assignment."],
  },
  {
    icon: CalendarClock,
    title: "Set the schedule",
    description:
      "Set the due date and decide whether students can see answers after submitting. The assignment remains a draft until you are ready to publish it.",
    tips: ["Make sure the due date is in the future when publishing.", "Decide the answer-visibility rule before students start."],
  },
  {
    icon: FileQuestion,
    title: "Add questions",
    description:
      "After creating the draft, open the assignment detail page and build its question set. You can add existing questions or create a new question.",
    tips: ["Review the question wording and answer options.", "Make sure the question set matches the assignment goal."],
  },
  {
    icon: ListChecks,
    title: "Review and publish",
    description:
      "Before publishing, review the assignment information, target classes, schedule, and complete question set. Publish only when everything is ready for students.",
    tips: ["Check all target classes one last time.", "Confirm questions and due date before publishing."],
  },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onStartCreating: () => void;
};

export function TeacherAssignmentGuide({ open, onClose, onStartCreating }: Props) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const current = guideSteps[step];
  const Icon = current.icon;
  const isLast = step === guideSteps.length - 1;

  const close = () => {
    setStep(0);
    onClose();
  };

  const startCreating = () => {
    setStep(0);
    onStartCreating();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <p className="text-body-sm font-bold text-primary">Teacher guide</p>
            <h2 className="mt-1 text-section-title font-bold">How to create an assignment</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Follow these steps from creating the draft to publishing it for students.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close guide"
            className="grid size-8 place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 px-5 pt-5">
          {guideSteps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              className={`border-t-2 pt-2 text-left ${
                step === index ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              <span className="text-body-sm font-bold">{index + 1}</span>
              <span className="mt-1 block text-[0.6875rem] leading-tight">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="flex gap-4 rounded-xl border border-border bg-muted/30 p-5">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-body-sm font-bold text-primary">Step {step + 1} of {guideSteps.length}</p>
              <h3 className="mt-1 text-lg font-bold">{current.title}</h3>
              <p className="mt-2 text-body-sm leading-6 text-muted-foreground">{current.description}</p>
              <div className="mt-4 space-y-2">
                {current.tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-2 text-body-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border p-5">
          <button
            type="button"
            onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-body-sm font-bold disabled:invisible"
          >
            <ArrowLeft className="size-4" /> Back
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={startCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground"
            >
              Start creating
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((currentStep) => Math.min(guideSteps.length - 1, currentStep + 1))}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
