import type { ReactNode } from "react";

const toneClass = {
  correct: "text-success",
  retry: "text-warning",
  incorrect: "text-destructive",
  neutral: "text-foreground",
};

export function AnswerFeedback({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof toneClass;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" className={`student-body ${toneClass[tone]}`}>
      {children}
    </div>
  );
}
