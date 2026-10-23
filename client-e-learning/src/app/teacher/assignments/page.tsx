"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Clock3, FileSpreadsheet, Plus, Search, Upload, Users } from "lucide-react";
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
import { TeacherAssignmentGuide } from "@/components/features/teacher/assignments/main/TeacherAssignmentGuide";

const initialForm: CreateAssignmentRequest = {
  gradeLevel: 6,
  academicYear: "2026 - 2027",
  name: "",
  description: "",
  dueAt: "",
  showAnswersAfterSubmit: true,
  targets: [],
};

export default function TeacherAssignmentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
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
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setWizardOpen(false);
      setForm(initialForm);
      if (!response.data) {
        toast.error("Assignment was created, but the server returned no Assignment ID.");
        return;
      }
      toast.success("Assignment draft created. Opening the Builder.");
      router.push(`/teacher/assignments/${response.data.id}`);
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

  const openGuide = () => {
    setGuideOpen(true);
  };

  const startCreatingFromGuide = () => {
    setGuideOpen(false);
    openWizard();
  };

  return (
    <div className="mx-auto space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-body-sm font-bold text-primary">Assignments &amp; Grading</p>
          <h1 className="mt-1 text-page-title font-extrabold tracking-tight">Assignments</h1>
          <p className="mt-1 text-body text-neutral-muted">
            Track due dates, submissions to grade, and progress across classes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openGuide}
            className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-body-sm font-bold shadow-pop-sm transition hover:bg-muted active:translate-y-0.5"
          >
            <BookOpen className="size-4" /> How to create
          </button>
          <button
            type="button"
            onClick={openWizard}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary bg-primary px-4 text-body-sm font-bold text-primary-foreground shadow-pop-sm transition hover:bg-primary-hover active:translate-y-0.5"
          >
            <Plus className="size-4" /> Create assignment
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-pop">
        <div className="border-b-2 border-border px-5 py-4 bg-card">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <h2 className="text-section-title font-extrabold text-foreground">All assignments</h2>
              <p className="text-body-sm text-muted-foreground">
                {visibleAssignments.length} matching assignments
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <label className="flex h-10 items-center gap-2 rounded-xl border-2 border-border bg-card px-3.5 text-body-sm text-muted-foreground shadow-pop-sm focus-within:border-primary">
                <Search className="size-4" />
                <input value={search} onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search assignments..." className="w-44 bg-transparent outline-none font-medium text-foreground placeholder:text-muted-foreground" />
              </label>
              <button type="button" onClick={() => setImportOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-body-sm font-bold shadow-pop-sm transition hover:bg-muted active:translate-y-0.5">
                <Upload className="size-4" /> Import questions
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status as typeof statusFilter)}
                className={`rounded-xl border-2 px-3.5 py-1.5 text-body-sm font-bold shadow-pop-sm transition-all ${statusFilter === status ? "border-primary bg-primary text-primary-foreground -translate-y-0.5" : "border-border bg-card hover:bg-muted hover:text-foreground"}`}>
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
      <TeacherAssignmentGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onStartCreating={startCreatingFromGuide}
      />
    </div>
  );
}
