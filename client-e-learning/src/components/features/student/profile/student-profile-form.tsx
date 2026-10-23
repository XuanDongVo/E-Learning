"use client";

import type { Gender, StudentGuardianRequest } from "@/types/student";
import type { StudentProfile } from "@/types/student/profile";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { useQuery } from "@tanstack/react-query";
import { studentProfileService } from "@/services/student/student-profile.service";

function StudentProfileFormFields({
  profile,
  refetch,
}: {
  profile: StudentProfile;
  refetch: () => Promise<unknown>;
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || "");
  const [gender, setGender] = useState<Gender | "">(profile.gender || "");
  const g = profile.guardians?.[0];
  const [guardian, setGuardian] = useState<StudentGuardianRequest | null>(
    g
      ? {
          id: g.id,
          relationship: g.relationship,
          fullName: g.fullName,
          phone: g.phone,
          email: g.email || "",
          primary: g.primary,
        }
      : {
          relationship: "GUARDIAN",
          fullName: "",
          phone: "",
          email: "",
          primary: true,
        },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await studentProfileService.update({
        fullName,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        phone,
        guardians: guardian ? [guardian] : [],
      });
      await refetch();
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(getAppErrorMessage(err, tErrors as (key: string) => string));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="text-ui-3xl font-extrabold">My profile</h1>
        <p className="mt-1 text-neutral-muted">
          Keep your personal and guardian information up to date.
        </p>
      </div>
      {message && (
        <p role="status" className="text-body-sm font-bold">
          {message}
        </p>
      )}
      <section className="rounded-md border border-border-color bg-card-bg p-5">
        <h2 className="font-extrabold">Personal information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="font-bold">
            Full name
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"
            />
          </label>
          <label className="font-bold">
            Email
            <input
              disabled
              value={profile.email}
              className="mt-2 h-10 w-full rounded-md border border-border-color bg-background-app px-3 font-normal"
            />
          </label>
          <label className="font-bold">
            Date of birth
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"
            />
          </label>
          <label className="font-bold">
            Gender
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | "")}
              className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="font-bold md:col-span-2">
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"
            />
          </label>
        </div>
      </section>
      <section className="rounded-md border border-border-color bg-card-bg p-5">
        <h2 className="font-extrabold">Guardian</h2>
        {guardian ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="font-bold">
              Name
              <input
                required
                value={guardian.fullName}
                onChange={(e) =>
                  setGuardian({ ...guardian, fullName: e.target.value })
                }
                className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"
              />
            </label>
            <label className="font-bold">
              Phone
              <input
                required
                value={guardian.phone}
                onChange={(e) =>
                  setGuardian({ ...guardian, phone: e.target.value })
                }
                className="mt-2 h-10 w-full rounded-md border border-border-color px-3 font-normal"
              />
            </label>
          </div>
        ) : (
          <p className="mt-3 text-neutral-muted">No guardian information.</p>
        )}
      </section>
      <div className="flex justify-end">
        <button
          disabled={saving}
          className="h-10 rounded-md bg-primary px-4 font-bold text-primary-foreground"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export function StudentProfileForm() {
  const tErrors = useTranslations("errors");
  const q = useQuery({
    queryKey: ["student-profile"],
    queryFn: studentProfileService.get,
  });
  const profile = q.data?.data;

  if (q.isLoading)
    return <div className="p-8 text-neutral-muted">Loading profile...</div>;
  if (q.isError || !profile)
    return (
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700"
      >
        Unable to load profile.
      </div>
    );

  return (
    <StudentProfileFormFields
      key={profile.email}
      profile={profile}
      refetch={q.refetch}
    />
  );
}
