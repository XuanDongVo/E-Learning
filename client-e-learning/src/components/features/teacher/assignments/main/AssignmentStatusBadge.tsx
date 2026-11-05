import { StatusBadge } from "@/components/ui/status-badge";

type Props = {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const LABELS: Record<Props["status"], string> = {
  DRAFT: "Draft",
  PUBLISHED: "Active",
  ARCHIVED: "Archived",
};

export function AssignmentStatusBadge({ status }: Props) {
  return (
    <StatusBadge
      status={status}
      label={LABELS[status]}
      className="ml-1 align-middle text-[0.625rem]"
    />
  );
}
