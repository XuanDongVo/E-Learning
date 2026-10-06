import Link from "next/link";
import { Users } from "lucide-react";
import type { StudentTableProps } from "@/types/student";

export function StudentTable({ students, isLoading, selectedIds, onToggle, onToggleAll, onStatusChange }: StudentTableProps) {
  if (isLoading) return <div className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-10 text-center text-neutral-muted">Loading students...</div>;
  if (!students.length) return <div className="rounded-[var(--radius-md)] border border-dashed border-border-color bg-card-bg p-10 text-center"><Users className="mx-auto size-8 text-primary" /><p className="mt-3 font-bold">No students found</p><p className="mt-1 text-neutral-muted">Adjust your filters or add a student.</p></div>;

  const allSelected = students.length > 0 && students.every((student) => selectedIds.includes(student.id));

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border-color bg-card-bg">
      <div className="flex items-center gap-3 border-b border-border-color px-4 py-3">
        <input type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="Select all students" />
        <span className="text-body-sm text-neutral-muted">Select all</span>
      </div>
      <div className="divide-y divide-border-color">
        {students.map((student) => {
          const activeClasses = student.classes.filter((item) => item.status === "ACTIVE");
          const inactiveClasses = student.classes.filter((item) => item.status !== "ACTIVE");
          return (
            <article key={student.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <input type="checkbox" checked={selectedIds.includes(student.id)} onChange={() => onToggle(student.id)}
                    className="mt-2" aria-label={"Select " + student.fullName} />
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light font-extrabold text-primary">
                    {student.fullName.split(" ").map((part) => part[0]).join("").slice(-2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link href={"/teacher/students/" + student.id} className="font-extrabold text-primary hover:underline">{student.fullName}</Link>
                    <p className="text-body-sm text-neutral-muted">{student.email} · {student.phone || "No phone"}</p>
                  </div>
                </div>
                <button type="button" onClick={() => onStatusChange(student)}
                  className={"shrink-0 rounded-full px-3 py-1 text-body-sm font-bold " + (student.accountStatus === "ACTIVE" ? "bg-success-soft text-success" : "bg-muted text-neutral-muted")}>
                  {student.accountStatus === "ACTIVE" ? "Active" : "Locked"}
                </button>
              </div>
              <div className="mt-4 grid gap-4 border-t border-border-color pt-4 md:grid-cols-[1.4fr_1fr_auto] md:items-start">
                <div>
                  <p className="text-body-sm text-neutral-muted">Classes</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {activeClasses.map((item) => <span key={item.id} className="rounded-full border border-primary bg-primary-light px-3 py-1 text-body-sm">{item.name}</span>)}
                    {activeClasses.length === 0 && <span className="rounded-full bg-warm-soft px-3 py-1 text-body-sm text-primary">No active class</span>}
                    {inactiveClasses.map((item) => <span key={"inactive-" + item.id} className="text-body-sm text-neutral-muted">Removed from {item.name}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-body-sm text-neutral-muted">Primary guardian</p>
                  {student.primaryGuardian ? <p className="mt-1 text-body">{student.primaryGuardian.fullName} · {student.primaryGuardian.phone}</p> : <p className="mt-1 text-neutral-muted">No guardian yet</p>}
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Link href={"/teacher/students/" + student.id} className="rounded-[var(--radius-md)] border border-border-color px-4 py-2 text-body-sm font-bold hover:bg-background-app">View</Link>
                  <Link href={"/teacher/students/" + student.id + "?edit=1"} className="rounded-[var(--radius-md)] border border-border-color px-4 py-2 text-body-sm font-bold hover:bg-background-app">Edit</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
