"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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

export default function StudentEditPage() {
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
  const [guardianRelation, setGuardianRelation] = useState<GuardianRelationship>("MOTHER");
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
      setGuardianRelation((primary.relationship as GuardianRelationship) || "MOTHER");
    }
  }, [d, primary]);

  const save = useMutation({
    mutationFn: () =>
      teacherStudentService.updateProfile(studentId, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: (gender as Gender) || undefined,
        guardians: guardianName.trim()
          ? [
              {
                id: primary?.id,
                fullName: guardianName.trim(),
                phone: guardianPhone.trim() || "-",
                relationship: guardianRelation,
                email: primary?.email ?? undefined,
                primary: true,
              },
            ]
          : [],
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["teacher-student", studentId] });
      router.push(`/teacher/students/${studentId}/profile`);
    },
    onError: (err) => setError(getAppErrorMessage(err, tErrors)),
  });

  if (student.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">{tHub("edit.loading")}</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold">{tHub("edit.title")}</h2>
          <p className="text-xs text-muted-foreground">{tHub("edit.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/teacher/students/${studentId}/profile`}>{tForm("cancel")}</Link>
          </Button>
          <Button
            size="sm"
            disabled={save.isPending}
            onClick={() => {
              setError(null);
              save.mutate();
            }}
          >
            {save.isPending ? tHub("edit.saving") : tHub("edit.save")}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form className="grid gap-5 lg:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-extrabold">{tDetail("personal")}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={tForm("fullName")}>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 text-sm" />
              </Field>
              <Field label={tForm("dateOfBirth")}>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-10 text-sm"
                />
              </Field>
              <Field label={tForm("gender")}>
                <Select value={gender || undefined} onValueChange={setGender}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder={tForm("selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">{tForm("genderMale")}</SelectItem>
                    <SelectItem value="FEMALE">{tForm("genderFemale")}</SelectItem>
                    <SelectItem value="OTHER">{tForm("genderOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={tForm("phone")}>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-sm" />
              </Field>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold">{tDetail("guardians")}</h3>
              <span className="text-xs text-muted-foreground">{tForm("guardian")}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={tForm("guardianName")}>
                <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="h-10 text-sm" />
              </Field>
              <Field label={tForm("relationship")}>
                <Select
                  value={guardianRelation}
                  onValueChange={(v) => setGuardianRelation(v as GuardianRelationship)}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOTHER">{tForm("relMother")}</SelectItem>
                    <SelectItem value="FATHER">{tForm("relFather")}</SelectItem>
                    <SelectItem value="GUARDIAN">{tForm("relGuardian")}</SelectItem>
                    <SelectItem value="OTHER">{tForm("genderOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={tForm("guardianPhone")}>
                <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className="h-10 text-sm" />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-extrabold">{tHub("profile.classAndAccount")}</h3>
            <p className="text-xs text-muted-foreground">{tHub("edit.accountHint")}</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{tHub("profile.accountStatus")}</span>
                <span className="font-bold">
                  {d?.accountStatus === "INACTIVE" ? t("locked") : t("active")}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{tHub("overview.class")}</span>
                <span className="font-bold">
                  {d?.membershipStatus === "ACTIVE" && d.className ? d.className : t("noActiveClass")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
