"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  FileQuestion,
  Lightbulb,
  ListChecks,
  Paperclip,
  X,
} from "lucide-react";

const guideSteps = [
  {
    title: "Choose the question type",
    description:
      "Start by choosing the type that matches how students should answer the question.",
    tips: [
      "Single Choice: exactly one correct option.",
      "Multiple Choice: one or more correct options.",
      "True / False: choose TRUE or FALSE as the answer.",
      "Fill in Blank / Type Answer: define one or more accepted answers.",
    ],
  },
  {
    title: "Write the question prompt",
    description:
      "Enter a clear prompt and select the appropriate difficulty. For Fill in Blank, use the four-underscore blank marker.",
    tips: [
      "Keep the prompt unambiguous and appropriate for the target grade.",
      "For Fill in Blank, insert ____ where the student must answer.",
      "Changing type after entering answer data can reset that data, so confirm the change carefully.",
    ],
  },
  {
    title: "Configure the answer",
    description:
      "The answer section changes with the question type. Make sure every required answer is configured before saving.",
    tips: [
      "Choice questions need options and the correct option(s).",
      "True / False needs one selected answer.",
      "Text-answer questions can have multiple accepted answers.",
    ],
  },
  {
    title: "Add explanation, hint, and media",
    description:
      "Complete the supporting content that helps students learn and gives the question enough context.",
    tips: [
      "Explanation can clarify why the answer is correct.",
      "Hint is optional and should guide students without giving away the answer.",
      "Use image or audio media when it is necessary for the question.",
    ],
  },
  {
    title: "Preview and validate",
    description:
      "Preview the question as a student would see it, then check the prompt, options, answer, and supporting content.",
    tips: [
      "Preview before saving when the question contains media or complex answer logic.",
      "Fix incomplete questions before the final save.",
      "When editing, verify that existing answers and media were preserved as intended.",
    ],
  },
  {
    title: "Save the question",
    description:
      "Save the question directly to the Assignment. In the multi-question route, you can continue adding questions before saving them together.",
    tips: [
      "The multi-question composer also keeps a local browser draft automatically.",
      "You can add, duplicate, reorder by selection, or remove draft questions before saving.",
      "After saving, return to the Assignment to review the complete question set.",
    ],
  },
];

export function QuestionAuthoringGuide({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const current = guideSteps[step];
  const isLast = step === guideSteps.length - 1;

  const close = () => {
    setStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-authoring-guide-title"
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Question authoring guide
              </p>
              <h2 id="question-authoring-guide-title" className="mt-1 text-lg font-extrabold">
                How to create or edit a question
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Follow these steps before saving a question to the Assignment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close guide"
            className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {guideSteps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-lg border px-2.5 py-2 text-left transition ${
                  index === step
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wide">
                  Step {index + 1}
                </span>
                <span className="mt-0.5 block text-xs font-bold leading-tight">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                {step === 0 && <FileQuestion className="size-5" />}
                {step === 1 && <ListChecks className="size-5" />}
                {step === 2 && <CheckCircle2 className="size-5" />}
                {step === 3 && <Paperclip className="size-5" />}
                {step === 4 && <Eye className="size-5" />}
                {step === 5 && <Lightbulb className="size-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold">{current.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {current.description}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {current.tips.map((tip) => (
                <div key={tip} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Got it
                <CheckCircle2 className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((value) => Math.min(guideSteps.length - 1, value + 1))}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Next
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
