"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import { formatDate, formatDateTime, formatScorePercent } from "@/utils/format";
import { Button } from "@/components/ui/button";

export function StudentOverviewView() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const base = `/teacher/students/${studentId}`;
  const t = useTranslations("teacher.students.hub");
  const tDetail = useTranslations("teacher.students.detail");
  const tForm = useTranslations("teacher.students.form");
  const locale = useLocale();

  const student = useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => teacherStudentService.get(studentId),
    enabled: Number.isFinite(studentId),
  });
  const summary = useQuery({
    queryKey: ["teacher-student-summary", studentId],
    queryFn: () => teacherStudentService.learningSummary(studentId),
    enabled: Number.isFinite(studentId),
  });
  const assignments = useQuery({
    queryKey: ["teacher-student-assignments-preview", studentId],
    queryFn: () => teacherStudentService.listAssignments(studentId, { page: 1, size: 3 }),
    enabled: Number.isFinite(studentId),
  });
  const sessions = useQuery({
    queryKey: ["teacher-student-sessions-preview", studentId],
    queryFn: () => teacherStudentService.listActivitySessions(studentId, { page: 1, size: 3 }),
    enabled: Number.isFinite(studentId),
  });

  const d = student.data?.data;
  const primary = d?.guardians?.find((g) => g.primary) ?? d?.guardians?.[0];
  const s = summary.data?.data;
  const assignmentItems = assignments.data?.data?.items ?? [];
  const sessionItems = sessions.data?.data?.items ?? [];

  const gender =
    d?.gender === "MALE"
      ? tForm("genderMale")
      : d?.gender === "FEMALE"
        ? tForm("genderFemale")
        : d?.gender === "OTHER"
          ? tForm("genderOther")
          : "—";

  const membership =
    !d?.className
      ? t("labels.membership.NONE")
      : d.membershipStatus === "ACTIVE"
        ? t("labels.membership.ACTIVE")
        : t("labels.membership.LEFT");

  const relationKey =
    primary?.relationship === "MOTHER"
      ? "MOTHER"
      : primary?.relationship === "FATHER"
        ? "FATHER"
        : primary?.relationship === "GUARDIAN"
          ? "GUARDIAN"
          : "OTHER";

  const counts = [
    { key: "assigned" as const, val: s?.assigned ?? 0 },
    { key: "submitted" as const, val: s?.submitted ?? 0 },
    { key: "late" as const, val: s?.late ?? 0 },
    { key: "timedOut" as const, val: s?.timedOut ?? 0 },
    { key: "notStarted" as const, val: s?.notStarted ?? 0 },
    { key: "inProgress" as const, val: s?.inProgress ?? 0 },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.6fr]">
      <div className="grid content-start gap-5">
        <Panel title={t("overview.personal")}>
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            <Row label={tDetail("dob")} value={formatDate(d?.dateOfBirth, locale)} />
            <Row label={tDetail("gender")} value={gender} />
            <Row label={tDetail("phone")} value={d?.phone || "—"} />
            <Row label={t("profile.grade")} value={d?.gradeName || "—"} />
          </dl>
        </Panel>

        <Panel title={t("overview.currentClass")}>
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            <Row
              label={t("overview.class")}
              value={
                d?.membershipStatus === "ACTIVE" && d.className
                  ? d.className
                  : t("overview.noClass")
              }
            />
            <Row label={t("overview.membershipStatus")} value={membership} />
            <Row label={t("overview.academicYear")} value={d?.academicYear || "—"} />
            <Row label={t("overview.joinedAt")} value={formatDate(d?.joinedAt, locale)} />
          </dl>
        </Panel>

        <Panel title={tDetail("guardians")}>
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            {primary ? (
              <>
                <Row label={t(`labels.relationship.${relationKey}`)} value={primary.fullName} />
                <Row label={tDetail("phone")} value={primary.phone || "—"} />
              </>
            ) : (
              <p className="py-3 text-sm text-muted-foreground">{tDetail("noGuardians")}</p>
            )}
          </dl>
        </Panel>
      </div>

      <div className="grid content-start gap-5">
        <Panel
          title={t("assignments.title")}
          description={t("overview.assignmentDesc")}
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold" >
              <Link href={`${base}/assignments`}>
                {t("overview.viewAll")} <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="grid grid-cols-2 border-b border-border sm:grid-cols-3 lg:grid-cols-6">
            {counts.map((item) => (
              <div key={item.key} className="border-r border-border p-3 last:border-r-0">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {t(`overview.counts.${item.key}`)}
                </p>
                <p className="mt-1 text-xl font-extrabold">{item.val}</p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-border">
            {assignmentItems.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">{t("overview.noAssignments")}</p>
            )}
            {assignmentItems.map((a) => (
              <div key={a.assignmentId} className="flex items-center justify-between p-4 text-xs">
                <div>
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="mt-0.5 text-muted-foreground">{formatDateTime(a.dueAt, locale)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold">
                    {t(`assignmentStatus.${a.status}`)}
                  </span>
                  <span className="min-w-10 text-right text-sm font-extrabold">
                    {formatScorePercent(a.scorePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={t("overview.recentPractice")}
          description={t("activities.subtitle")}
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold" >
              <Link href={`${base}/activities`}>
                {t("overview.viewHistory")} <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {sessionItems.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">{t("overview.noSessions")}</p>
            )}
            {sessionItems.map((sItem) => (
              <div key={sItem.sessionId} className="flex items-center justify-between p-4 text-xs">
                <div>
                  <p className="text-sm font-bold">{sItem.activityName}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {sItem.unitLabel} · {formatDateTime(sItem.completedAt ?? sItem.startedAt, locale)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">{t(`sessionMode.${sItem.mode}`)}</span>
                  <p className="text-muted-foreground">
                    {t(`sessionStatus.${sItem.status}`)}
                    {sItem.status !== "ABANDONED"
                      ? ` · ${sItem.firstCorrectCount}/${sItem.totalQuestions}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="text-sm font-extrabold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
