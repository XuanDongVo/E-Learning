"use client";

import type { ComponentProps } from "react";
import { contentService } from "@/services/content.service";
import {
  QuestionForm as SharedQuestionForm,
  type QuestionMediaUploadHandler,
} from "@/components/features/teacher/question-authoring/QuestionForm";

export * from "@/components/features/teacher/question-authoring/QuestionForm";
export { makeDraftQuestion } from "@/components/features/teacher/question-authoring/question-draft";
export { isQuestionComplete } from "@/components/features/teacher/question-authoring/question-validator";

export function QuestionForm(props: Omit<ComponentProps<typeof SharedQuestionForm>, "onUploadMedia">) {
  const uploadMedia: QuestionMediaUploadHandler = async (file) => {
    const response = await contentService.uploadQuestionDraftMedia(file);
    if (!response.data) {
      throw new Error("Upload failed — server returned no data.");
    }

    return {
      id: response.data.id,
      url: response.data.url,
    };
  };

  return <SharedQuestionForm {...props} onUploadMedia={uploadMedia} />;
}
