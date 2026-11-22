import { BarChart2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StudentStreakOverview } from "@/features/student/gamification/student-streak-overview";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";

export default async function StudentProgressPage() {
  const t = await getTranslations("student.progress.page");
  return (
    <section aria-labelledby="student-progress-title" className="space-y-6 pb-8">
      <StudentPageHeading
        eyebrow={t("eyebrow")}
        titleId="student-progress-title"
        title={t("title")}
        description={t("description")}
        artwork={
          <StudentIllustration
            id="illustration.unit-journey"
            decorative
            className="w-36 lg:w-44"
          />
        }
        artworkClassName="hidden sm:block"
      />
      <div className="flex items-center gap-2 text-primary">
        <BarChart2 className="h-5 w-5" aria-hidden="true" />
        <span className="student-meta">{t("live")}</span>
      </div>
      <StudentStreakOverview />
    </section>
  );
}
