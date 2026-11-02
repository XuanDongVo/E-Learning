"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AttemptLifecycleStatus,
  DeadlineState,
} from "@/types/assignment-analysis";

export interface StudentsFilterState {
  search: string;
  lifecycleStatus: AttemptLifecycleStatus | "ALL";
  deadlineState: DeadlineState | "ALL";
  classId: number | null;
}

export function StudentsFilters({
  value,
  onChange,
  classes,
}: {
  value: StudentsFilterState;
  onChange: (next: StudentsFilterState) => void;
  classes: { id: number; name: string }[];
}) {
  const t = useTranslations("teacher.analytics.students");

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        placeholder={t("searchPlaceholder")}
        className="max-w-xs"
      />
      <Select
        value={value.lifecycleStatus}
        onValueChange={(v) =>
          onChange({ ...value, lifecycleStatus: v as StudentsFilterState["lifecycleStatus"] })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("lifecycle")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("all")}</SelectItem>
          <SelectItem value="NOT_STARTED">{t("status.NOT_STARTED")}</SelectItem>
          <SelectItem value="IN_PROGRESS">{t("status.IN_PROGRESS")}</SelectItem>
          <SelectItem value="SUBMITTED">{t("status.SUBMITTED")}</SelectItem>
          <SelectItem value="TIMED_OUT">{t("status.TIMED_OUT")}</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={value.deadlineState}
        onValueChange={(v) =>
          onChange({ ...value, deadlineState: v as StudentsFilterState["deadlineState"] })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("deadline")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("all")}</SelectItem>
          <SelectItem value="ON_TIME">{t("deadlineState.ON_TIME")}</SelectItem>
          <SelectItem value="LATE">{t("deadlineState.LATE")}</SelectItem>
          <SelectItem value="OVERDUE">{t("deadlineState.OVERDUE")}</SelectItem>
        </SelectContent>
      </Select>
      {classes.length > 1 ? (
        <Select
          value={value.classId == null ? "ALL" : String(value.classId)}
          onValueChange={(v) =>
            onChange({ ...value, classId: v === "ALL" ? null : Number(v) })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("class")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allClasses")}</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
