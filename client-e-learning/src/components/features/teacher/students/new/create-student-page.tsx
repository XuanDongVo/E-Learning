"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { classService } from "@/services/class.service";
import { studentService } from "@/services/student.service";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { PageBanner } from "@/components/feedback";
import type {
  CreateStudentRequest,
  Gender,
  StudentGuardianRequest,
} from "@/types/student";

const emptyGuardian: StudentGuardianRequest = {
  relationship: "GUARDIAN",
  fullName: "",
  phone: "",
  email: "",
  primary: true,
};

export function NewStudentPage() {
  const tErrors = useTranslations("errors");
  const t = useTranslations("teacher.students.form");

  // State hiển thị/ẩn mật khẩu (mặc định hiển thị để giáo viên đối soát)
  const [showPassword, setShowPassword] = useState(true);

  // Lấy danh sách lớp học ACTIVE
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: classService.list,
  });
  const classes = (classesData?.data ?? []).filter(
    (item) => item.status === "ACTIVE",
  );

  const [form, setForm] = useState<CreateStudentRequest>({
    fullName: "",
    email: "",
    password: "123456",
    classId: 0,
    dateOfBirth: "",
    gender: undefined,
    phone: "",
    guardians: [emptyGuardian],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof CreateStudentRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await studentService.create(form);
    } catch (err) {
      setError(getAppErrorMessage(err, tErrors as (key: string) => string));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div >
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between  pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/vi/teacher/students"
              className="inline-flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
              title="Quay lại danh sách học sinh"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {t("title") || "Thêm học sinh mới"}
              </h1>
              <p className="text-sm sm:text-sm text-muted-foreground">
                {t("subtitle") || "Tạo hồ sơ tài khoản và xếp lớp cho học sinh"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <PageBanner tone="error" message={error} />}

      <form onSubmit={submit} className="space-y-6">
        {/* SECTION 1: Thông tin tài khoản & Đăng nhập */}
        <section className="rounded-xl border-2 border-border shadow-pop bg-card p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <User className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Thông tin tài khoản & Xếp lớp
              </h2>
              <p className="text-sm text-muted-foreground">
                Tài khoản dùng để đăng nhập hệ thống học tập
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 ">
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("fullName") || "Họ và tên"} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Email tài khoản */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("email") || "Email học sinh"} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="student@school.edu.vn"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Mật khẩu khởi tạo - Hiển thị và có nút Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t("password") || "Mật khẩu khởi tạo"}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Mặc định: <code className="font-mono text-primary font-bold">123456</code>
                </span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Phân lớp học */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("assignClass") || "Phân lớp học"}{" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  required
                  value={form.classId || ""}
                  onChange={(e) => setField("classId", Number(e.target.value))}
                  disabled={isLoadingClasses}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    {isLoadingClasses
                      ? "Đang tải danh sách lớp..."
                      : t("selectClass") || "-- Chọn lớp học tiếp nhận --"}
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.grade?.name ?? "Khối lớp"} ({c.academicYear})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Thông tin cá nhân & Liên hệ học sinh */}
        <section className="rounded-xl  border-2 border-border shadow-pop bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground border-b pb-2">
            Thông tin cá nhân học sinh
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Ngày sinh */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("dateOfBirth") || "Ngày sinh"}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={form.dateOfBirth || ""}
                  onChange={(e) => setField("dateOfBirth", e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Giới tính */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("gender") || "Giới tính"}
              </label>
              <select
                value={form.gender || ""}
                onChange={(e) =>
                  setField(
                    "gender",
                    (e.target.value || undefined) as Gender | undefined,
                  )
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">{t("selectGender") || "Chọn giới tính"}</option>
                <option value="MALE">{t("genderMale") || "Nam"}</option>
                <option value="FEMALE">{t("genderFemale") || "Nữ"}</option>
                <option value="OTHER">{t("genderOther") || "Khác"}</option>
              </select>
            </div>

            {/* SĐT học sinh */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("phone") || "SĐT học sinh"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={form.phone || ""}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Thông tin người giám hộ / Phụ huynh */}
        <section className="rounded-xl border-2 border-border shadow-pop bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Users className="size-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              {t("guardian") || "Thông tin người giám hộ / Phụ huynh"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("guardianName") || "Họ và tên phụ huynh"} <span className="text-destructive">*</span>
              </label>
              <input
                required
                value={form.guardians?.[0]?.fullName || ""}
                onChange={(e) =>
                  setField("guardians", [
                    {
                      ...(form.guardians?.[0] || emptyGuardian),
                      fullName: e.target.value,
                    },
                  ])
                }
                placeholder="Ví dụ: Nguyễn Văn Ba"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("guardianPhone") || "Số điện thoại phụ huynh"} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="tel"
                  value={form.guardians?.[0]?.phone || ""}
                  onChange={(e) =>
                    setField("guardians", [
                      {
                        ...(form.guardians?.[0] || emptyGuardian),
                        phone: e.target.value,
                      },
                    ])
                  }
                  placeholder="09xxxxxxxx"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/vi/teacher/students"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            {t("cancel") || "Hủy bỏ"}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("submitting") || "Đang lưu..."}
              </>
            ) : (
              t("submit") || "Tạo học sinh"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
