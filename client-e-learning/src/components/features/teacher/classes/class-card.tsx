import Link from "next/link";
import { MoreHorizontal, Users } from "lucide-react";
import type { ClassCardProps } from "@/types/class";

export function ClassCard({ classItem, onEdit, onArchive }: ClassCardProps) {
  return (
    <article className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-light text-primary">
          <Users className="h-5 w-5" />
        </div>
        <details className="relative">
          <summary className="list-none cursor-pointer text-neutral-subtle hover:text-primary" aria-label={"More options for " + classItem.name}>
            <MoreHorizontal className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-32 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-1 shadow-lg">
            <button type="button" onClick={() => onEdit(classItem)} className="block w-full rounded px-3 py-2 text-left text-body-sm hover:bg-background-app">Edit</button>
            {classItem.status === "ACTIVE" && (
              <button type="button" onClick={() => onArchive(classItem)} className="block w-full rounded px-3 py-2 text-left text-body-sm text-red-600 hover:bg-background-app">Archive</button>
            )}
          </div>
        </details>
      </div>
      <h2 className="mt-5 text-ui-lg font-extrabold">{classItem.name}</h2>
      <p className="mt-1 text-body text-neutral-muted">{classItem.grade.name} · {classItem.studentCount} students</p>
      <div className="mt-5 flex items-center justify-between border-t border-border-color pt-4 text-body-sm font-bold text-neutral-muted">
        <span>{classItem.academicYear}</span>
        <div className="flex items-center gap-3">
          {classItem.status === "ARCHIVED" && <span className="text-neutral-muted">Archived</span>}
          <Link href={"/teacher/classes/" + classItem.id + "/students"} className="text-primary">View students</Link>
        </div>
      </div>
    </article>
  );
}
