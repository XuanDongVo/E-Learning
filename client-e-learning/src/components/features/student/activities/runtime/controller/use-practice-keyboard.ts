import { useEffect } from "react";
import type { ActivitySessionQuestion } from "@/types/student/activity-session";

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
      if (blocked || event.isComposing || event.repeat || event.altKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("[role=dialog], [role=alertdialog], [data-state=open][role=menu]")) return;
      const typing =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement;
      if (event.key === "Enter" && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        submit();
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        requestHint();
        return;
      }
      if (typing || event.ctrlKey) return;
      if (event.key === "ArrowLeft") {
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
        const type = step?.type ?? question.type;
        if (key && (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE")) {
          event.preventDefault();
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
