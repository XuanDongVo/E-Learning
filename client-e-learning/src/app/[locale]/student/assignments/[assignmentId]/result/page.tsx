"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { StudentResultView } from "@/components/features/student/assignment-attempt/result/student-result-view";
import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";
import type { AttemptResultResponse } from "@/types/student/assignment-attempt";
import { toAppError } from "@/lib/errors/app-error";

export default function StudentAssignmentResultPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = Number(params.assignmentId);
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("student.assignmentAttempt");

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
        const data = await studentAssignmentAttemptService.result(assignmentId);
        if (!cancelled) setResult(data);
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

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6" role="alert">
          <h1 className="font-semibold text-destructive">{t("result.loadFailed")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/student/assignments" className="mt-4 inline-flex text-sm font-semibold text-primary underline">
            {t("backToAssignments")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <StudentResultView result={result} loading={loading} />
    </main>
  );
}
