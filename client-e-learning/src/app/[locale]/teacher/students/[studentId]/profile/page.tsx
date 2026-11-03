import Link from "next/link";
import { Pencil } from "lucide-react";
import { mockStudent } from "@/mock/mock-student-data";
import { Button } from "@/components/ui/button";

export default function StudentProfilePage({ params }: { params: { studentId: string } }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* 1. Thông tin cá nhân */}
      <ProfileCard
        title="Thông tin cá nhân"
        action={
          <Button variant="outline" size="sm"  className="gap-1 h-7 text-xs font-bold">
            <Link href={`/students/${params.studentId}/edit`}>
              <Pencil className="size-3" /> Sửa
            </Link>
          </Button>
        }
        items={[
          ["Họ và tên", mockStudent.name],
          ["Ngày sinh", mockStudent.dob],
          ["Giới tính", mockStudent.gender],
          ["Mã học sinh", mockStudent.code],
        ]}
      />

      {/* 2. Liên hệ */}
      <ProfileCard
        title="Liên hệ"
        items={[
          ["Email", mockStudent.email],
          ["Điện thoại", mockStudent.phone],
        ]}
      />

      {/* 3. Phụ huynh */}
      <ProfileCard
        title="Phụ huynh / Người giám hộ"
        items={[
          ["Họ tên", mockStudent.parent],
          ["Quan hệ", mockStudent.relation],
          ["Điện thoại", mockStudent.parentPhone],
        ]}
      />

      {/* 4. Lớp học & Tài khoản */}
      <ProfileCard
        title="Lớp học & Tài khoản"
        items={[
          ["Lớp hiện tại", mockStudent.className || "Chưa có lớp"],
          ["Trạng thái lớp", mockStudent.className ? "Đang trong lớp" : "Chưa xếp lớp"],
          ["Trạng thái tài khoản", mockStudent.accountStatus],
          ["Ngày vào lớp", mockStudent.joinedAt],
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
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-extrabold text-sm">{title}</h2>
        {action}
      </div>
      <dl className="grid gap-4 p-4 sm:grid-cols-2 text-xs">
        {items.map(([k, v]) => (
          <div key={k}>
            <dt className="font-semibold text-muted-foreground">{k}</dt>
            <dd className="mt-1 font-bold text-sm text-foreground">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
