"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import { formatDate } from "@/mock/mock-student-data";
import { Button } from "@/components/ui/button";

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const t = useTranslations("teacher.students");
  const tHub = useTranslations("teacher.students.hub");
  const tDetail = useTranslations("teacher.students.detail");
  const tForm = useTranslations("teacher.students.form");

  const student = useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => teacherStudentService.get(studentId),
    enabled: Number.isFinite(studentId),
  });
  const d = student.data?.data;
  const primary = d?.guardians?.find((g) => g.primary) ?? d?.guardians?.[0];

  const gender =
    d?.gender === "MALE"
      ? tForm("genderMale")
      : d?.gender === "FEMALE"
        ? tForm("genderFemale")
        : d?.gender === "OTHER"
          ? tForm("genderOther")
          : "—";

  const accountLabel = d?.accountStatus === "INACTIVE" ? t("locked") : t("active");

  const membership =
    !d?.className
      ? tHub("labels.membership.NONE")
      : d.membershipStatus === "ACTIVE"
        ? tHub("labels.membership.ACTIVE")
        : tHub("labels.membership.LEFT");

  const relationKey =
    primary?.relationship === "MOTHER" || primary?.relationship === "Mẹ"
      ? "MOTHER"
      : primary?.relationship === "FATHER" || primary?.relationship === "Bố"
        ? "FATHER"
        : primary?.relationship === "GUARDIAN"
          ? "GUARDIAN"
          : "OTHER";

  if (student.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">{tHub("profile.loading")}</p>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ProfileCard
        title={tDetail("personal")}
        action={
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs font-bold" asChild>
            <Link href={`/teacher/students/${studentId}/edit`}>
              <Pencil className="size-3" /> {t("table.edit")}
            </Link>
          </Button>
        }
        items={[
          [tForm("fullName"), d?.fullName ?? "—"],
          [tDetail("dob"), formatDate(d?.dateOfBirth)],
          [tDetail("gender"), gender],
        ]}
      />

      <ProfileCard
        title={tHub("profile.contact")}
        items={[
          [tDetail("email"), d?.email ?? "—"],
          [tDetail("phone"), d?.phone || "—"],
        ]}
      />

      <ProfileCard
        title={tDetail("guardians")}
        items={
          primary
            ? [
                [tForm("fullName"), primary.fullName],
                [tDetail("relationship"), tHub(`labels.relationship.${relationKey}`)],
                [tDetail("phone"), primary.phone || "—"],
                ...(primary.email ? [[tDetail("email"), primary.email] as [string, string]] : []),
              ]
            : [["", tDetail("noGuardians")]]
        }
      />

      <ProfileCard
        title={tHub("profile.classAndAccount")}
        items={[
          [
            tHub("overview.class"),
            d?.membershipStatus === "ACTIVE" && d.className ? d.className : t("noActiveClass"),
          ],
          [tHub("overview.membershipStatus"), membership],
          [tHub("profile.grade"), d?.gradeName || "—"],
          [tHub("overview.academicYear"), d?.academicYear || "—"],
          [tHub("profile.accountStatus"), accountLabel],
        ]}
      />
    </div>
  );
}

function ProfileCard({
  title,
  action,
  items,
}: {
  title: string;
  action?: React.ReactNode;
  items: [string, string][];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-extrabold">{title}</h2>
        {action}
      </div>
      <dl className="divide-y divide-border px-4 py-1 text-sm">
        {items.map(([label, value], i) =>
          label ? (
            <div key={`${label}-${i}`} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ) : (
            <p key={i} className="py-3 text-muted-foreground">
              {value}
            </p>
          ),
        )}
      </dl>
    </div>
  );
}
