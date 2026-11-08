"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { useRouter } from "@/i18n/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Plus,
  Search,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { classService } from "@/services/class.service";
import { gradeService } from "@/services/grade.service";
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
import { TeacherPageHeader } from "@/components/features/teacher/shared/teacher-page-header";

const initialForm: CreateAssignmentRequest = {
  gradeId: 0,
  academicYear: "",
  name: "",
  description: "",
  startAt: "",
  dueAt: "",
  showAnswersAfterSubmit: true,
  timeLimitMinutes: 60,
  classIds: [],
};

export default function TeacherAssignmentsPage() {
  const tErrors = useTranslations("errors");
  const t = useTranslations("teacher.assignments");
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
  const grades = useQuery({
    queryKey: ["grades"],
    queryFn: gradeService.list,
  });
  const create = useMutation({
    mutationFn: createAssignment,
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setWizardOpen(false);
      setForm(initialForm);
      if (!response.data) {
        toast.error(
          t("notifications.createdWithoutId"),
        );
        return;
      }
      toast.success(t("notifications.created"));
      router.push(`/teacher/assignments/${response.data.id}`);
    },
    onError: (error) => {
      toast.error(
        getAppErrorMessage(error, tErrors as (key: string) => string),
      );
    },
  });

  const assignmentList = assignments.data?.data ?? [];
  const visibleAssignments = assignmentList.filter((assignment) => {
    const matchesSearch = assignment.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return (
      matchesSearch &&
      (statusFilter === "ALL" || assignment.status === statusFilter)
    );
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
    <div className="space-y-5">
      <TeacherPageHeader
        title={t("title")}
        description={t("description")}
        pipoMood="wave"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Clock3 className="size-4" />}
          label={t("summary.active")}
          value={assignmentList.filter((item) => item.status === "PUBLISHED").length}
          hint={t("summary.activeHint")}
          tone="orange"
        />
        <SummaryCard
          icon={<FileSpreadsheet className="size-4" />}
          label={t("summary.needsGrading")}
          value="—"
          hint={t("summary.submissionUnavailable")}
          tone="amber"
        />
        <SummaryCard
          icon={<CheckCircle2 className="size-4" />}
          label={t("summary.submittedOnTime")}
          value="—"
          hint={t("summary.resultsUnavailable")}
          tone="green"
        />
        <SummaryCard
          icon={<Users className="size-4" />}
          label={t("summary.missingSubmissions")}
          value="—"
          hint={t("summary.resultsUnavailable")}
          tone="blue"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-pop">
        <div className="border-b-2 border-border px-5 py-4 bg-card">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <h2 className="text-section-title font-extrabold text-foreground">
                {t("list.title")}
              </h2>
              <p className="text-body-sm text-muted-foreground">
                {t("list.matching", { count: visibleAssignments.length })}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <label className="flex h-10 items-center gap-2 rounded-xl border-2 border-border bg-card px-3.5 text-body-sm text-muted-foreground shadow-pop-sm focus-within:border-primary">
                <Search className="size-4" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("list.searchPlaceholder")}
                  aria-label={t("list.searchLabel")}
                  className="w-44 bg-transparent outline-none font-medium text-foreground placeholder:text-muted-foreground"
                />
              </label>
              <button
                type="button"
                // onClick={() => setImportOpen(true)}
                disabled
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-body-sm font-bold shadow-pop-sm transition hover:bg-muted active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="size-4" /> {t("actions.importQuestions")}
              </button>
              <button
                type="button"
                onClick={openGuide}
                className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-body-sm font-bold shadow-pop-sm transition hover:bg-muted active:translate-y-0.5"
              >
                <BookOpen className="size-4" /> {t("actions.howToCreate")}
              </button>
              <button
                type="button"
                onClick={openWizard}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary bg-primary px-4 text-body-sm font-bold text-primary-foreground shadow-pop-sm transition hover:bg-primary-hover active:translate-y-0.5"
              >
                <Plus className="size-4" /> {t("actions.create")}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl border-2 px-3.5 py-1.5 text-body-sm font-bold shadow-pop-sm transition-all ${
                    statusFilter === status
                      ? "border-primary bg-primary text-primary-foreground -translate-y-0.5"
                      : "border-border bg-card hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {status === "ALL"
                    ? t("statuses.all")
                    : status === "PUBLISHED"
                      ? t("statuses.active")
                      : status === "DRAFT"
                        ? t("statuses.draft")
                        : t("statuses.archived")}
                </button>
              ),
            )}
          </div>
        </div>
        <AssignmentList
          assignments={visibleAssignments}
          isLoading={assignments.isLoading}
        />
      </section>

      <AssignmentWizard
        key={wizardOpen ? "open" : "closed"}
        open={wizardOpen}
        form={form}
        classes={classes.data?.data ?? []}
        grades={grades.data?.data ?? []}
        mode="create"
        isPending={create.isPending}
        onClose={() => setWizardOpen(false)}
        onSubmit={(payload) => create.mutate(payload)}
      />
      <AssignmentImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
      <TeacherAssignmentGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onStartCreating={startCreatingFromGuide}
      />
    </div>
  );
}
