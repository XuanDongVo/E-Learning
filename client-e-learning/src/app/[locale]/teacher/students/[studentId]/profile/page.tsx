"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import {
  accountStatusLabel,
  formatDate,
  genderLabel,
  membershipLabel,
  relationshipLabel,
} from "@/mock/mock-student-data";
import { Button } from "@/components/ui/button";

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const student = useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => teacherStudentService.get(studentId),
    enabled: Number.isFinite(studentId),
  });
  const d = student.data?.data;
  const primary = d?.guardians?.find((g) => g.primary) ?? d?.guardians?.[0];

  if (student.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải hồ sơ…</p>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ProfileCard
        title="Thông tin cá nhân"
        action={
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs font-bold" >
            <Link href={`/teacher/students/${studentId}/edit`}>
              <Pencil className="size-3" /> Sửa
            </Link>
          </Button>
        }
        items={[
          ["Họ và tên", d?.fullName ?? "—"],
          ["Ngày sinh", formatDate(d?.dateOfBirth)],
          ["Giới tính", genderLabel(d?.gender)],
        ]}
      />

      <ProfileCard
        title="Liên hệ"
        items={[
          ["Email", d?.email ?? "—"],
          ["Điện thoại", d?.phone || "—"],
        ]}
      />

      <ProfileCard
        title="Phụ huynh / Người giám hộ"
        items={
          primary
            ? [
                ["Họ tên", primary.fullName],
                ["Quan hệ", relationshipLabel(primary.relationship)],
                ["Điện thoại", primary.phone || "—"],
                ...(primary.email ? [["Email", primary.email] as [string, string]] : []),
              ]
            : [["", "Chưa có thông tin phụ huynh"]]
        }
      />

      <ProfileCard
        title="Lớp học & Tài khoản"
        items={[
          [
            "Lớp hiện tại",
            d?.membershipStatus === "ACTIVE" && d.className ? d.className : "Chưa có lớp",
          ],
          ["Trạng thái lớp", membershipLabel(d?.membershipStatus, d?.className)],
          ["Khối", d?.gradeName || "—"],
          ["Năm học", d?.academicYear || "—"],
          ["Trạng thái tài khoản", accountStatusLabel(d?.accountStatus)],
          ["Ngày vào lớp", formatDate(d?.joinedAt)],
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
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-extrabold">{title}</h2>
        {action}
      </div>
      <dl className="grid gap-4 p-4 text-xs sm:grid-cols-2">
        {items.map(([k, v], i) => (
          <div key={k || i}>
            {k && <dt className="font-semibold text-muted-foreground">{k}</dt>}
            <dd className={`font-bold text-sm text-foreground ${k ? "mt-1" : ""}`}>{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
