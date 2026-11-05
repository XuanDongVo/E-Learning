"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  GraduationCap,
  Mail,
  Phone,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import type { Gender, GuardianRelationship } from "@/types/student";
import { cn } from "@/lib/utils";
import { SkeletonCard } from "@/components/ui/skeleton/skeleton-card";
import { PageBanner } from "@/components/feedback";
import { getInitials } from "@/utils/format";

const GUARDIAN_RELATIONSHIPS: readonly GuardianRelationship[] = [
  "FATHER",
  "MOTHER",
  "GUARDIAN",
  "OTHER",
];

function normalizeRelationship(
  value: string | null | undefined,
): GuardianRelationship {
  const normalized = (value ?? "").trim().toUpperCase();
  return GUARDIAN_RELATIONSHIPS.includes(normalized as GuardianRelationship)
    ? (normalized as GuardianRelationship)
    : "MOTHER";
}

export function StudentEditForm() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.studentId);
  const qc = useQueryClient();
  const t = useTranslations("teacher.students");
  const tHub = useTranslations("teacher.students.hub");
  const tForm = useTranslations("teacher.students.form");
  const tDetail = useTranslations("teacher.students.detail");
  const tErrors = useTranslations("errors");

  const student = useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => teacherStudentService.get(studentId),
    enabled: Number.isFinite(studentId),
  });
  const d = student.data?.data;
  const primary = d?.guardians?.find((g) => g.primary) ?? d?.guardians?.[0];

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string>("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] =
    useState<GuardianRelationship>("MOTHER");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!d) return;
    setFullName(d.fullName ?? "");
    setPhone(d.phone ?? "");
    setDateOfBirth(d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : "");
    setGender(d.gender ?? "");
    if (primary) {
      setGuardianName(primary.fullName ?? "");
      setGuardianPhone(primary.phone ?? "");
      setGuardianRelation(normalizeRelationship(primary.relationship));
    } else {
      setGuardianName("");
      setGuardianPhone("");
      setGuardianRelation("MOTHER");
    }
  }, [d, primary]);

  const save = useMutation({
    mutationFn: () => {
      const name = guardianName.trim();
      const relation = normalizeRelationship(guardianRelation);

      return teacherStudentService.updateProfile(studentId, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: (gender as Gender) || undefined,
        guardians: name
          ? [
              {
                ...(primary?.id != null ? { id: primary.id } : {}),
                fullName: name,
                phone: guardianPhone.trim() || "-",
                relationship: relation,
                email: primary?.email ?? undefined,
                primary: true,
              },
            ]
          : [],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["teacher-student", studentId] });
      router.push(`/teacher/students/${studentId}/profile`);
    },
    onError: (err) => setError(getAppErrorMessage(err, tErrors)),
  });

  const initials = getInitials(d?.fullName);

  const accountActive = d?.accountStatus !== "INACTIVE";
  const classLabel =
    d?.membershipStatus === "ACTIVE" && d.className
      ? d.className
      : t("noActiveClass");

  if (student.isLoading) {
    return <SkeletonCard lines={8} showFooter />;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {tHub("edit.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tHub("edit.subtitle")}
          </p>
        </div>
      </div>

      <div className="mb-4">{error && <PageBanner tone="error" message={error} />}</div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <form
          className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            save.mutate();
          }}
        >
          <Section
            icon={<UserRound className="size-4" />}
            title={tHub("edit.sections.student")}
            description={tHub("edit.sections.studentHint")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={tForm("fullName")}>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10"
                  required
                />
              </Field>
              <Field label={tForm("dateOfBirth")}>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label={tForm("gender")}>
                <Select value={gender || undefined} onValueChange={setGender}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={tForm("selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">{tForm("genderMale")}</SelectItem>
                    <SelectItem value="FEMALE">
                      {tForm("genderFemale")}
                    </SelectItem>
                    <SelectItem value="OTHER">
                      {tForm("genderOther")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={tForm("phone")}>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10"
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={<GraduationCap className="size-4" />}
            title={tHub("edit.sections.learning")}
            description={tHub("edit.sections.learningHint")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={tHub("overview.class")}>
                <Input
                  value={classLabel}
                  disabled
                  className="h-10 bg-muted/40"
                />
              </Field>
              <Field label={tHub("profile.accountStatus")}>
                <Input
                  value={accountActive ? t("active") : t("locked")}
                  disabled
                  className="h-10 bg-muted/40"
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              {tHub("edit.accountHint")}
            </p>
          </Section>

          <Section
            icon={<Users className="size-4" />}
            title={tHub("edit.sections.contact")}
            description={tHub("edit.sections.contactHint")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={tDetail("email")}>
                <Input
                  value={d?.email ?? ""}
                  disabled
                  className="h-10 bg-muted/40"
                />
              </Field>
              <Field label={tForm("phone")}>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label={tForm("guardianName")}>
                <Input
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label={tForm("guardianPhone")}>
                <Input
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="h-10"
                />
              </Field>
              <Field label={tForm("relationship")}>
                <Select
                  value={guardianRelation}
                  onValueChange={(v) =>
                    setGuardianRelation(normalizeRelationship(v))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOTHER">{tForm("relMother")}</SelectItem>
                    <SelectItem value="FATHER">{tForm("relFather")}</SelectItem>
                    <SelectItem value="GUARDIAN">
                      {tForm("relGuardian")}
                    </SelectItem>
                    <SelectItem value="OTHER">
                      {tForm("genderOther")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" type="button" nativeButton={false} render={<Link href={`/teacher/students/${studentId}/profile`} />}>
              {tForm("cancel")}
            </Button>
            <Button type="submit" disabled={save.isPending} className="gap-1.5">
              {save.isPending ? tHub("edit.saving") : tHub("edit.save")}
            </Button>
          </div>
        </form>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary">
              {initials || "HS"}
            </div>
            <p className="text-base font-extrabold">{d?.fullName ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{classLabel}</p>
            <dl className="mt-4 space-y-2.5 text-xs">
              <SideRow
                icon={<GraduationCap className="size-3.5" />}
                label={tHub("overview.class")}
                value={classLabel}
              />
              <SideRow
                icon={<Mail className="size-3.5" />}
                label={tDetail("email")}
                value={d?.email ?? "—"}
              />
              <SideRow
                icon={<Phone className="size-3.5" />}
                label={tDetail("phone")}
                value={phone || d?.phone || "—"}
              />
            </dl>
          </div>

          <div className="rounded-2xl border border-sky-200/80 bg-sky-50 p-4 text-xs text-sky-900">
            <div className="mb-1 flex items-center gap-1.5 font-bold">
              <Shield className="size-3.5" />
              {tHub("edit.privacyTitle")}
            </div>
            <p className="leading-relaxed text-sky-800/90">
              {tHub("edit.privacyBody")}
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-4 text-xs",
              accountActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900",
            )}
          >
            <p className="font-bold">
              {accountActive
                ? tHub("edit.statusActive")
                : tHub("edit.statusLocked")}
            </p>
            <p className="mt-0.5 opacity-80">{d?.email}</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-border pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-extrabold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-bold text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SideRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground">{label}</p>
        <p className="truncate font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
