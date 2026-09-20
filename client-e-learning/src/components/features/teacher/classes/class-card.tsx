import { MoreHorizontal, Users } from "lucide-react";

import type { ClassCardProps } from "@/types/class";


export function ClassCard({ classItem }: ClassCardProps) {
  return (
    <article className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-light text-primary">
          <Users className="h-5 w-5" />
        </div>

        <button
          type="button"
          aria-label={`More options for ${classItem.name}`}
          className="text-neutral-subtle hover:text-primary"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <h2 className="mt-5 text-lg font-extrabold">
        {classItem.name}
      </h2>

      <p className="mt-1 text-sm text-neutral-muted">
        {classItem.grade.name} · {classItem.studentCount} students
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-border-color pt-4 text-xs font-bold text-neutral-muted">
        <span>{classItem.academicYear}</span>
        <span className="text-primary">View class</span>
      </div>
    </article>
  );
}