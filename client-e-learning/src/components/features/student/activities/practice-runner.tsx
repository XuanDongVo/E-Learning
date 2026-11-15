"use client";

import { usePracticeController } from "./runtime/controller/use-practice-controller";
import { PracticeShell } from "./runtime/shell/practice-shell";

export function PracticeRunner({
  unitId,
  activityId,
}: {
  unitId: number;
  activityId: number;
}) {
  const controller = usePracticeController({ unitId, activityId });
  return <PracticeShell unitId={unitId} controller={controller} />;
}
