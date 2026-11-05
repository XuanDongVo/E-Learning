"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";
import { StatusBadge } from "@/components/ui/status-badge";
import { getInitials } from "@/utils/format";
import type { StudentSummary } from "@/types/teacher/student";

export function AddStudentDialog({
  open,
  className,
  students,
  isLoading,
  isError,
  isAdding,
  onClose,
  onAdd,
}: {
  open: boolean;
  className?: string;
  students: StudentSummary[];
  isLoading: boolean;
  isError: boolean;
  isAdding: boolean;
  onClose: () => void;
  onAdd: (studentId: number) => void;
}) {
  const t = useTranslations("teacher.classes.classStudents");

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            {t("addTitle", { className: className ?? "" })}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("addDescription")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <SkeletonList count={5} />
        ) : isError ? (
          <RegionState variant="error" description={t("loadErrorDescription")} />
        ) : students.length === 0 ? (
          <RegionState variant="empty" description={t("addEmpty")} />
        ) : (
          <div className="max-h-[380px] divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-extrabold text-primary">
                    {getInitials(student.fullName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">
                      {student.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <StatusBadge
                    status={
                      student.accountStatus === "ACTIVE" ? "ACTIVE" : "INACTIVE"
                    }
                    label={
                      student.accountStatus === "ACTIVE"
                        ? t("statusActive")
                        : t("statusLocked")
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={isAdding}
                    onClick={() => onAdd(student.id)}
                  >
                    {t("add")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
