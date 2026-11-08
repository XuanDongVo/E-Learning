import { NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";

interface AssignmentHeroProps {
  /** TODO includes IN_PROGRESS according to the server assignment contract. */
  todoCount: number | null;
}

export function AssignmentHero({ todoCount }: AssignmentHeroProps) {
  const t = useTranslations("student.assignments");

  return (
    <PaperSurface as="section" variant="kraft" tape tapePosition="right" className="student-assignment-hero">
      <div className="min-w-0 space-y-2">
        <p className="student-meta text-primary">{t("hero.eyebrow")}</p>
        <ScrapbookHeading as="h1" className="student-page-title text-foreground">
          {t("hero.title")}
        </ScrapbookHeading>
        <p className="student-body text-muted-foreground">
          {todoCount === null
            ? t("hero.description")
            : todoCount > 0
              ? t("hero.pending", { count: todoCount })
              : t("hero.completed")}
        </p>
      </div>
      <div className="student-assignment-hero__symbol" aria-hidden="true">
        <NotebookPen size={32} />
      </div>
    </PaperSurface>
  );
}
