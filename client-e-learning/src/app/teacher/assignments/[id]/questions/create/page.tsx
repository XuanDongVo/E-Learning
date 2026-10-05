"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getAssignment } from "@/services/assignment.service";
import { contentService } from "@/services/content.service";
import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import { QuestionComposer } from "@/components/features/teacher/question-authoring/QuestionComposer";
import type { DraftQuestion } from "@/types/question";

export default function CreateAssignmentQuestionsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assignmentId = Number(params.id);

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

  const data = assignment.data?.data;
  const currentCount = questions.data?.data?.length ?? 0;

  if (assignment.isLoading || questions.isLoading) {
    return (
      <div className="mx-auto max-w-[1180px] p-8 text-body-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[1180px] p-8 text-body-sm text-destructive">
        Assignment not found.
      </div>
    );
  }

  if (data.status === "ARCHIVED") {
    return (
      <div className="mx-auto max-w-[1180px] space-y-4 p-8">
        <Link
          href={`/teacher/assignments/${assignmentId}`}
          className="inline-flex items-center gap-2 text-body-sm font-bold text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to assignment
        </Link>
        <p className="text-body-sm text-muted-foreground">
          This Assignment is archived. Questions cannot be created.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link
        href={`/teacher/assignments/${assignmentId}`}
        className="mb-4 inline-flex items-center gap-2 text-body-sm font-bold text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to {data.name}
      </Link>

      <QuestionComposer
        title={`Create questions for ${data.name}`}
        description={`${currentCount}/100 questions currently in this Assignment. Add and edit multiple questions, then save them together.`}
        storageKey={`elearning_assignment_question_draft:${assignmentId}`}
        onUploadMedia={async (file) => {
          const response = await contentService.uploadQuestionDraftMedia(file);
          if (!response.data) {
            throw new Error("Upload failed — server returned no data.");
          }

          return {
            id: response.data.id,
            url: response.data.url,
          };
        }}
        onSave={async (drafts: DraftQuestion[]) => {
          const remaining = 100 - currentCount;

          if (drafts.length > remaining) {
            throw new Error(
              `Only ${remaining} more question(s) can be added to this Assignment.`,
            );
          }

          await assignmentQuestionService.create(
            assignmentId,
            drafts.map(toPayload),
          );
        }}
        successDescription={`Saved to ${data.name}.`}
        onSaveSuccess={() => {
          router.push(`/teacher/assignments/${assignmentId}`);
        }}
      />
    </div>
  );
}

function toPayload(question: DraftQuestion) {
  return {
    type: question.type,
    difficulty: question.difficulty,
    content: question.text.trim(),
    explanation: question.explanation.trim() || undefined,
    options:
      question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE"
        ? question.options.map((option) => ({
            content: option.text.trim(),
            isCorrect: question.correctOptionIds.includes(option.id),
          }))
        : undefined,
    answers:
      question.type === "TRUE_FALSE"
        ? [{ rawValue: question.trueFalseAnswer }]
        : question.type === "FILL_IN_BLANK" || question.type === "TYPE_ANSWER"
          ? question.acceptedAnswers
              .map((answer) => answer.trim())
              .filter(Boolean)
              .map((rawValue) => ({ rawValue }))
          : undefined,
    mediaIds: question.media
      .map((media) => Number(media.id))
      .filter((id) => Number.isFinite(id)),
  };
}
