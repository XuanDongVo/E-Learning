"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { QuestionComposer } from "@/components/features/teacher/question-authoring/QuestionComposer";
import { useBuilder } from "@/components/features/teacher/assignments/builder/store";
import * as ops from "@/components/features/teacher/assignments/builder/ops";
import { assignmentQuestionService } from "@/services/assignment/assignment.question.service";
import { contentService } from "@/services/content.service";
import type { CreateAssignmentQuestionRequest } from "@/types/assignment";
import type { DraftQuestion, QuestionType } from "@/types/question";
import type { QuestionItem, InsertTarget } from "@/types/assignment-builder";

function toPayload(question: DraftQuestion): CreateAssignmentQuestionRequest {
  if (question.type === "MATCHING" || question.type === "CLOZE") {
    throw new Error(
      `Question type ${question.type} is not supported by the Assignment Question API yet. Nothing was saved. Use Single Choice, Multiple Choice, True/False, Fill in the Blank, or Type Answer.`,
    );
  }

  const mediaIds = question.media
    .map((media) => Number(media.id))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  const common = {
    difficulty: question.difficulty,
    content: question.text.trim(),
    explanation: question.explanation.trim() || undefined,
    hint: question.hint?.trim() || undefined,
    mediaIds,
  };

  switch (question.type) {
    case "SINGLE_CHOICE":
      return {
        ...common,
        type: question.type,
        options: question.options.map((option) => ({
          content: option.text.trim(),
          isCorrect: question.correctOptionIds.includes(option.id),
        })),
      };
    case "MULTIPLE_CHOICE":
      return {
        ...common,
        type: question.type,
        options: question.options.map((option) => ({
          content: option.text.trim(),
          isCorrect: question.correctOptionIds.includes(option.id),
        })),
      };
    case "TRUE_FALSE":
      return {
        ...common,
        type: question.type,
        answers: [{ rawValue: question.trueFalseAnswer }],
      };
    case "FILL_IN_BLANK":
      return {
        ...common,
        type: question.type,
        answers: question.acceptedAnswers
          .map((answer) => answer.trim())
          .filter(Boolean)
          .map((rawValue) => ({ rawValue })),
      };
    case "TYPE_ANSWER":
      return {
        ...common,
        type: question.type,
        answers: question.acceptedAnswers
          .map((answer) => answer.trim())
          .filter(Boolean)
          .map((rawValue) => ({ rawValue })),
      };
  }
}

function toBuilderItem(
  draft: DraftQuestion,
  questionId: number,
  target: InsertTarget,
): QuestionItem {
  const prompt = draft.text.trim();
  const common = {
    prompt,
    explanation: draft.explanation.trim(),
    hint: draft.hint?.trim() ?? "",
    blankRef: null,
  };

  let content: QuestionItem["content"];
  switch (draft.type) {
    case "SINGLE_CHOICE":
      content = {
        ...common,
        type: "SINGLE_CHOICE",
        display: "list",
        options: draft.options.map((option) => ({
          id: `qopt-${questionId}-${option.id}`,
          text: option.text.trim(),
          isCorrect: draft.correctOptionIds.includes(option.id),
        })),
      };
      break;
    case "MULTIPLE_CHOICE":
      content = {
        ...common,
        type: "MULTIPLE_CHOICE",
        options: draft.options.map((option) => ({
          id: `qopt-${questionId}-${option.id}`,
          text: option.text.trim(),
          isCorrect: draft.correctOptionIds.includes(option.id),
        })),
      };
      break;
    case "TRUE_FALSE":
      content = {
        ...common,
        type: "SINGLE_CHOICE",
        display: "list",
        options: [
          {
            id: `tf-true-${questionId}`,
            text: "True",
            isCorrect: draft.trueFalseAnswer === "TRUE",
          },
          {
            id: `tf-false-${questionId}`,
            text: "False",
            isCorrect: draft.trueFalseAnswer === "FALSE",
          },
        ],
      };
      break;
    case "FILL_IN_BLANK":
    case "TYPE_ANSWER":
      content = {
        ...common,
        type: "TEXT_INPUT",
        acceptedAnswers: draft.acceptedAnswers.map((answer) => answer.trim()).filter(Boolean),
        caseSensitive: false,
        prefix: "",
        cue: "",
      };
      break;
    default:
      throw new Error(`Unsupported question type: ${draft.type}`);
  }

  return {
    id: `q-${questionId}`,
    kind: "question",
    serverQuestionId: questionId,
    serverType: draft.type,
    serverDifficulty: draft.difficulty,
    serverMediaIds: draft.media
      .map((media) => Number(media.id))
      .filter((id) => Number.isSafeInteger(id) && id > 0),
    content,
    config: {
      points: 1,
      required: true,
      gradingMode: "AUTO",
      isExample: false,
      groupId: target.groupId,
    },
  };
}

function toDraftQuestion(item: QuestionItem): DraftQuestion {
  const content = item.content;
  const options = "options" in content ? content.options.map((option) => ({ id: option.id, text: option.text })) : [];
  const correctOptionIds = "options" in content ? content.options.filter((option) => option.isCorrect).map((option) => option.id) : [];
  const serverType = (item.serverType ?? content.type) as QuestionType;
  const acceptedAnswers = content.type === "TEXT_INPUT" ? [...content.acceptedAnswers] : [""];
  const media = (item.serverMedia ?? []).map((asset) => ({
    id: String(asset.mediaId), name: "Question media",
    kind: asset.mediaType.toUpperCase().includes("AUDIO") ? "audio" as const : "image" as const,
    url: asset.url,
  }));
  return {
    draftId: "edit-" + String(item.serverQuestionId ?? item.id),
    type: serverType, difficulty: item.serverDifficulty ?? "EASY", text: content.prompt,
    options, correctOptionIds,
    trueFalseAnswer: options.some((option) => option.text.toUpperCase() === "FALSE" && correctOptionIds.includes(option.id)) ? "FALSE" : "TRUE",
    acceptedAnswers, media, explanation: content.explanation ?? "", hint: content.hint ?? "",
  };
}
export function AssignmentQuestionComposerDialog({ assignmentId }: { assignmentId: string }) {
  const open = useBuilder((state) => state.questionComposerOpen);
  const target = useBuilder((state) => state.questionComposerTarget);
  const close = useBuilder((state) => state.closeQuestionComposer);

  const uploadMedia = useCallback(async (file: File) => {
    const response = await contentService.uploadQuestionDraftMedia(file);
    if (!response.data) throw new Error("Media upload returned no metadata.");
    return { id: response.data.id, url: response.data.url };
  }, []);

  const saveQuestions = useCallback(async (drafts: DraftQuestion[]) => {
    const id = Number(assignmentId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid Assignment ID. Reopen the Builder and try again.");
    }

    // Validate every type before making the request so a mixed batch cannot partially save.
    const payload = drafts.map(toPayload);
    const response = await assignmentQuestionService.create(id, payload);
    const created = response.data ?? [];
    if (created.length !== drafts.length) {
      throw new Error(
        `The server returned ${created.length} saved question(s) for ${drafts.length} draft(s). Reload the Assignment before retrying to avoid duplicates.`,
      );
    }
    if (created.some((item) => !Number.isSafeInteger(item.questionId) || item.questionId <= 0)) {
      throw new Error(
        "The server saved the request but returned an invalid question ID. Reload the Assignment before retrying to avoid duplicates.",
      );
    }

    const state = useBuilder.getState();
    const current = state.assignment;
    let insertionTarget = target;
    if (!insertionTarget || !current.sections.some((section) => section.id === insertionTarget?.sectionId)) {
      const section = current.sections[current.sections.length - 1];
      if (section) {
        insertionTarget = { sectionId: section.id, groupId: null, index: section.itemIds.length };
      } else {
        const section = ops.newSection();
        insertionTarget = { sectionId: section.id, groupId: null, index: 0 };
        state.mutate((draft) => draft.sections.push(section));
      }
    }

    const baseTarget = insertionTarget!;
    state.mutate((draft) => {
      const section = draft.sections.find((item) => item.id === baseTarget.sectionId);
      if (!section) throw new Error("The target section no longer exists. Reload the Builder and try again.");
      drafts.forEach((draftQuestion, index) => {
        const questionId = created[index]?.questionId;
        if (!Number.isSafeInteger(questionId) || questionId <= 0) {
          throw new Error("The server response did not contain a valid question ID.");
        }
        const item = toBuilderItem(draftQuestion, questionId, baseTarget);
        draft.items[item.id] = item;
        ops.place(draft, item.id, {
          ...baseTarget,
          index: baseTarget.index + index,
        });
      });
    });

    const firstQuestionId = created[0].questionId;
    state.select({ kind: "item", id: `q-${firstQuestionId}` });
    state.closeQuestionComposer();
    toast.success(`${created.length} question(s) added to the Assignment`);
  }, [assignmentId, target]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-question-composer-title"
        className="flex h-[min(94vh,1000px)] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6">
          <div>
            <h2 id="assignment-question-composer-title" className="text-sm font-semibold text-slate-900">
              Add questions to Assignment
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Questions are saved through Question Engine; section and item order remain controlled by the Builder.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close question composer"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          <QuestionComposer
            title="Question Composer"
            description="Create and validate questions before inserting them into the Assignment."
            storageKey={`assignment-question-composer:${assignmentId}`}
            onUploadMedia={uploadMedia}
            onSave={saveQuestions}
            successDescription="Saved questions have been inserted into the Builder."
          />
        </div>
      </section>
    </div>
  );
}
