"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { FullPageState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { StudentResultView } from "@/components/features/student/assignment-attempt/result/student-result-view";
import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";
import type { AttemptResultResponse } from "@/types/student/assignment-attempt";
import { toAppError } from "@/lib/errors/app-error";

export default function StudentAssignmentResultPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = Number(params.assignmentId);
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("student.assignmentAttempt");
  const tf = useTranslations("feedback");

  const [result, setResult] = useState<AttemptResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "STUDENT" || !Number.isSafeInteger(assignmentId) || assignmentId <= 0) {
      setLoading(false);
      setError(t("errors.studentOnly"));
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await studentAssignmentAttemptService.result(assignmentId);
        if (!response.data) {
          throw new Error("ASSESSMENT_ATTEMPT_RESULT_EMPTY");
        }
        if (!cancelled) setResult(response.data);
      } catch (err) {
        if (!cancelled) setError(toAppError(err).message || t("result.loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [assignmentId, authLoading, t, user]);

  if (authLoading || loading) {
    return <FullPageState variant="loading" title={t("result.loading")} />;
  }

  if (error) {
    return (
      <FullPageState
        variant="error"
        title={t("result.loadFailed")}
        description={error}
        action={
          <Link href="/student/assignments">
            <Button variant="secondary">{t("backToAssignments")}</Button>
          </Link>
        }
      />
    );
  }

  if (!result) {
    return (
      <FullPageState
        variant="empty"
        title={t("result.loadFailed")}
        description={tf("empty")}
        action={
          <Link href="/student/assignments">
            <Button variant="secondary">{t("backToAssignments")}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <main>
      <StudentResultView result={result} loading={false} />
    </main>
  );
}
