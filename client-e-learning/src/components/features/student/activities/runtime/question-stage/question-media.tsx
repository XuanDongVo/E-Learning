import type { ReactNode } from "react";

/**
 * Stable renderer boundary for media once ActivityQuestionSnapshot exposes it.
 * The runtime deliberately does not invent a media wire contract.
 */
export function QuestionMedia({ children }: { children?: ReactNode }) {
  return children ? <div className="space-y-3">{children}</div> : null;
}
