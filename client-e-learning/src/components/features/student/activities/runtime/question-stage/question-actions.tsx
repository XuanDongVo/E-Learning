import type { ReactNode } from "react";

export function QuestionActions({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-2 max-sm:[&>*]:w-full sm:flex sm:flex-wrap sm:justify-end">
      {children}
    </div>
  );
}
