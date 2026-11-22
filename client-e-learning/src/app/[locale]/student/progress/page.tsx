import { BarChart2 } from "lucide-react";
import { StudentStreakOverview } from "@/features/student/gamification/student-streak-overview";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";

export default function StudentProgressPage() {
  return (
    <section aria-labelledby="student-progress-title" className="space-y-6 pb-8">
      <StudentPageHeading
        eyebrow="THEO DÕI HỌC TẬP"
        titleId="student-progress-title"
        title="Tiến trình của bạn"
        description="Theo dõi Level, XP, chuỗi ngày học và mốc thành tích đã được hệ thống ghi nhận."
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
        <span className="student-meta">Dữ liệu thời gian thực</span>
      </div>
      <StudentStreakOverview />
    </section>
  );
}
