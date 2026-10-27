"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  FileText,
  Search,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StudentAssignmentItem {
  id: number;
  title: string;
  unitLabel: string;
  subject: string;
  teacherName: string;
  questionCount: number;
  timeLimitMinutes: number | null;
  dueAt: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "OVERDUE";
  progressPercent?: number;
  answeredCount?: number;
  score?: number;
  maxScore?: number;
}

const MOCK_ASSIGNMENTS: StudentAssignmentItem[] = [
  {
    id: 1,
    title: "15-Minute Grammar Check: Past Continuous & Simple",
    unitLabel: "Unit 3",
    subject: "Tiếng Anh 10",
    teacherName: "Thầy Hoàng Nam",
    questionCount: 20,
    timeLimitMinutes: 15,
    dueAt: new Date(Date.now() + 5 * 3600 * 1000).toISOString(), // 5 tiếng nữa
    status: "NOT_STARTED",
  },
  {
    id: 2,
    title: "Reading Comprehension & Vocabulary: Eco-Living",
    unitLabel: "Unit 2",
    subject: "Tiếng Anh 10",
    teacherName: "Cô Thu Hà",
    questionCount: 15,
    timeLimitMinutes: null,
    dueAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    status: "IN_PROGRESS",
    progressPercent: 65,
    answeredCount: 10,
  },
  {
    id: 3,
    title: "Mid-Term Assessment: General Knowledge",
    unitLabel: "Review 1",
    subject: "Tiếng Anh 10",
    teacherName: "Thầy Hoàng Nam",
    questionCount: 30,
    timeLimitMinutes: 45,
    dueAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: "GRADED",
    score: 8.5,
    maxScore: 10,
  },
  {
    id: 4,
    title: "Listening Practice: Conversation in the Library",
    unitLabel: "Unit 1",
    subject: "Tiếng Anh 10",
    teacherName: "Cô Thu Hà",
    questionCount: 12,
    timeLimitMinutes: 20,
    dueAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    status: "SUBMITTED",
  },
];

export default function StudentAssignmentsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingList = MOCK_ASSIGNMENTS.filter(
    (a) => a.status === "NOT_STARTED" || a.status === "IN_PROGRESS" || a.status === "OVERDUE"
  );
  const completedList = MOCK_ASSIGNMENTS.filter(
    (a) => a.status === "SUBMITTED" || a.status === "GRADED"
  );

  const displayedList = (activeTab === "pending" ? pendingList : completedList).filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.unitLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDue = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff < 0) return { label: "Đã quá hạn", isUrgent: false, isOverdue: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) {
      return { label: `Hạn nộp: Còn ${hours}h hôm nay`, isUrgent: true, isOverdue: false };
    }
    const days = Math.floor(hours / 24);
    return {
      label: `Hạn: ${new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} (${days} ngày nữa)`,
      isUrgent: false,
      isOverdue: false,
    };
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 p-4 pb-24 sm:p-5 lg:p-6 lg:pb-8">
      {/* 1. Header chuẩn của E-Learning */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-body-sm font-extrabold uppercase tracking-wider text-primary">
            Bài tập & Đánh giá
          </p>
          <h1 className="text-ui-2xl font-extrabold tracking-tight text-neutral-dark">
            Danh sách bài tập
          </h1>
          <p className="mt-0.5 text-body font-medium text-neutral-muted">
            Theo dõi tiến độ, hoàn thành bài tập đúng hạn và xem lại nhận xét từ giáo viên.
          </p>
        </div>

        {/* Counter cards đồng bộ với Dashboard */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-border-color bg-card-bg px-3.5 py-2 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-body-sm font-bold text-neutral-dark">
              {pendingList.length} bài cần làm
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border-color bg-card-bg px-3.5 py-2 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-body-sm font-bold text-neutral-muted">
              {completedList.length} đã xong
            </span>
          </div>
        </div>
      </header>

      {/* 2. Control bar (Tabs + Search) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Custom Segmented Tab style Neo-Edu */}
        <div className="flex rounded-xl border border-border-color bg-secondary p-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-body-sm font-bold transition-all",
              activeTab === "pending"
                ? "bg-card-bg text-neutral-dark shadow-2xs"
                : "text-neutral-muted hover:text-neutral-dark"
            )}
          >
            <span>Cần hoàn thành</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.2 text-caption font-extrabold",
                activeTab === "pending"
                  ? "bg-primary/10 text-primary"
                  : "bg-neutral-muted/15 text-neutral-muted"
              )}
            >
              {pendingList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-body-sm font-bold transition-all",
              activeTab === "completed"
                ? "bg-card-bg text-neutral-dark shadow-2xs"
                : "text-neutral-muted hover:text-neutral-dark"
            )}
          >
            <span>Đã hoàn thành</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.2 text-caption font-extrabold",
                activeTab === "completed"
                  ? "bg-success-soft text-success"
                  : "bg-neutral-muted/15 text-neutral-muted"
              )}
            >
              {completedList.length}
            </span>
          </button>
        </div>

        {/* Input tìm kiếm */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên bài, Unit, môn học..."
            className="h-10 rounded-xl border-border-color bg-card-bg pl-9 text-body-sm font-medium focus-visible:ring-primary shadow-2xs"
          />
        </div>
      </div>

      {/* 3. Assignment Cards Grid / List */}
      {displayedList.length === 0 ? (
        <div className="rounded-2xl border border-border-color bg-card-bg p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-neutral-muted">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="mt-3 text-body font-bold text-neutral-dark">
            {activeTab === "pending"
              ? "Không có bài tập nào cần làm"
              : "Chưa có bài tập nào hoàn thành"}
          </p>
          <p className="mt-1 text-body-sm text-neutral-muted">
            {activeTab === "pending"
              ? "Bạn đã hoàn thành tất cả bài tập được giao. Rất tốt!"
              : "Các bài bạn đã nộp sẽ được lưu lại tại đây."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedList.map((item) => {
            const due = formatDue(item.dueAt);
            const isInProgress = item.status === "IN_PROGRESS";
            const isGraded = item.status === "GRADED";

            return (
              <article
                key={item.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card-bg p-4 sm:p-5 shadow-2xs transition-all hover:border-primary hover:shadow-md",
                  due.isUrgent
                    ? "border-accent/60 bg-linear-to-r from-card-bg via-card-bg to-accent/5"
                    : "border-border-color"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Cột thông tin bài */}
                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary px-2.5 py-0.5 text-caption font-extrabold text-neutral-dark">
                        {item.unitLabel}
                      </span>
                      <span className="text-caption font-semibold text-neutral-muted">
                        {item.subject} • {item.teacherName}
                      </span>

                      {/* Due date tag */}
                      {activeTab === "pending" && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-caption font-bold",
                            due.isUrgent
                              ? "bg-accent/20 text-accent-foreground"
                              : due.isOverdue
                              ? "bg-destructive/15 text-destructive"
                              : "bg-muted text-neutral-muted"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {due.label}
                        </span>
                      )}

                      {/* Điểm nếu có */}
                      {isGraded && item.score !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-2.5 py-0.5 text-caption font-extrabold text-success">
                          Điểm: {item.score}/{item.maxScore}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-card-title font-extrabold text-neutral-dark group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>

                    {/* Specs / Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-body-sm font-medium text-neutral-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        {item.questionCount} câu hỏi
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {item.timeLimitMinutes ? `${item.timeLimitMinutes} phút` : "Không giới hạn giờ"}
                      </span>
                    </div>

                    {/* Tiến độ nếu đang làm dở */}
                    {isInProgress && (
                      <div className="max-w-md pt-1">
                        <div className="mb-1 flex justify-between text-caption font-bold">
                          <span className="text-primary">
                            Đang làm: {item.answeredCount}/{item.questionCount} câu
                          </span>
                          <span className="text-neutral-muted">{item.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${item.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút hành động chuẩn theme */}
                  <div className="flex shrink-0 items-center justify-end sm:pl-4">
                    {isInProgress ? (
                      <Button
                        asChild
                        className="h-10 rounded-xl bg-primary px-5 text-body-sm font-bold text-white shadow-none hover:bg-primary-hover"
                      >
                        <Link href={`/student/assignments/${item.id}`}>
                          Tiếp tục làm bài
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : item.status === "NOT_STARTED" ? (
                      <Button
                        asChild
                        className="h-10 rounded-xl bg-neutral-dark px-5 text-body-sm font-bold text-white shadow-none hover:bg-neutral-dark/90"
                      >
                        <Link href={`/student/assignments/${item.id}`}>
                          Bắt đầu làm
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="secondary"
                        className="h-10 rounded-xl border border-border-color bg-card-bg px-4 text-body-sm font-bold text-neutral-dark hover:bg-secondary"
                      >
                        <Link href={`/student/assignments/${item.id}/result`}>
                          Xem kết quả
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
