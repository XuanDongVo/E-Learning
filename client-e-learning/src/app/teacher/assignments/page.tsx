"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, FileSpreadsheet, Plus, Search, Upload, Users } from "lucide-react";
import { toast } from "sonner";

import { classService } from "@/services/class.service";
import {
  createAssignment,
  listAssignments,
} from "@/services/assignment.service";
import type { CreateAssignmentRequest } from "@/types/assignment";
import { AssignmentImportDialog } from "@/components/features/teacher/assignments/main/AssignmentImportDialog";
import { AssignmentList } from "@/components/features/teacher/assignments/main/AssignmentList";
import { AssignmentWizard } from "@/components/features/teacher/assignments/main/AssignmentWizard";
import { SummaryCard } from "@/components/features/teacher/assignments/main/SummaryCard";

const initialForm: CreateAssignmentRequest = {
  gradeLevel: 6,
  academicYear: "2026 - 2027",
  name: "",
  description: "",
  dueAt: "",
  targets: [],
};

export default function TeacherAssignmentsPage() {
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [form, setForm] = useState<CreateAssignmentRequest>(initialForm);

  const assignments = useQuery({
    queryKey: ["assignments"],
    queryFn: listAssignments,
  });
  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: classService.list,
  });
  const create = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setWizardOpen(false);
      setForm(initialForm);
      toast.success("Assignment draft created.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create assignment.");
    },
  });

  const assignmentList = assignments.data?.data ?? [];
  const visibleAssignments = assignmentList.filter((assignment) => {
    const matchesSearch = assignment.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (statusFilter === "ALL" || assignment.status === statusFilter);
  });

  const openWizard = () => {
    setForm(initialForm);
    setWizardOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-body-sm font-bold text-primary">Assignments &amp; Grading</p>
          <h1 className="mt-1 text-page-title font-extrabold tracking-tight">Assignments</h1>
          <p className="mt-1 text-body text-neutral-muted">
            Track due dates, submissions to grade, and progress across classes.
          </p>
        </div>
        <button
          type="button"
          onClick={openWizard}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-body-sm font-bold text-primary-foreground"
        >
          <Plus className="size-4" /> Create assignment
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<Clock3 className="size-4" />} label="Active"
          value={assignmentList.filter((item) => item.status === "PUBLISHED").length}
          hint="Assignments currently open to students" tone="orange" />
        <SummaryCard icon={<FileSpreadsheet className="size-4" />} label="Needs grading"
          value="—" hint="Submission data is not available yet" tone="amber" />
        <SummaryCard icon={<CheckCircle2 className="size-4" />} label="Submitted on time"
          value="—" hint="Result data is not available yet" tone="green" />
        <SummaryCard icon={<Users className="size-4" />} label="Missing submissions"
          value="—" hint="Result data is not available yet" tone="blue" />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <h2 className="text-section-title font-bold">All assignments</h2>
              <p className="text-body-sm text-muted-foreground">
                {visibleAssignments.length} matching assignments
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-body-sm text-muted-foreground">
                <Search className="size-4" />
                <input value={search} onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search assignments..." className="w-44 bg-transparent outline-none" />
              </label>
              <button type="button" onClick={() => setImportOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-input px-3 text-body-sm font-bold hover:bg-muted">
                <Upload className="size-4" /> Import questions
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status)}
                className={`rounded-lg border px-3 py-1.5 text-body-sm font-semibold ${statusFilter === status ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                  }`}>
                {status === "ALL" ? "All" : status === "PUBLISHED" ? "Active" : status === "DRAFT" ? "Draft" : "Archived"}
              </button>
            ))}
          </div>
        </div>
        <AssignmentList assignments={visibleAssignments} isLoading={assignments.isLoading} />
      </section>

      <AssignmentWizard
        key={wizardOpen ? "open" : "closed"}
        open={wizardOpen}
        form={form}
        classes={classes.data?.data ?? []}
        mode="create"
        isPending={create.isPending}
        onClose={() => setWizardOpen(false)}
        onSubmit={(payload) => create.mutate(payload)}
      />
      <AssignmentImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
