"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Eye, EyeOff, Flame, GraduationCap,
  LockKeyhole, Pencil, Save, ShieldCheck, Sparkles, UserRound, Users, X,
} from "lucide-react";
import type { Gender, GuardianRelationship, StudentGuardianRequest } from "@/types/student";
import type { StudentProfile } from "@/types/student/profile";
import { studentProfileService } from "@/services/student/student-profile.service";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { FullPageState } from "@/components/feedback";
import { toAppError } from "@/lib/errors/app-error";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { SketchProgress } from "@/components/student-ui/sketch-progress";

const relationshipLabel: Record<GuardianRelationship, string> = {
  FATHER: "Bố", MOTHER: "Mẹ", GUARDIAN: "Người giám hộ", OTHER: "Khác",
};
const genderLabel: Record<Gender, string> = {
  MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác",
};
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border-2 border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:bg-muted disabled:text-muted-foreground";

function Field({
  label, children,
}: {
  label: string;
  children: ReactNode;
}) {
  return <label className="block text-sm font-bold text-foreground">{label}{children}</label>;
}

function FieldValue({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-dashed border-border py-3 last:border-0">
      <dt className="student-typewriter text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-foreground">
        {value || "Chưa cập nhật"}
      </dd>
    </div>
  );
}

function studentGuardianRequest(
  guardian: StudentProfile["guardians"][number],
): StudentGuardianRequest {
  return {
    id: guardian.id,
    relationship: guardian.relationship,
    fullName: guardian.fullName,
    phone: guardian.phone,
    email: guardian.email ?? "",
    primary: guardian.primary,
  };
}

function ProfileContent({ profile, onSaved }: { profile: StudentProfile; onSaved: () => Promise<unknown> }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");
  const [gender, setGender] = useState<Gender | "">(profile.gender ?? "");
  const existingGuardian = profile.guardians.find((guardian) => guardian.primary)
    ?? profile.guardians[0];
  const [guardian, setGuardian] = useState<StudentGuardianRequest>(
    existingGuardian
      ? studentGuardianRequest(existingGuardian)
      : { relationship: "GUARDIAN", fullName: "", phone: "", email: "", primary: true },
  );
  const [guardianVisible, setGuardianVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const achievements = useQuery({
    queryKey: QUERY_KEYS.studentGamificationProfile,
    queryFn: studentGamificationService.profile,
  });
  const stats = achievements.data?.data;
  const levelRange = stats
    ? Math.max(0, stats.nextLevelRequiredXp - stats.currentLevelStartXp)
    : 0;

  function resetDraft() {
    setFullName(profile.fullName);
    setPhone(profile.phone ?? "");
    setDateOfBirth(profile.dateOfBirth ?? "");
    setGender(profile.gender ?? "");
    setGuardian(existingGuardian
      ? studentGuardianRequest(existingGuardian)
      : { relationship: "GUARDIAN", fullName: "", phone: "", email: "", primary: true });
    setEditing(false);
    setGuardianVisible(false);
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setNotice("");

    const name = fullName.trim();
    const guardianName = guardian.fullName.trim();
    const guardianPhone = guardian.phone.trim();
    if (!name) {
      setError("Vui lòng nhập họ tên học sinh.");
      return;
    }
    if ((guardianName && !guardianPhone) || (!guardianName && guardianPhone)) {
      setError("Vui lòng nhập đủ tên và số điện thoại người bảo hộ.");
      return;
    }
    if (existingGuardian && (!guardianName || !guardianPhone)) {
      setError("Không thể để trống thông tin người bảo hộ hiện có.");
      return;
    }

    // PUT replaces the backend's entire guardian collection. Retain all other
    // guardians, even though the Student UI intentionally edits only one.
    const guardians = profile.guardians.map(studentGuardianRequest);
    if (guardianName && guardianPhone) {
      const selected = {
        ...guardian,
        fullName: guardianName,
        phone: guardianPhone,
        email: guardian.email?.trim() || "",
        primary: existingGuardian ? guardian.primary : true,
      };
      const index = existingGuardian
        ? guardians.findIndex((item) => item.id === existingGuardian.id)
        : -1;
      if (index >= 0) guardians[index] = selected;
      else guardians.push(selected);
    }

    setSaving(true);
    try {
      await studentProfileService.update({
        fullName: name,
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        guardians,
      });
      setEditing(false);
      setGuardianVisible(false);
      await onSaved();
    } catch (cause) {
      setError(toAppError(cause).message || "Không thể lưu hồ sơ. Hãy thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="student-profile mx-auto max-w-6xl space-y-6 pb-12">
      <header className="space-y-2">
        <p className="student-typewriter text-xs text-primary">MY JOURNAL / HỒ SƠ HỌC SINH</p>
        <ScrapbookHeading as="h1" className="student-page-title text-foreground">
          Nhật ký của {profile.fullName}
        </ScrapbookHeading>
        <p className="max-w-xl text-sm text-muted-foreground">
          Thông tin học tập và liên hệ được lưu trong sổ tay cá nhân.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive bg-destructive-soft px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <PaperSurface as="section" tape className="p-5 sm:p-7" aria-label="Giới thiệu học sinh">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg border-2 border-ink bg-secondary shadow-[3px_3px_0_var(--student-ink)]">
            <UserRound className="h-11 w-11 text-foreground" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-xl font-extrabold text-foreground">{profile.fullName}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              {profile.currentClass
                ? `Lớp ${profile.currentClass.name} · ${profile.currentClass.gradeName}`
                : "Chưa có thông tin lớp học"}
            </p>
          </div>
          {stats && (
            <div className="grid grid-cols-2 gap-3 text-center sm:min-w-44">
              <div className="rounded-lg border border-ink bg-secondary p-3">
                <Flame className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
                <strong className="mt-1 block text-xl text-foreground">{stats.currentStreak}</strong>
                <span className="text-xs text-muted-foreground">ngày streak</span>
              </div>
              <div className="rounded-lg border border-ink bg-secondary p-3">
                <Sparkles className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
                <strong className="mt-1 block text-xl text-foreground">{stats.currentLevel}</strong>
                <span className="text-xs text-muted-foreground">level</span>
              </div>
            </div>
          )}
        </div>
        {stats && (
          <div className="mt-5 border-t border-dashed border-border pt-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-foreground">Tiến độ Level {stats.currentLevel + 1}</span>
              <span className="tabular-nums text-muted-foreground">
                {stats.xpIntoCurrentLevel.toLocaleString("vi-VN")} / {levelRange.toLocaleString("vi-VN")} XP
              </span>
            </div>
            <SketchProgress value={stats.xpIntoCurrentLevel} max={levelRange} label="Tiến độ XP lên cấp tiếp theo" />
          </div>
        )}
      </PaperSurface>

      <form onSubmit={save} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-foreground">Thông tin hồ sơ</h2>
            <p className="text-sm text-muted-foreground">Bạn có thể chỉnh sửa dữ liệu cá nhân và người bảo hộ.</p>
          </div>
          {editing ? (
            <button type="button" onClick={resetDraft} disabled={saving} className="student-ink-button student-ink-button--outline">
              <X className="h-4 w-4" aria-hidden="true" /> Hủy chỉnh sửa
            </button>
          ) : (
            <button type="button" onClick={() => { setEditing(true); setNotice(""); }} className="student-ink-button student-ink-button--outline">
              <Pencil className="h-4 w-4" aria-hidden="true" /> Chỉnh sửa
            </button>
          )}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <PaperSurface as="section" className="p-5 sm:p-6" aria-labelledby="student-profile-personal">
            <div className="flex items-center gap-2 border-b border-dashed border-border pb-3">
              <UserRound className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 id="student-profile-personal" className="text-lg font-extrabold">Thông tin cá nhân</h3>
            </div>
            {editing ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Họ và tên">
                    <input className={fieldClass} required maxLength={150} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </Field>
                </div>
                <Field label="Số điện thoại">
                  <input className={fieldClass} type="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
                <Field label="Ngày sinh">
                  <input className={fieldClass} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </Field>
                <Field label="Giới tính">
                  <select className={fieldClass} value={gender} onChange={(e) => setGender(e.target.value as Gender | "")}>
                    <option value="">Chưa cập nhật</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email (không thể sửa)">
                    <input className={fieldClass} value={profile.email} disabled readOnly />
                  </Field>
                </div>
              </div>
            ) : (
              <dl className="mt-2 grid gap-x-5 sm:grid-cols-2">
                <FieldValue label="HỌ VÀ TÊN" value={profile.fullName} />
                <FieldValue label="EMAIL" value={profile.email} />
                <FieldValue label="ĐIỆN THOẠI" value={profile.phone} />
                <FieldValue label="NGÀY SINH" value={profile.dateOfBirth} />
                <FieldValue label="GIỚI TÍNH" value={profile.gender ? genderLabel[profile.gender] : null} />
                <FieldValue label="TRẠNG THÁI" value={profile.accountStatus} />
              </dl>
            )}
          </PaperSurface>

          <div className="space-y-6">
            <PaperSurface as="section" className="p-5 sm:p-6" aria-labelledby="student-profile-guardian">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border pb-3">
                <h3 id="student-profile-guardian" className="flex items-center gap-2 text-lg font-extrabold">
                  <Users className="h-5 w-5 text-primary" aria-hidden="true" /> Người bảo hộ
                </h3>
                <button
                  type="button"
                  aria-label={guardianVisible ? "Ẩn thông tin người bảo hộ" : "Hiện thông tin người bảo hộ"}
                  aria-pressed={guardianVisible}
                  aria-controls="student-guardian-details"
                  onClick={() => setGuardianVisible((wasVisible) => !wasVisible)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {guardianVisible
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                  {guardianVisible ? "Ẩn" : "Hiện"}
                </button>
              </div>
              <div id="student-guardian-details" className="mt-4">
                {!guardianVisible ? (
                  <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted px-4 py-5">
                    <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Thông tin đang được ẩn</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tên, số điện thoại và email chỉ xuất hiện khi bạn chọn biểu tượng mắt.
                      </p>
                    </div>
                  </div>
                ) : editing ? (
                  <div className="space-y-4">
                    <Field label="Quan hệ">
                      <select
                        className={fieldClass}
                        value={guardian.relationship}
                        onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value as GuardianRelationship })}
                      >
                        {Object.entries(relationshipLabel).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Họ tên người bảo hộ">
                      <input className={fieldClass} required={Boolean(existingGuardian)} maxLength={150} value={guardian.fullName} onChange={(e) => setGuardian({ ...guardian, fullName: e.target.value })} />
                    </Field>
                    <Field label="Số điện thoại">
                      <input className={fieldClass} type="tel" required={Boolean(existingGuardian)} maxLength={30} value={guardian.phone} onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })} />
                    </Field>
                    <Field label="Email (không bắt buộc)">
                      <input className={fieldClass} type="email" maxLength={255} value={guardian.email ?? ""} onChange={(e) => setGuardian({ ...guardian, email: e.target.value })} />
                    </Field>
                    <p className="text-xs text-muted-foreground">
                      Chỉ chỉnh sửa người bảo hộ {existingGuardian ? "được chọn" : "đầu tiên"}.
                    </p>
                  </div>
                ) : existingGuardian ? (
                  <dl>
                    <FieldValue label="QUAN HỆ" value={relationshipLabel[existingGuardian.relationship]} />
                    <FieldValue label="HỌ VÀ TÊN" value={existingGuardian.fullName} />
                    <FieldValue label="SỐ ĐIỆN THOẠI" value={existingGuardian.phone} />
                    <FieldValue label="EMAIL" value={existingGuardian.email} />
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có thông tin người bảo hộ. Chọn Chỉnh sửa để thêm.
                  </p>
                )}
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                Thông tin được ẩn mặc định trên giao diện. Đây không thay thế cho kiểm soát quyền truy cập từ máy chủ.
              </p>
            </PaperSurface>

            <PaperSurface as="section" variant="kraft" className="p-5 sm:p-6" aria-labelledby="student-profile-class">
              <h3 id="student-profile-class" className="flex items-center gap-2 text-lg font-extrabold">
                <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" /> Lớp học
              </h3>
              <dl className="mt-2">
                <FieldValue label="LỚP" value={profile.currentClass?.name} />
                <FieldValue label="KHỐI" value={profile.currentClass?.gradeName} />
                <FieldValue label="NĂM HỌC" value={profile.currentClass?.academicYear} />
              </dl>
            </PaperSurface>
          </div>
        </div>

        {editing && (
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="student-ink-button disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        )}
      </form>
    </main>
  );
}

export default function StudentProfilePage() {
  const profile = useQuery({
    queryKey: ["student-profile"],
    queryFn: studentProfileService.get,
  });

  if (profile.isPending) {
    return <FullPageState variant="loading" title="Đang tải hồ sơ học sinh..." />;
  }
  if (profile.isError || !profile.data?.data) {
    return <FullPageState variant="error" title="Không thể tải hồ sơ học sinh." />;
  }
  return (
    <ProfileContent
      key={`${profile.data.data.userId}-${profile.dataUpdatedAt}`}
      profile={profile.data.data}
      onSaved={() => profile.refetch()}
    />
  );
}
