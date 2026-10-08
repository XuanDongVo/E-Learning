"use client";

import { Activity, BookOpen, ClipboardList, Download, Plus, Users } from "lucide-react";
import { TeacherStatCard } from "./teacher-stat-card";
import { ClassPerformanceCard } from "./class-performance-card";
import { RecentActivityCard } from "./recent-activity-card";

export function TeacherDashboardView() {
  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-body-sm font-bold text-primary">Thứ Sáu, 02 tháng 10</p>
          <h1 className="mt-1 text-ui-3xl font-extrabold tracking-tight">Tổng quan lớp học</h1>
          <p className="mt-1 text-body text-neutral-muted">Theo dõi nhịp học và chuẩn bị bài giảng tiếp theo.</p>
        </div>
        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-body-sm font-bold shadow-sm hover:bg-muted">
          <Download className="size-4" /> Xuất báo cáo
        </button>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TeacherStatCard icon={Users} value="—" label="Lớp đang phụ trách" tone="primary" detail="Data unavailable" />
        <TeacherStatCard icon={BookOpen} value="—" label="Unit đang giảng dạy" tone="secondary" detail="Data unavailable" />
        <TeacherStatCard icon={ClipboardList} value="—" label="Bài tập đang mở" tone="accent" detail="Data unavailable" />
        <TeacherStatCard icon={Activity} value="—" label="Tỉ lệ hoàn thành" tone="success" detail="Attempt analytics unavailable" />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <ClassPerformanceCard />
        <RecentActivityCard />
      </section>
      <section className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-sm font-bold uppercase tracking-[0.14em] text-neutral-subtle">
              Bài tập
            </p>
            <h2 className="mt-1 text-card-title font-extrabold">
              Chưa có bài tập cần chấm
            </h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-body-sm font-bold text-primary-foreground">
            <Plus className="size-3.5" /> Tạo bài tập
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] bg-primary-light p-4">
            <p className="text-body-sm font-bold text-primary">            Assignment results unavailable</p>
            <p className="mt-2 text-ui-xl font-extrabold">—</p>
            <p className="mt-1 text-body-sm text-neutral-muted">
              students completed
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-secondary-light p-4">
            <p className="text-body-sm font-bold text-secondary-hover">
              Assignment results unavailable
            </p>
            <p className="mt-2 text-ui-xl font-extrabold">—</p>
            <p className="mt-1 text-body-sm text-neutral-muted">Attempt analytics unavailable</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-accent-light p-4">
            <p className="text-body-sm font-bold text-accent">Reading Review</p>
            <p className="mt-2 text-ui-xl font-extrabold">—</p>
            <p className="mt-1 text-body-sm text-neutral-muted">
              Attempt analytics unavailable
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
