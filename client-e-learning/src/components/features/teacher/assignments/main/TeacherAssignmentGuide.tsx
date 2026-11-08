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
import { useTranslations } from "next-intl";

const guideStepIcons = [
  {
    icon: BookOpen,
  },
  {
    icon: Target,
  },
  {
    icon: CalendarClock,
  },
  {
    icon: FileQuestion,
  },
  {
    icon: ListChecks,
  },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onStartCreating: () => void;
};

export function TeacherAssignmentGuide({ open, onClose, onStartCreating }: Props) {
  const t = useTranslations("teacher.assignments.guide");
  const [step, setStep] = useState(0);
  const guideSteps = guideStepIcons.map((item, index) => ({
    ...item,
    title: t(`steps.${index + 1}.title`),
    description: t(`steps.${index + 1}.description`),
    tips: [t(`steps.${index + 1}.tip1`), t(`steps.${index + 1}.tip2`)],
  }));

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
            <p className="text-body-sm font-bold text-primary">{t("eyebrow")}</p>
            <h2 className="mt-1 text-section-title font-bold">{t("title")}</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
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
              <p className="text-body-sm font-bold text-primary">{t("stepProgress", { current: step + 1, total: guideSteps.length })}</p>
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
            <ArrowLeft className="size-4" /> {t("back")}
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={startCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground"
            >
              {t("startCreating")}
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((currentStep) => Math.min(guideSteps.length - 1, currentStep + 1))}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground"
            >
              {t("next")}
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
