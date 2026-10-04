import {
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Users,
} from "lucide-react";

import { SummaryCard } from "./SummaryCard";

type Props = {
  activeCount: number;
};

export function AssignmentSummary({
  activeCount,
}: Props) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={<Clock3 className="size-4" />}
        label="Active"
        value={activeCount}
        hint="Assignments currently open to students"
        tone="orange"
      />

      <SummaryCard
        icon={<FileSpreadsheet className="size-4" />}
        label="Needs grading"
        value="—"
        hint="Submission data is not available yet"
        tone="amber"
      />

      <SummaryCard
        icon={<CheckCircle2 className="size-4" />}
        label="Submitted on time"
        value="—"
        hint="Result data is not available yet"
        tone="green"
      />

      <SummaryCard
        icon={<Users className="size-4" />}
        label="Missing submissions"
        value="—"
        hint="Result data is not available yet"
        tone="blue"
      />
    </section>
  );
}