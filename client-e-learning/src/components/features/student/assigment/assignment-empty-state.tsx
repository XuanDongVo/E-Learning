import { NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

interface AssignmentEmptyStateProps {
  onClearFilters: () => void;
  canClear: boolean;
  hasSearch: boolean;
}

export function AssignmentEmptyState({ onClearFilters, canClear, hasSearch }: AssignmentEmptyStateProps) {
  const t = useTranslations("student.assignments");

  return (
    <PaperSurface as="section" variant="lined" className="student-assignment-empty flex flex-col items-center gap-3 p-7 text-center sm:p-10">
      <NotebookPen size={33} className="text-primary" aria-hidden="true" />
      <ScrapbookHeading as="h2" className="student-section-title text-foreground">
        {t("emptyTitle")}
      </ScrapbookHeading>
      <p className="student-body max-w-md text-muted-foreground">
        {hasSearch ? t("emptyDescription") : canClear ? t("emptyFilterDescription") : t("emptyNoAssignments")}
      </p>
      {canClear && (
        <button type="button" className="student-control student-control--secondary px-5" onClick={onClearFilters}>
          {t("clearFilters")}
        </button>
      )}
    </PaperSurface>
  );
}
