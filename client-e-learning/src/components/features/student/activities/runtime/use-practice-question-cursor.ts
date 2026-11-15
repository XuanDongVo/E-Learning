import { useMemo, useState } from "react";
import type {
  ActivitySession,
  ActivitySessionQuestion,
} from "@/types/student/activity-session";

type CursorSession = {
  questions: readonly Pick<ActivitySessionQuestion, "id" | "resolved">[];
};

export function resolvePracticeQuestionId(
  session: CursorSession | undefined,
  selectedId: number | undefined,
) {
  if (!session?.questions.length) return undefined;
  const selected = session.questions.find(
    (question) => question.id === selectedId,
  );
  if (selected) return selectedId;
  return (
    session.questions.find((question) => !question.resolved)?.id ??
    session.questions[0]?.id
  );
}

export function usePracticeQuestionCursor(session?: ActivitySession) {
  const [selectedId, setSelectedId] = useState<number>();
  const currentId = useMemo(
    () => resolvePracticeQuestionId(session, selectedId),
    [session, selectedId],
  );

  return [currentId, setSelectedId] as const;
}
