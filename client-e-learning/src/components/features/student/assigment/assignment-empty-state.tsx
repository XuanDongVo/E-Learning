import { useTranslations } from "next-intl";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";

interface AssignmentEmptyStateProps {
  onClearFilters: () => void;
  canClear: boolean;
  hasSearch: boolean;
}

export function AssignmentEmptyState({ onClearFilters, canClear, hasSearch }: AssignmentEmptyStateProps) {
  const t = useTranslations("student.assignments");

  return (
    <PaperSurface as="section" variant="lined" className="student-assignment-empty flex flex-col items-center gap-3 p-7 text-center sm:p-10">
      <StudentIllustration
        id={hasSearch ? "illustration.no-results" : "illustration.no-lessons"}
        decorative
        className="mx-auto w-32 sm:w-40"
      />
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
