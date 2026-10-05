"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { getAssignment } from "@/services/assignment.service";
import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import type { AssignmentQuestion } from "@/types/assignment";
import { AssignmentQuestionEditor } from "@/components/features/teacher/assignments/questions/AssignmentQuestionEditor";
import { AssignmentQuestionList } from "@/components/features/teacher/assignments/questions/AssignmentQuestionList";
import { AssignmentQuestionToolbar } from "@/components/features/teacher/assignments/questions/AssignmentQuestionToolbar";
import { EntityHeader } from "@/components/features/teacher/content/components/entity-header";
import { AssignmentWizard } from "@/components/features/teacher/assignments/main/AssignmentWizard";
import { classService } from "@/services/class.service";
import { updateAssignment, updateAssignmentStatus } from "@/services/assignment.service";
import type { CreateAssignmentRequest } from "@/types/assignment";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const assignmentId = Number(params.id);

  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);

  const assignment = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => getAssignment(assignmentId),
    enabled: Number.isFinite(assignmentId),
  });

  const questions = useQuery({
    queryKey: ["assignment", assignmentId, "questions"],
    queryFn: () => assignmentQuestionService.list(assignmentId),
    enabled: Number.isFinite(assignmentId),
  });

  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: classService.list,
  });

  const update = useMutation({
    mutationFn: (payload: CreateAssignmentRequest) =>
      updateAssignment(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      setEditAssignmentOpen(false);
      toast.success("Assignment updated.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not save assignment.");
    }
  });

  const status = useMutation({
    mutationFn: (nextStatus: string) =>
      updateAssignmentStatus(assignmentId, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      toast.success("Status updated.");
    },
    onError: (err) => {
      toast.error("Could not update status.");
    }
  });

  const data = assignment.data?.data;
  const questionItems: AssignmentQuestion[] = questions.data?.data ?? [];
  const activeQuestion =
    questionItems.find((item) => item.questionId === activeQuestionId) ?? undefined;
  const locked = data?.status === "ARCHIVED" || false;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["assignment", assignmentId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["assignment", assignmentId, "questions"],
      }),
    ]);
  };

  const openEditor = (questionId?: number) => {
    if (locked) return;
    setActiveQuestionId(questionId ?? null);
    setEditorOpen(true);
  };

  const deleteQuestion = async (questionId: number) => {
    if (locked) return;
    if (!window.confirm("Delete this question from the assignment?")) return;

    try {
      await assignmentQuestionService.bulkDelete(assignmentId, {
        ids: [questionId],
      });
      await refresh();
      if (activeQuestionId === questionId) {
        setActiveQuestionId(null);
      }
      toast.success("Question deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the question.",
      );
    }
  };

  if (assignment.isLoading || questions.isLoading) {
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

  const readyCount = questionItems.filter(
    (item) => item.question.complete || item.question.is_complete === true,
  ).length;

  return (
    <div className="mx-auto max-w-[1180px] space-y-5">
      <Link
        href="/teacher/assignments"
        className="inline-flex items-center gap-2 text-body-sm font-bold text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to assignments
      </Link>

      <EntityHeader
        title={data.name}
        label="Assignment"
        status={data.status}
        description={`Grade ${data.gradeLevel} · Due ${new Date(data.dueAt).toLocaleString("en-US")}`}
        icon={<BookOpen size={21} />}
        editLabel="Edit Assignment"
        onEdit={() => setEditAssignmentOpen(true)}
        onStatusChange={(nextStatus) => status.mutate(nextStatus)}
        onArchive={() => status.mutate("ARCHIVED")}
        actionPending={status.isPending}
        tone="blue"
      />

      <AssignmentWizard
        key={editAssignmentOpen ? "open" : "closed"}
        open={editAssignmentOpen}
        mode="edit"
        form={{
          gradeLevel: data.gradeLevel,
          academicYear: data.academicYear,
          name: data.name,
          description: data.description ?? "",
          dueAt: data.dueAt.slice(0, 16),
          startAt: data.startAt ? data.startAt.slice(0, 16) : undefined,
          timeLimitSeconds: data.timeLimitSeconds ?? undefined,
          targets: data.targets.map((t): any => t.type === "CLASS" ? {
            type: "CLASS",
            classId: t.classId!
          } : {
            type: "GRADE"
          }) as CreateAssignmentRequest["targets"]
        }}
        classes={classes.data?.data ?? []}
        isPending={update.isPending}
        onClose={() => setEditAssignmentOpen(false)}
        onSubmit={(payload) => update.mutate(payload)}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Questions"
          value={String(questionItems.length)}
          hint={questionItems.length === data.questionCount ? undefined : "Count will refresh from the server."}
        />
        <InfoCard label="Needs grading" value="—" hint="Submission results API is not available yet" />
        <InfoCard label="Recipients" value={`${data.targets.length} groups`} />
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <AssignmentQuestionToolbar
          count={questionItems.length}
          readyCount={readyCount}
          locked={locked}
          createHref={`/teacher/assignments/${assignmentId}/questions/create`}
        />

        {locked && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-body-sm text-amber-800">
            This Assignment is archived. Question editing is unavailable.
          </div>
        )}

        <AssignmentQuestionList
          questions={questionItems}
          activeQuestionId={activeQuestionId}
          locked={locked}
          onSelect={(questionId) => openEditor(questionId)}
          onDelete={deleteQuestion}
        />
      </section>

      {editorOpen && (
        <AssignmentQuestionEditor
          assignmentId={assignmentId}
          question={activeQuestion}
          locked={locked}
          onClose={() => {
            setEditorOpen(false);
            setActiveQuestionId(null);
          }}
          onSaved={async () => {
            await refresh();
            setEditorOpen(false);
            setActiveQuestionId(null);
            toast.success("Question saved.");
          }}
        />
      )}

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
      {hint && <p className="mt-1 text-body-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
