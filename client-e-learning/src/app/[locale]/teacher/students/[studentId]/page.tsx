// import { StudentDetailView } from "@/components/features/teacher/students/student-detail-view";
// export default async function TeacherStudentDetailPage({
//   params,
// }: {
//   params: Promise<{ studentId: string }>;
// }) {
//   const { studentId } = await params;
//   return <StudentDetailView studentId={Number(studentId)} />;
// }


import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { mockStudent, mockAssignments, mockSessions } from "@/mock/mock-student-data";
import { Button } from "@/components/ui/button";

export default function StudentOverviewPage({ params }: { params: { studentId: string } }) {
  const base = `/students/${params.studentId}`;
  const count = (status: string) => mockAssignments.filter((a) => a.status === status).length;
  const counts = [
    { label: "Đã giao", val: mockAssignments.length },
    { label: "Đã nộp", val: count("Đã nộp") },
    { label: "Nộp muộn", val: count("Nộp muộn") },
    { label: "Chưa làm", val: count("Chưa làm") + count("Đang làm") },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.6fr]">
      {/* Cột trái: Thông tin cá nhân & phụ huynh */}
      <div className="grid content-start gap-5">
        <Panel title="Thông tin học sinh">
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            <Row label="Ngày sinh" value={mockStudent.dob} />
            <Row label="Điện thoại" value={mockStudent.phone} />
            <Row label="Khối" value={mockStudent.grade} />
          </dl>
        </Panel>

        <Panel title="Lớp hiện tại">
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            <Row label="Lớp" value={mockStudent.className || "Chưa có lớp"} />
            <Row label="Ngày vào lớp" value={mockStudent.joinedAt} />
          </dl>
        </Panel>

        <Panel title="Phụ huynh">
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            <Row label={mockStudent.relation} value={mockStudent.parent} />
            <Row label="Liên hệ" value={mockStudent.parentPhone} />
          </dl>
        </Panel>
      </div>

      {/* Cột phải: Bài tập & Lịch sử hoạt động gần đây */}
      <div className="grid content-start gap-5">
        <Panel
          title="Bài tập"
          description="Thống kê bài đã giao và tình trạng nộp"
          action={
            <Button variant="ghost" size="sm"  className="gap-1 text-xs font-semibold">
              <Link href={`${base}/assignments`}>Xem tất cả <ArrowRight className="size-3.5" /></Link>
            </Button>
          }
        >
          <div className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
            {counts.map((item) => (
              <div key={item.label} className="border-r border-border p-4 last:border-r-0">
                <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Bảng tóm tắt bài tập */}
          <div className="divide-y divide-border">
            {mockAssignments.slice(0, 3).map((a) => (
              <div key={a.assignmentId} className="flex items-center justify-between p-4 text-xs">
                <div>
                  <p className="font-bold text-sm">{a.title}</p>
                  <p className="text-muted-foreground mt-0.5">Hạn: {a.due}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={a.status} />
                  <span className="font-extrabold text-sm min-w-8 text-right">{a.score ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Hoạt động gần đây"
          action={
            <Button variant="ghost" size="sm"  className="gap-1 text-xs font-semibold">
              <Link href={`${base}/activities`}>Xem lịch sử <ArrowRight className="size-3.5" /></Link>
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {mockSessions.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 text-xs">
                <div>
                  <p className="font-bold text-sm">{s.activity}</p>
                  <p className="text-muted-foreground mt-0.5">{s.unit} · {s.completedAt}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">{s.mode}</span>
                  <p className="text-muted-foreground">{s.firstCorrect}/{s.total} đúng lần đầu</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-extrabold text-sm">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-right">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "Đã nộp" ? "bg-emerald-500/10 text-emerald-600" :
    status === "Nộp muộn" ? "bg-amber-500/10 text-amber-600" :
    status === "Đang làm" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${color}`}>{status}</span>;
}
