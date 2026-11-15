import { useEffect } from "react";
import type { ActivitySessionQuestion } from "@/types/student/activity-session";
import { isChoice } from "@/utils/practice-utils";

export function usePracticeKeyboard({
  blocked,
  question,
  tryHard,
  locked,
  submit,
  requestHint,
  goPrevious,
  goNext,
  reset,
  pick,
}: {
  blocked: boolean;
  question?: ActivitySessionQuestion;
  tryHard?: boolean;
  locked: boolean;
  submit: () => void;
  requestHint: () => void;
  goPrevious: () => void;
  goNext: () => void;
  reset: () => void;
  pick: (key: string) => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (blocked) return;
      const typing =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement;
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
        return;
      }
      if (typing) return;
      if (event.ctrlKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        requestHint();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (!tryHard || locked) goNext();
      } else if (event.key === "Escape") {
        reset();
      } else if (/^[1-9]$/.test(event.key) && question) {
        const step = question.guided?.currentStep;
        const options =
          step?.type === "TRUE_FALSE"
            ? ["TRUE", "FALSE"]
            : step
              ? step.options.map((option) => option.key)
              : question.type === "TRUE_FALSE"
                ? ["TRUE", "FALSE"]
                : question.options.map((option) => option.key);
        const key = options[Number(event.key) - 1];
        if (key && (isChoice(question) || question.type === "TRUE_FALSE")) {
          pick(key);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    blocked,
    goNext,
    goPrevious,
    locked,
    pick,
    question,
    requestHint,
    reset,
    submit,
    tryHard,
  ]);
}
