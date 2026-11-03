"use client";
import type { StudentDetailViewProps } from "@/types/student";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { FullPageState } from "@/components/feedback";
export function StudentDetailView({ studentId }: StudentDetailViewProps) {
  const q = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.get(studentId),
  });
  if (q.isLoading) return <FullPageState variant="loading" />;
  if (q.isError || !q.data?.data)
    return <FullPageState variant="error" />;
  const s = q.data.data;
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/students"
          className="text-body-sm font-bold text-primary"
        >
          ← Students
        </Link>
        <h1 className="mt-2 text-ui-3xl font-extrabold">{s.fullName}</h1>
        <p className="mt-1 text-neutral-muted">{s.email}</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-md border border-border-color bg-card-bg p-5">
          <h2 className="font-extrabold">Personal information</h2>
          <dl className="mt-4 space-y-3 text-body">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-muted">Date of birth</dt>
              <dd>{s.dateOfBirth || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-muted">Gender</dt>
              <dd>{s.gender || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-muted">Phone</dt>
              <dd>{s.phone || "—"}</dd>
            </div>
          </dl>
        </article>
        <article className="rounded-md border border-border-color bg-card-bg p-5">
          <h2 className="font-extrabold">Class</h2>
          <dl className="mt-4 space-y-3 text-body">
            <div className="flex justify-between">
              <dt className="text-neutral-muted">Class</dt>
              <dd>{s.className || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-muted">Membership</dt>
              <dd>{s.classStatus || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-muted">Account</dt>
              <dd>{s.accountStatus}</dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="rounded-md border border-border-color bg-card-bg p-5">
        <h2 className="font-extrabold">Guardian</h2>
        {s.guardians.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {s.guardians.map((g) => (
              <div
                key={g.id}
                className="rounded-md border border-border-color p-4"
              >
                <p className="font-bold">
                  {g.fullName}
                  {g.primary ? " · Primary" : ""}
                </p>
                <p className="text-body-sm text-neutral-muted">
                  {g.relationship}
                </p>
                <p className="mt-2">{g.phone}</p>
                {g.email && (
                  <p className="text-body-sm text-neutral-muted">{g.email}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-neutral-muted">No guardian information.</p>
        )}
      </section>
    </div>
  );
}
