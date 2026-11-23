"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, CheckCircle2, Circle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentButton } from "@/components/student-ui/student-button";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentCollectionPanel } from "@/components/student-ui/patterns/student-collection-panel";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { studentStudyPlanService } from "@/services/student/student-study-plan.service";
import type { StudentStudyTask, StudyTaskInput } from "@/types/student-study-plan";

type TaskFilter = "all" | "pending" | "completed";
const KEY = ["student", "study-plan", "tasks"] as const;

function dateLabel(value: string, locale: string, today: string, todayText: string) {
  if (value === today) return todayText;
  return new Date(value + "T12:00:00").toLocaleDateString(
    locale === "en" ? "en-US" : "vi-VN",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

export function StudentStudyPlanPage() {
  const t = useTranslations("student.studyPlan");
  const locale = useLocale();
  const client = useQueryClient();
  const [filter, setFilter] = useState<TaskFilter>("pending");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudentStudyTask | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StudentStudyTask | null>(null);

  const tasksQuery = useQuery({
    queryKey: KEY,
    queryFn: async () => (await studentStudyPlanService.list()).data ?? [],
  });
  const reload = () => client.invalidateQueries({ queryKey: KEY });
  const createTask = useMutation({ mutationFn: studentStudyPlanService.create, onSuccess: reload });
  const updateTask = useMutation({
    mutationFn: ({ id, input }: { id: number; input: StudyTaskInput }) => studentStudyPlanService.update(id, input),
    onSuccess: reload,
  });
  const completeTask = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => studentStudyPlanService.complete(id, completed),
    onSuccess: reload,
  });
  const removeTask = useMutation({ mutationFn: studentStudyPlanService.delete, onSuccess: reload });

  const tasks = tasksQuery.data ?? [];
  const pending = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - pending;
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale);
    return tasks.filter((task) =>
      (filter === "all" || (filter === "completed" ? task.completed : !task.completed))
      && (!query || (task.title + " " + (task.notes ?? "")).toLocaleLowerCase(locale).includes(query)),
    );
  }, [tasks, filter, search, locale]);
  const today = localToday();
  const saving = createTask.isPending || updateTask.isPending;

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setTitle("");
    setNotes("");
    setPlannedDate("");
    setError("");
  }

  function openCreate() {
    closeForm();
    setFormOpen(true);
  }

  function openEdit(task: StudentStudyTask) {
    setEditing(task);
    setTitle(task.title);
    setNotes(task.notes ?? "");
    setPlannedDate(task.plannedDate ?? "");
    setError("");
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setError("");
    const input: StudyTaskInput = {
      title: title.trim(),
      notes: notes.trim() || null,
      plannedDate: plannedDate || null,
    };
    try {
      if (editing) await updateTask.mutateAsync({ id: editing.id, input });
      else await createTask.mutateAsync(input);
      closeForm();
    } catch {
      setError(t("submitError"));
    }
  }

  async function toggle(task: StudentStudyTask) {
    setError("");
    try {
      await completeTask.mutateAsync({ id: task.id, completed: !task.completed });
    } catch {
      setError(t("statusError"));
    }
  }

  async function removeSelected() {
    if (!deleteTarget) return;
    setError("");
    try {
      await removeTask.mutateAsync(deleteTarget.id);
      if (editing?.id === deleteTarget.id) closeForm();
      setDeleteTarget(null);
    } catch {
      setError(t("deleteError"));
      setDeleteTarget(null);
    }
  }

  return (
    <section className="space-y-6 pb-10">
      <StudentPageHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={!formOpen ? (
          <StudentButton variant="action" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />{t("newTask")}
          </StudentButton>
        ) : undefined}
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {([
          [t("totalTasks"), tasks.length, CalendarDays],
          [t("pendingTasks"), pending, Circle],
          [t("doneTasks"), completed, CheckCircle2],
        ] as const).map(([label, value, Icon]) => (
          <PaperSurface key={label} className="flex min-w-0 flex-col gap-2 p-3 sm:p-4">
            <Icon className="size-5 text-primary" aria-hidden="true"/>
            <strong className="text-2xl font-extrabold tabular-nums">{value}</strong>
            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">{label}</span>
          </PaperSurface>
        ))}
      </div>

      {formOpen && (
        <PaperSurface as="section" variant="lined" className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">{t(editing ? "editTitle" : "createTitle")}</h2>
            <StudentButton variant="quiet" onClick={closeForm} aria-label={t("close")}>
              <X className="size-4" />
            </StudentButton>
          </div>
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="study-task-title" className="student-label">{t("taskTitle")}</label>
              <input id="study-task-title" autoFocus required maxLength={140}
                value={title} onChange={(event) => setTitle(event.target.value)}
                placeholder={t("taskTitlePlaceholder")}
                className="student-control w-full text-left" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="study-task-notes" className="student-label">{t("notes")}</label>
              <textarea id="study-task-notes" maxLength={600} rows={3}
                value={notes} onChange={(event) => setNotes(event.target.value)}
                placeholder={t("notesPlaceholder")}
                className="student-control w-full resize-y text-left" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="study-task-date" className="student-label">{t("plannedDate")}</label>
              <input id="study-task-date" type="date"
                value={plannedDate} onChange={(event) => setPlannedDate(event.target.value)}
                className="student-control w-full max-w-xs text-left" />
            </div>
            <p className="text-xs text-muted-foreground">{t("formHint")}</p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <StudentButton variant="action" type="submit" loading={saving} disabled={!title.trim()}>
                <Check className="size-4" aria-hidden="true" /> {t(editing ? "save" : "create")}
              </StudentButton>
              <StudentButton variant="quiet" onClick={closeForm}>{t("cancel")}</StudentButton>
            </div>
          </form>
        </PaperSurface>
      )}

      <StudentCollectionPanel
        ariaLive="polite"
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label={t("title")} className="flex flex-wrap gap-1.5">
              {(["pending", "all", "completed"] as const).map((value) => (
                <StudentButton key={value} variant={filter === value ? "secondary" : "quiet"}
                  size="compact" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                  {t(value)}
                </StudentButton>
              ))}
            </div>
            <label className="student-control flex min-w-0 items-center gap-2 sm:w-64">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true"/>
              <span className="sr-only">{t("search")}</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                placeholder={t("search")} className="min-w-0 flex-1 bg-transparent text-sm outline-none"/>
            </label>
          </div>
        }
      >
        {error && !formOpen && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {tasksQuery.isPending && <p role="status" className="py-6 text-sm text-muted-foreground">{t("loading")}</p>}
        {tasksQuery.isError && (
          <div role="alert" className="space-y-2">
            <p className="text-sm text-destructive">{t("loadError")}</p>
            <StudentButton onClick={() => void tasksQuery.refetch()}>{t("retry")}</StudentButton>
          </div>
        )}
        {tasksQuery.isSuccess && visible.length === 0 && (
          <StudentCollectionEmptyState
            title={tasks.length === 0 ? t("emptyTitle") : t("noResultsTitle")}
            description={tasks.length === 0 ? t("emptyDescription") : t("noResultsDescription")}
            action={tasks.length === 0 && !formOpen ? (
              <StudentButton variant="action" onClick={openCreate}><Plus className="size-4"/>{t("newTask")}</StudentButton>
            ) : undefined}
          />
        )}
        {tasksQuery.isSuccess && visible.map((task) => (
          <article key={task.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-ink/25 bg-card-bg p-3 sm:p-4">
            <button type="button" disabled={completeTask.isPending || removeTask.isPending}
              aria-label={t(task.completed ? "reopen" : "finish")}
              title={t(task.completed ? "reopen" : "finish")}
              onClick={() => void toggle(task)}
              className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-ink/40 text-primary transition hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {task.completed ? <CheckCircle2 className="size-5"/> : <Circle className="size-5"/>}
            </button>
            <div className="min-w-0 flex-1 space-y-1.5">
              <h3 className={task.completed ? "break-words text-sm font-bold text-muted-foreground line-through" : "break-words text-sm font-bold"}>{task.title}</h3>
              {task.notes && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{task.notes}</p>}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true"/>
                {task.plannedDate ? dateLabel(task.plannedDate, locale, today, t("today")) : t("unscheduled")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
              <StudentButton size="compact" variant="quiet" aria-label={t("edit")}
                disabled={saving || removeTask.isPending} onClick={() => openEdit(task)}>
                <Pencil className="size-4"/><span className="hidden sm:inline">{t("edit")}</span>
              </StudentButton>
              <StudentButton size="compact" variant="quiet" aria-label={t("delete")}
                disabled={removeTask.isPending} onClick={() => setDeleteTarget(task)}>
                <Trash2 className="size-4"/><span className="hidden sm:inline">{t("delete")}</span>
              </StudentButton>
            </div>
          </article>
        ))}
      </StudentCollectionPanel>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="student-theme border-2 border-ink bg-card-bg shadow-pop">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={removeTask.isPending} onClick={() => void removeSelected()}>
              {t("deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
