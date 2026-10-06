"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { studentService } from "@/services/student.service";

interface StudentDetailModalProps {
  studentId: number;
  onClose: () => void;
}

export function StudentDetailModal({
  studentId,
  onClose,
}: StudentDetailModalProps) {
  const student = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => studentService.get(studentId),
  });
  const detail = student.data?.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-dark/30 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-lg)] bg-card-bg p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-body-sm font-extrabold uppercase tracking-[0.16em] text-primary">
              Student details
            </p>
            <h2 id="student-detail-title" className="mt-1 text-ui-2xl font-extrabold">
              {detail?.fullName ?? "Student information"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student details"
            className="rounded-full p-2 text-neutral-muted hover:bg-background-app"
          >
            <X className="size-5" />
          </button>
        </div>

        {student.isLoading && (
          <p className="mt-8 text-center text-neutral-muted">
            Loading student details...
          </p>
        )}
        {student.isError && (
          <p role="alert" className="mt-8 rounded-md bg-red-50 p-4 text-red-700">
            Unable to load student details.
          </p>
        )}
        {detail && (
          <div className="mt-6 space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <Detail label="Email" value={detail.email} />
              <Detail label="Phone" value={detail.phone || "No phone"} />
              <Detail label="Date of birth" value={detail.dateOfBirth || "Not provided"} />
              <Detail label="Gender" value={detail.gender || "Not provided"} />
            </section>
            <section className="rounded-[var(--radius-md)] border border-border-color p-4">
              <h3 className="font-extrabold">Class and account</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <Detail label="Class" value={detail.className || "No active class"} />
                <Detail label="Membership" value={detail.classStatus || "Not enrolled"} />
                <Detail
                  label="Account status"
                  value={detail.accountStatus === "ACTIVE" ? "Active" : "Locked"}
                />
              </dl>
            </section>
            <section>
              <h3 className="font-extrabold">Guardians</h3>
              {detail.guardians.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {detail.guardians.map((guardian) => (
                    <div
                      key={guardian.id}
                      className="rounded-[var(--radius-md)] border border-border-color p-4"
                    >
                      <p className="font-bold">
                        {guardian.fullName}
                        {guardian.primary ? " · Primary" : ""}
                      </p>
                      <p className="text-body-sm text-neutral-muted">
                        {guardian.relationship}
                      </p>
                      <p className="mt-2">{guardian.phone}</p>
                      {guardian.email && (
                        <p className="text-body-sm text-neutral-muted">
                          {guardian.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-neutral-muted">No guardian information.</p>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-body-sm text-neutral-muted">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}
