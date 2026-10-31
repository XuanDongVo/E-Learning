"use client";

import { use, useCallback, useState } from "react";
import { StudentAssignmentIntro } from "@/components/features/student/assignment-attempt/intro/student-assigment-intro";
import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";
import { getOrCreateAttemptSessionCredential } from "@/services/student/assessment-attempt-session-store";
import { storeAttemptRuntime } from "@/services/student/assessment-attempt-runtime-store";
import { useAuth } from "@/components/auth/auth-provider";
import { toAppError } from "@/lib/errors/app-error";
import { useRouter } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function StudentAssignmentsIntroRoute({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);
  const parsedAssignmentId = Number(assignmentId);
  const validAssignmentId = Number.isSafeInteger(parsedAssignmentId) && parsedAssignmentId > 0;
  const t = useTranslations("student.assignmentAttempt.intro");
  const runtimeT = useTranslations("student.assignmentAttempt");
  const router = useRouter();
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const {
    data: assignmentResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assignment-intro", assignmentId],
    queryFn: () => studentAssignmentAttemptService.intro(parsedAssignmentId),
    enabled: validAssignmentId,
  });
  const assignment = assignmentResponse?.data;

  const startOrResume = useCallback(async () => {
    if (!user || user.role !== "STUDENT" || !validAssignmentId || isStarting) {
      return;
    }

    setIsStarting(true);
    setStartError(null);
    try {
      const activeSessionId = await getOrCreateAttemptSessionCredential(user.id, parsedAssignmentId);
      const response = await studentAssignmentAttemptService.startOrResume(
        parsedAssignmentId,
        { activeSessionId },
      );
      if (!response.data) throw new Error("ASSESSMENT_ATTEMPT_EMPTY_RESPONSE");

      storeAttemptRuntime(user.id, parsedAssignmentId, response.data);
      router.push(`/student/assignments/${parsedAssignmentId}`);
    } catch (error) {
      setStartError(toAppError(error).code);
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, parsedAssignmentId, router, user, validAssignmentId]);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-4 p-4 pb-24 sm:p-5 lg:p-6">
      {isLoading && <p>{t("loading")}</p>}
      {isError && <p>{t("loadFailed")}</p>}
      {!isLoading && !isError && assignment && (
        <>
          {startError && (
            <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-950">
              {runtimeT("errors.startFailedDescription")}
            </p>
          )}
          <StudentAssignmentIntro
            data={assignment}
            onBack={() => router.push("/student/assignments")}
            onStart={() => void startOrResume()}
            onResume={() => void startOrResume()}
          />
          {isStarting && (
            <p role="status" className="text-center text-sm text-neutral-muted">
              {runtimeT("states.starting")}
            </p>
          )}
        </>
      )}
      {!isLoading && !isError && !assignment && <p>{t("unavailable")}</p>}
    </div>
  );
}
