"use client";

import { Activity, ClipboardList, Plus, Users } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { TeacherStatCard } from "./teacher-stat-card";
import { ClassPerformanceCard } from "./class-performance-card";
import { AttentionCard } from "./attention-card";
import { RecentActivityCard } from "./recent-activity-card";

export function TeacherDashboardView() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-body font-bold text-primary">
            Good morning, {user?.fullName ?? "Teacher"}
          </p>
          <h1 className="mt-1 text-ui-3xl font-extrabold tracking-tight">
            Welcome back, Teacher!
          </h1>
          <p className="mt-2 text-body text-neutral-muted">
            Here is what is happening across your learning spaces today.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-body font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> Create activity
        </button>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TeacherStatCard
          icon={Users}
          value="6"
          label="Active classes"
          tone="primary"
        />
        <TeacherStatCard
          icon={Users}
          value="126"
          label="Total students"
          tone="secondary"
        />
        <TeacherStatCard
          icon={ClipboardList}
          value="8"
          label="Active assignments"
          tone="accent"
        />
        <TeacherStatCard
          icon={Activity}
          value="24"
          label="Total activities"
          tone="primary"
        />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr_0.9fr]">
        <ClassPerformanceCard />
        <AttentionCard />
        <RecentActivityCard />
      </section>
      <section className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-sm font-bold uppercase tracking-[0.14em] text-neutral-subtle">
              Assignments
            </p>
            <h2 className="mt-1 text-card-title font-extrabold">
              Active assignments
            </h2>
          </div>
          <button className="text-body-sm font-extrabold text-primary">
            View all
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] bg-primary-light p-4">
            <p className="text-body-sm font-bold text-primary">Unit 2 Review</p>
            <p className="mt-2 text-ui-xl font-extrabold">29 / 30</p>
            <p className="mt-1 text-body-sm text-neutral-muted">
              students completed
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-secondary-light p-4">
            <p className="text-body-sm font-bold text-secondary-hover">
              Grammar Practice
            </p>
            <p className="mt-2 text-ui-xl font-extrabold">18 / 26</p>
            <p className="mt-1 text-body-sm text-neutral-muted">
              students completed
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-accent-light p-4">
            <p className="text-body-sm font-bold text-accent">Reading Review</p>
            <p className="mt-2 text-ui-xl font-extrabold">12 / 24</p>
            <p className="mt-1 text-body-sm text-neutral-muted">
              students completed
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
