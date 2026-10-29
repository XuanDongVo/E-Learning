"use client";

import { use } from "react";
import { StudentAssignmentIntro } from "@/components/features/student/assignment-attempt/intro/student-assigment-intro";
import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function StudentAssignmentsRoute({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);
  const t = useTranslations("student.assignmentAttempt.intro");

  const {
    data: assignmentResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assignment-intro", assignmentId],
    queryFn: () => studentAssignmentAttemptService.intro(Number(assignmentId)),
    enabled: Boolean(assignmentId) && Number.isFinite(Number(assignmentId)),
  });
  const assignment = assignmentResponse?.data;

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-6 max-w-[1440px] mx-auto pb-24 sm:pb-20 lg:pb-4 lg:h-screen lg:max-h-screen lg:overflow-hidden">
      {isLoading && <p>{t("loading")}</p>}
      {isError && <p>{t("loadFailed")}</p>}
      {!isLoading && !isError && assignment && (
        <StudentAssignmentIntro
          data={assignment}
          onBack={() => history.back()}
          onStart={() => {}}
          onResume={() => {}}
        />
      )}
      {!isLoading && !isError && !assignment && <p>{t("unavailable")}</p>}
    </div>
  );
}
