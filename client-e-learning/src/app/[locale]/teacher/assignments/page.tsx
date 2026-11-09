"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { useRouter } from "@/i18n/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { classService } from "@/services/class.service";
import { gradeService } from "@/services/grade.service";
import {
  createAssignment,
  getTeacherAssignmentSummary,
  listAssignments,
} from "@/services/assignment.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { CreateAssignmentRequest } from "@/types/assignment";
import { AssignmentImportDialog } from "@/components/features/teacher/assignments/main/AssignmentImportDialog";
import { AssignmentList } from "@/components/features/teacher/assignments/main/AssignmentList";
import { AssignmentWizard } from "@/components/features/teacher/assignments/main/AssignmentWizard";
import { SummaryCard } from "@/components/features/teacher/assignments/main/SummaryCard";
import { TeacherAssignmentGuide } from "@/components/features/teacher/assignments/main/TeacherAssignmentGuide";
import { TeacherPageHeader } from "@/components/features/teacher/shared/teacher-page-header";
import { PageBanner } from "@/components/feedback";
import { Skeleton } from "@/components/ui/skeleton";

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
    queryKey: QUERY_KEYS.assignments,
    queryFn: listAssignments,
  });
  const summary = useQuery({
    queryKey: QUERY_KEYS.teacherAssignmentSummary,
    queryFn: getTeacherAssignmentSummary,
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
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.teacherAssignmentSummary,
      });
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
  const summaryData = summary.data?.data;
  const resultRate =
    summaryData?.resultRate == null
      ? "—"
      : `${Math.round(summaryData.resultRate * 100)}%`;
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

      <section aria-labelledby="assignment-summary-title" className="space-y-3">
        <div>
          <h2
            id="assignment-summary-title"
            className="text-section-title font-bold text-foreground"
          >
            {t("summary.title")}
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {t("summary.description")}
          </p>
        </div>

        {summary.isError ? (
          <PageBanner
            tone="error"
            title={t("summary.errorTitle")}
            message={t("summary.errorMessage")}
            action={
              <button
                type="button"
                onClick={() => void summary.refetch()}
                className="min-h-10 rounded-lg border border-current px-3 py-2 text-body-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {tErrors("retry")}
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<Clock3 className="size-4" />}
              label={t("summary.open")}
              value={
                summary.isLoading ? (
                  <Skeleton className="h-8 w-14 rounded-lg" />
                ) : (
                  summaryData?.openAssignmentCount ?? 0
                )
              }
              hint={t("summary.openHint")}
              tone="primary"
            />
            <SummaryCard
              icon={<CheckCircle2 className="size-4" />}
              label={t("summary.finalized")}
              value={
                summary.isLoading ? (
                  <Skeleton className="h-8 w-16 rounded-lg" />
                ) : (
                  summaryData?.finalizedDeliveryCount ?? 0
                )
              }
              hint={t("summary.finalizedHint")}
              tone="success"
            />
            <SummaryCard
              icon={<TriangleAlert className="size-4" />}
              label={t("summary.overdue")}
              value={
                summary.isLoading ? (
                  <Skeleton className="h-8 w-14 rounded-lg" />
                ) : (
                  summaryData?.overdueIncompleteDeliveryCount ?? 0
                )
              }
              hint={t("summary.overdueHint")}
              tone="warning"
            />
            <SummaryCard
              icon={<BarChart3 className="size-4" />}
              label={t("summary.completionRate")}
              value={
                summary.isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  resultRate
                )
              }
              hint={
                summaryData?.resultRate == null && !summary.isLoading
                  ? t("summary.noDueDeliveries")
                  : t("summary.completionRateHint")
              }
              tone="info"
            />
          </div>
        )}
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
