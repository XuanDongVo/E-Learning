"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, UserRound, Contact } from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import { accountStatusLabel } from "@/mock/mock-student-data";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Gender, UpdateStudentProfileRequest } from "@/types/student";
import { useTranslations } from "next-intl";

/** Teacher edits identity profile only — not class transfer or account lock. */
export default function StudentEditPage() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const router = useRouter();
  const qc = useQueryClient();
  const tErrors = useTranslations("errors");

  const student = useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => teacherStudentService.get(studentId),
    enabled: Number.isFinite(studentId),
  });
  const d = student.data?.data;
  const primary = d?.guardians?.find((g) => g.primary) ?? d?.guardians?.[0];

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("GUARDIAN");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!d) return;
    setFullName(d.fullName ?? "");
    setDateOfBirth(d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : "");
    setGender(d.gender ?? "");
    setPhone(d.phone ?? "");
    setGuardianName(primary?.fullName ?? "");
    setGuardianPhone(primary?.phone ?? "");
    setGuardianRelation(primary?.relationship ?? "GUARDIAN");
  }, [d, primary?.fullName, primary?.phone, primary?.relationship]);

  const save = useMutation({
    mutationFn: (payload: UpdateStudentProfileRequest) =>
      teacherStudentService.updateProfile(studentId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["teacher-student", studentId] });
      await qc.invalidateQueries({ queryKey: ["students"] });
      router.push(`/teacher/students/${studentId}/profile`);
    },
    onError: (err) => {
      setError(getAppErrorMessage(err, tErrors as (key: string) => string));
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload: UpdateStudentProfileRequest = {
      fullName: fullName.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: (gender as Gender) || undefined,
      phone: phone.trim() || undefined,
      guardians: guardianName.trim()
        ? [
            {
              relationship: guardianRelation as "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER",
              fullName: guardianName.trim(),
              phone: guardianPhone.trim() || "—",
              primary: true,
            },
          ]
        : undefined,
    };
    save.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <Link
        href={`/teacher/students/${studentId}/profile`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Quay lại hồ sơ
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Cập nhật hồ sơ</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Chỉ thông tin cá nhân và phụ huynh. Đổi lớp dùng roster lớp; khóa tài khoản dùng trạng thái
            tài khoản trên danh sách học sinh.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs font-bold" asChild>
            <Link href={`/teacher/students/${studentId}/profile`}>Hủy</Link>
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs font-bold"
            disabled={save.isPending}
            onClick={onSubmit}
          >
            <Save className="size-3.5" /> {save.isPending ? "Đang lưu…" : "Lưu cập nhật"}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div>
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-sm font-bold">
              <UserRound className="size-4 text-primary" />
              <span>Thông tin cá nhân</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ và tên *">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-10 text-sm" />
              </Field>
              <Field label="Ngày sinh">
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="h-10 text-sm" />
              </Field>
              <Field label="Giới tính">
                <Select value={gender || undefined} onValueChange={setGender}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">Nữ</SelectItem>
                    <SelectItem value="MALE">Nam</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Số điện thoại">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-sm" />
              </Field>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Email đăng nhập: <span className="font-semibold">{d?.email}</span> (không đổi tại đây)
            </p>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-sm font-bold">
              <Contact className="size-4 text-primary" />
              <span>Phụ huynh / Người giám hộ</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ tên">
                <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="h-10 text-sm" />
              </Field>
              <Field label="Quan hệ">
                <Select value={guardianRelation} onValueChange={setGuardianRelation}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOTHER">Mẹ</SelectItem>
                    <SelectItem value="FATHER">Bố</SelectItem>
                    <SelectItem value="GUARDIAN">Người giám hộ</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Số điện thoại">
                <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className="h-10 text-sm" />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="text-sm font-extrabold">Tài khoản & lớp</h3>
            <p className="text-xs text-muted-foreground">
              Không chỉnh trên form này. Dùng danh sách học sinh (khóa tài khoản) hoặc roster lớp
              (chuyển / gỡ lớp).
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Tài khoản</span>
                <span className="font-bold">{accountStatusLabel(d?.accountStatus)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Lớp</span>
                <span className="font-bold">
                  {d?.membershipStatus === "ACTIVE" && d.className ? d.className : "Chưa có lớp"}
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
