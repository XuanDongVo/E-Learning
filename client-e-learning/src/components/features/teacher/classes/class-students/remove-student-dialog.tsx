"use client";

import { useTranslations } from "next-intl";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { StudentSummary } from "@/types/teacher/student";

export function RemoveStudentDialog({
  student,
  className,
  isRemoving,
  onClose,
  onRemove,
}: {
  student: StudentSummary | null;
  className?: string;
  isRemoving: boolean;
  onClose: () => void;
  onRemove: (studentId: number) => void;
}) {
  const t = useTranslations("teacher.classes.classStudents");

  return (
    <AlertDialog
      open={student !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent className="sm:max-w-[460px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("removeTitle", {
              studentName: student?.fullName ?? "",
              className: className ?? "",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("removeDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving} onClick={onClose}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isRemoving || !student}
            onClick={() => student && onRemove(student.id)}
          >
            {isRemoving ? t("removing") : t("remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
