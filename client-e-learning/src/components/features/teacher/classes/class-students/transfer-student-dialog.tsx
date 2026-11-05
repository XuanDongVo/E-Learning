"use client";

import { useState } from "react";
import { AlertCircle, ArrowRightLeft, School } from "lucide-react";
import { useTranslations } from "next-intl";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StudentSummary } from "@/types/teacher/student";
import type { TargetClassOption } from "./types";

export function TransferStudentDialog({
  student,
  currentClassId,
  currentClassName,
  availableClasses,
  isTransferring,
  onClose,
  onTransfer,
}: {
  student: StudentSummary | null;
  currentClassId: number;
  currentClassName?: string;
  availableClasses: TargetClassOption[];
  isTransferring: boolean;
  onClose: () => void;
  onTransfer: (studentId: number, targetClassId: number) => Promise<void>;
}) {
  const t = useTranslations("teacher.classes.classStudents");
  const [targetClassId, setTargetClassId] = useState("");
  const eligibleClasses = availableClasses.filter(
    (item) => item.id !== currentClassId,
  );

  const close = () => {
    setTargetClassId("");
    onClose();
  };

  const confirm = async () => {
    if (!student || !targetClassId) return;
    await onTransfer(student.id, Number(targetClassId));
    close();
  };

  return (
    <AlertDialog
      open={student !== null}
      onOpenChange={(open) => !open && close()}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10">
              <ArrowRightLeft className="size-4" />
            </span>
            <AlertDialogTitle className="text-lg font-bold">
              {t("transferTitle")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t("transferDescription", {
              studentName: student?.fullName ?? "",
              className: currentClassName ?? "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{t("transferNotice")}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("targetClass")}
            </label>
            <Select value={targetClassId} onValueChange={setTargetClassId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={t("targetClassPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {eligibleClasses.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    {t("noTargetClass")}
                  </div>
                ) : (
                  eligibleClasses.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      <div className="flex items-center gap-2">
                        <School className="size-3.5 text-muted-foreground" />
                        <span>{item.name}</span>
                        {(item.gradeName || item.academicYear) && (
                          <span className="text-xs text-muted-foreground">
                            ({[item.gradeName, item.academicYear].filter(Boolean).join(" · ")})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isTransferring} onClick={close}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!targetClassId || isTransferring}
            onClick={(event) => {
              event.preventDefault();
              void confirm();
            }}
          >
            {isTransferring ? t("transferring") : t("confirmTransfer")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
