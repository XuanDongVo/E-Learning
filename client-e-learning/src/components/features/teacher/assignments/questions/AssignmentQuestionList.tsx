"use client";

import { FileQuestion } from "lucide-react";
import type { AssignmentQuestion } from "@/types/assignment";
import { AssignmentQuestionItem } from "./AssignmentQuestionItem";

export function AssignmentQuestionList({
  questions,
  activeQuestionId,
  locked,
  onSelect,
  onDelete,
}: {
  questions: AssignmentQuestion[];
  activeQuestionId: number | null;
  locked: boolean;
  onSelect: (questionId: number) => void;
  onDelete: (questionId: number) => void;
}) {
  if (questions.length === 0) {
    return (
      <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
        <div>
          <FileQuestion className="mx-auto size-9 text-primary" />
          <p className="mt-3 text-body font-bold">No questions yet</p>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Add the first question manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol>
      {questions.map((item, index) => (
        <AssignmentQuestionItem
          key={item.questionId}
          item={item}
          active={item.questionId === activeQuestionId}
          questionNumber={index + 1}
          locked={locked}
          onSelect={() => onSelect(item.questionId)}
          onDelete={() => onDelete(item.questionId)}
        />
      ))}
    </ol>
  );
}
