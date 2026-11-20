import { useTranslations } from "next-intl";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";

interface AssignmentHeroProps {
  /** TODO includes IN_PROGRESS according to the server assignment contract. */
  todoCount: number | null;
}

export function AssignmentHero({ todoCount }: AssignmentHeroProps) {
  const t = useTranslations("student.assignments");

  return (
    <PaperSurface as="section" variant="kraft" emphasis="feature" tape tapePosition="right" className="student-assignment-hero relative overflow-hidden">
      <StudentPageHeading
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={todoCount === null
          ? t("hero.description")
          : todoCount > 0
            ? t("hero.pending", { count: todoCount })
            : t("hero.completed")}
        artwork={
          <div className="student-assignment-hero__symbol" aria-hidden="true">
            <StudentIllustration
              id="scene.open-notebook"
              decorative
              className="w-24 sm:w-28 transition-transform hover:scale-105"
            />
          </div>
        }
        artworkClassName="hidden sm:block"
      />
    </PaperSurface>
  );
}
