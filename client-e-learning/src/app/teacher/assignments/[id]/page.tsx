"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileQuestion, Plus, Upload } from "lucide-react";

import { getAssignment } from "@/services/assignment.service";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();

  const assignment = useQuery({
    queryKey: ["assignment", params.id],
    queryFn: () => getAssignment(Number(params.id)),
    enabled: Boolean(params.id),
  });

  const data = assignment.data?.data;

  if (assignment.isLoading) {
    return (
      <p className="mx-auto max-w-[1180px] p-8 text-body-sm text-muted-foreground">
        Loading assignment...
      </p>
    );
  }

  if (!data) {
    return (
      <p className="mx-auto max-w-[1180px] p-8 text-body-sm text-destructive">
        Assignment not found.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <Link
        href="/teacher/assignments"
        className="inline-flex items-center gap-2 text-body-sm font-bold text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to assignments
      </Link>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-body-sm font-bold text-primary">
            Assignment details
          </p>

          <h1 className="mt-1 text-page-title font-extrabold">
            {data.name}
          </h1>

          <p className="mt-1 text-body text-neutral-muted">
            Grade {data.gradeLevel} · Due{" "}
            {new Date(data.dueAt).toLocaleString("en-US")}
          </p>
        </div>

        <span className="rounded-full bg-sky-100 px-3 py-1.5 text-body-sm font-bold text-sky-700">
          {data.status === "DRAFT"
            ? "Draft"
            : data.status === "PUBLISHED"
              ? "Active"
              : "Archived"}
        </span>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Questions"
          value={String(data.questionCount)}
        />

        <InfoCard
          label="Needs grading"
          value="—"
          hint="Submission results API is not available yet"
        />

        <InfoCard
          label="Recipients"
          value={`${data.targets.length} groups`}
        />
      </div>

      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-section-title font-bold">
              Questions
            </h2>

            <p className="text-body-sm text-muted-foreground">
              Review and add questions to this assignment.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-body-sm font-bold opacity-60"
            >
              <Upload className="size-4" />
              Import Excel
            </button>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-body-sm font-bold text-primary-foreground opacity-60"
            >
              <Plus className="size-4" />
              Add manually
            </button>
          </div>
        </div>

        <div className="p-10 text-center">
          <FileQuestion className="mx-auto size-9 text-primary" />

          <p className="mt-3 text-body font-bold">
            {data.questionCount === 0
              ? "No questions yet"
              : `${data.questionCount} questions`}
          </p>

          <p className="mt-1 text-body-sm text-muted-foreground">
            The manual question builder and AssignmentQuestion API are planned
            for the next milestone.
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-body-sm text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-extrabold">{value}</p>

      {hint && (
        <p className="mt-1 text-body-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
