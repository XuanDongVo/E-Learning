"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import type {
  AssignmentQuestion,
  CreateAssignmentQuestionRequest,
} from "@/types/assignment";
import type { DraftQuestion } from "@/types/question";
import { contentService } from "@/services/content.service";
import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import { QuestionForm } from "@/components/features/teacher/question-authoring/QuestionForm";
import { makeDraftQuestion } from "@/components/features/teacher/question-authoring/question-draft";

function toDraft(item?: AssignmentQuestion): DraftQuestion {
  if (!item) return makeDraftQuestion();

  const q = item.question;
  const options = q.options.map((option) => ({
    id: String(option.id),
    text: option.content,
  }));

  return makeDraftQuestion({
    draftId: `assignment-question-${q.id}`,
    type: q.type,
    difficulty: q.difficulty,
    text: q.content,
    explanation: q.explanation ?? "",
    options:
      options.length >= 2
        ? options
        : makeDraftQuestion().options,
    correctOptionIds: q.options
      .filter((option) => option.isCorrect)
      .map((option) => String(option.id)),
    trueFalseAnswer:
      q.answers.find((answer) => answer.rawValue === "FALSE")
        ? "FALSE"
        : "TRUE",
    acceptedAnswers:
      q.answers.length > 0
        ? q.answers.map((answer) => answer.rawValue)
        : [""],
    media: q.media.map((media) => ({
      id: String(media.mediaId),
      name: media.mediaType,
      kind:
        media.mediaType.toLowerCase().includes("audio") ? "audio" : "image",
      url: media.url,
    })),
  });
}

function toPayload(question: DraftQuestion): CreateAssignmentQuestionRequest {
  const payload: CreateAssignmentQuestionRequest = {
    type: question.type,
    difficulty: question.difficulty,
    content: question.text.trim(),
    explanation: question.explanation.trim() || undefined,
    mediaIds: question.media
      .map((media) => Number(media.id))
      .filter((id) => Number.isFinite(id)),
  };

  if (
    question.type === "SINGLE_CHOICE" ||
    question.type === "MULTIPLE_CHOICE"
  ) {
    payload.options = question.options.map((option) => ({
      content: option.text.trim(),
      isCorrect: question.correctOptionIds.includes(option.id),
    }));
  }

  if (question.type === "TRUE_FALSE") {
    payload.answers = [{ rawValue: question.trueFalseAnswer }];
  }

  if (
    question.type === "FILL_IN_BLANK" ||
    question.type === "TYPE_ANSWER"
  ) {
    payload.answers = question.acceptedAnswers.map((answer) => ({
      rawValue: answer.trim(),
    }));
  }

  return payload;
}

export function AssignmentQuestionEditor({
  assignmentId,
  question,
  locked,
  onClose,
  onSaved,
}: {
  assignmentId: number;
  question?: AssignmentQuestion;
  locked: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<DraftQuestion>(() => toDraft(question));
  const [saving, setSaving] = useState(false);

  const title = useMemo(
    () => (question ? "Edit question" : "Add question"),
    [question],
  );

  useEffect(() => {
    setDraft(toDraft(question));
  }, [question]);

  const handleUploadMedia = async (file: File) => {
    const response = await contentService.uploadQuestionDraftMedia(file);
    if (!response.data) {
      throw new Error("Upload failed — server returned no data.");
    }

    return {
      id: response.data.id,
      url: response.data.url,
    };
  };

  const save = async () => {
    if (locked || !draft.text.trim()) return;

    setSaving(true);
    try {
      const payload = toPayload(draft);

      if (question) {
        await assignmentQuestionService.update(
          assignmentId,
          question.questionId,
          payload,
        );
      } else {
        await assignmentQuestionService.create(assignmentId, [payload]);
      }

      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 p-4">
      <div className="mx-auto flex h-full max-w-3xl items-center">
        <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-start justify-between border-b border-border p-5">
            <div>
              <p className="text-body-sm font-bold text-primary">
                Assignment question
              </p>
              <h2 className="mt-1 text-section-title font-bold">{title}</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <QuestionForm
              question={draft}
              onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
              onUploadMedia={handleUploadMedia}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border p-5">
            <p className="text-body-sm text-muted-foreground">
              {locked
                ? "Questions are locked after the first attempt."
                : "Saved directly to this Assignment."}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-3 py-2 text-body-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving || locked || !draft.text.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {saving ? "Saving..." : "Save question"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
