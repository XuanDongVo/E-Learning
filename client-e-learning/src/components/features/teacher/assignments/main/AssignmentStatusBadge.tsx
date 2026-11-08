import { StatusBadge } from "@/components/ui/status-badge";
import { useTranslations } from "next-intl";

type Props = {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export function AssignmentStatusBadge({ status }: Props) {
  const t = useTranslations("teacher.assignments.statuses");
  const labels: Record<Props["status"], string> = {
    DRAFT: t("draft"),
    PUBLISHED: t("active"),
    ARCHIVED: t("archived"),
  };
  return (
    <StatusBadge
      status={status}
      label={labels[status]}
      className="ml-1 align-middle text-[0.625rem]"
    />
  );
}
