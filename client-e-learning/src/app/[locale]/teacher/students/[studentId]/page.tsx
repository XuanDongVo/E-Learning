"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { teacherStudentService } from "@/services/teacher/student.service";
import {
  formatDate,
  genderLabel,
  membershipLabel,
  relationshipLabel,
} from "@/mock/mock-student-data";
import {
  formatDateTime,
  formatScorePercent,
  type StudentAssignmentStatus,
} from "@/types/teacher/student-learning";
import { Button } from "@/components/ui/button";

export default function StudentOverviewPage() {
  const params = useParams();
  const studentId = Number(params.studentId);
  const base = `/teacher/students/${studentId}`;

  const student = useQuery({
    queryKey: ["teacher-student", studentId],
    queryFn: () => teacherStudentService.get(studentId),
    enabled: Number.isFinite(studentId),
  });
  const assignments = useQuery({
    queryKey: ["teacher-student-assignments-overview", studentId],
    queryFn: () => teacherStudentService.listAssignments(studentId, { page: 1, size: 50 }),
    enabled: Number.isFinite(studentId),
  });
  const sessions = useQuery({
    queryKey: ["teacher-student-sessions-overview", studentId],
    queryFn: () => teacherStudentService.listActivitySessions(studentId, { page: 1, size: 5 }),
    enabled: Number.isFinite(studentId),
  });

  const d = student.data?.data;
  const primary = d?.guardians?.find((g) => g.primary) ?? d?.guardians?.[0];
  const assignmentItems = assignments.data?.data?.items ?? [];
  const sessionItems = sessions.data?.data?.items ?? [];

  const count = (status: StudentAssignmentStatus) =>
    assignmentItems.filter((a) => a.status === status).length;
  const counts = [
    { label: "Đã giao", val: assignments.data?.data?.totalElements ?? assignmentItems.length },
    { label: "Đã nộp", val: count("SUBMITTED") },
    { label: "Nộp muộn", val: count("LATE") },
    { label: "Hết giờ", val: count("TIMED_OUT") },
    { label: "Chưa làm", val: count("NOT_STARTED") },
    { label: "Đang làm", val: count("IN_PROGRESS") },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.6fr]">
      <div className="grid content-start gap-5">
        <Panel title="Thông tin học sinh">
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            <Row label="Ngày sinh" value={formatDate(d?.dateOfBirth)} />
            <Row label="Giới tính" value={genderLabel(d?.gender)} />
            <Row label="Điện thoại" value={d?.phone || "—"} />
            <Row label="Khối" value={d?.gradeName || "—"} />
          </dl>
        </Panel>

        <Panel title="Lớp hiện tại">
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            <Row
              label="Lớp"
              value={
                d?.membershipStatus === "ACTIVE" && d.className ? d.className : "Chưa có lớp"
              }
            />
            <Row label="Trạng thái lớp" value={membershipLabel(d?.membershipStatus, d?.className)} />
            <Row label="Năm học" value={d?.academicYear || "—"} />
            <Row label="Ngày vào lớp" value={formatDate(d?.joinedAt)} />
          </dl>
        </Panel>

        <Panel title="Phụ huynh">
          <dl className="divide-y divide-border px-5 py-2 text-sm">
            {primary ? (
              <>
                <Row label={relationshipLabel(primary.relationship)} value={primary.fullName} />
                <Row label="Liên hệ" value={primary.phone || "—"} />
              </>
            ) : (
              <p className="py-3 text-sm text-muted-foreground">Chưa có thông tin phụ huynh.</p>
            )}
          </dl>
        </Panel>
      </div>

      <div className="grid content-start gap-5">
        <Panel
          title="Bài tập"
          description="Theo trạng thái attempt thực tế"
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold" asChild>
              <Link href={`${base}/assignments`}>
                Xem tất cả <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="grid grid-cols-2 border-b border-border sm:grid-cols-3 lg:grid-cols-6">
            {counts.map((item) => (
              <div key={item.label} className="border-r border-border p-3 last:border-r-0">
                <p className="text-[11px] font-semibold text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-extrabold">{item.val}</p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-border">
            {assignmentItems.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Chưa có bài tập.</p>
            )}
            {assignmentItems.slice(0, 3).map((a) => (
              <div key={a.assignmentId} className="flex items-center justify-between p-4 text-xs">
                <div>
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="mt-0.5 text-muted-foreground">Hạn: {formatDateTime(a.dueAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold">
                    {a.status}
                  </span>
                  <span className="min-w-10 text-right text-sm font-extrabold">
                    {formatScorePercent(a.scorePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Luyện tập gần đây"
          description="ActivitySession — practice"
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold" asChild>
              <Link href={`${base}/activities`}>
                Xem lịch sử <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {sessionItems.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Chưa có phiên luyện tập.</p>
            )}
            {sessionItems.slice(0, 3).map((s) => (
              <div key={s.sessionId} className="flex items-center justify-between p-4 text-xs">
                <div>
                  <p className="text-sm font-bold">{s.activityName}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {s.unitLabel} · {formatDateTime(s.completedAt ?? s.startedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">{s.mode}</span>
                  <p className="text-muted-foreground">
                    {s.status}
                    {s.status !== "ABANDONED"
                      ? ` · ${s.firstCorrectCount}/${s.totalQuestions}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="text-sm font-extrabold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
