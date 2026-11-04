"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Eye, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table/data-table";
import { Input } from "@/components/ui/input";
import { SkeletonTable } from "@/components/ui/skeleton/skeleton-table";
import { classService } from "@/services/class.service";
import { teacherStudentService } from "@/services/teacher/student.service";
import type { StudentSummary } from "@/types/student";
import { getInitials } from "@/utils/format";

export function ClassStudentsPanel({ classId }: { classId: number }) {
  const t = useTranslations("teacher.classes.classStudents");
  const tRoot = useTranslations("teacher.classes");
  const qc = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [transferStudent, setTransferStudent] = useState<StudentSummary | null>(
    null,
  );
  const [targetClassId, setTargetClassId] = useState<string>("");

  const membersQuery = useQuery({
    queryKey: ["class-members", classId, search, page, pageSize],
    queryFn: async () => {
      const res = await teacherStudentService.listClassMembers(classId, {
        search: search || undefined,
        page,
        size: pageSize,
      });
      return res.data;
    },
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "for-class-add"],
    queryFn: async () =>
      (await teacherStudentService.list({ size: 100 })).data?.items ?? [],
  });

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await classService.list()).data ?? [],
  });

  const className = classesQuery.data?.find((c) => c.id === classId)?.name;

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["class-members", classId] });
    void qc.invalidateQueries({ queryKey: ["class", classId] });
    void qc.invalidateQueries({ queryKey: ["students"] });
  };

  const add = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.addToClass(classId, { studentId }),
    onSuccess: refresh,
  });

  const transfer = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.transferToClass(classId, studentId),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.removeFromClass(classId, studentId),
    onSuccess: refresh,
  });

  const pageData = membersQuery.data;
  const members = pageData?.items ?? [];

  const available = (studentsQuery.data ?? []).filter(
    (s) => !s.classes?.some((c) => c.id === classId && c.status === "ACTIVE"),
  );

  const handleEnrollmentChange = (studentId: number) => {
    const selected = available.find((s) => s.id === studentId);
    if (!selected) return;

    const activeClass = selected.classes?.find((m) => m.status === "ACTIVE");

    if (activeClass) {
      const ok = window.confirm(
        t("transferConfirm", {
          studentName: selected.fullName,
          oldClass: activeClass.name,
          newClass: className ?? "",
        }),
      );
      if (ok) transfer.mutate(studentId);
      return;
    }

    add.mutate(studentId);
  };

  const pending = add.isPending || transfer.isPending || remove.isPending;

  const columns: DataTableColumn<StudentSummary>[] = [
    {
      id: "student",
      header: t("columnStudent"),
      cell: (s) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
            {getInitials(s.fullName)}
          </span>
          <div>
            <p className="text-sm font-extrabold text-foreground">
              {s.fullName}
            </p>
            <p className="text-[11px] text-muted-foreground">ID: #{s.id}</p>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: t("columnEmail"),
      cell: (s) => (
        <span className="font-medium text-muted-foreground">{s.email}</span>
      ),
    },
    {
      id: "phone",
      header: t("columnPhone"),
      cell: (s) => (
        <span className="font-medium text-muted-foreground">
          {s.phone || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: t("columnStatus"),
      cell: (s) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
            s.accountStatus === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {s.accountStatus === "ACTIVE" ? t("statusActive") : t("statusLocked")}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("columnActions"),
      align: "right",
      cell: (s) => (
        <TooltipProvider delay={200}>
          <div className="flex items-center justify-end gap-1">
            {/* Xem */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      // TODO: xem chi tiết
                    }}
                  />
                }
              >
                <Eye className="size-4" />
                <span className="sr-only">Xem</span>
              </TooltipTrigger>
              <TooltipContent side="top">Xem</TooltipContent>
            </Tooltip>

            {/* Chuyển lớp */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setTransferStudent(s);
                      setTargetClassId("");
                    }}
                  />
                }
              >
                <ArrowLeftRight className="size-4" />
                <span className="sr-only">Chuyển lớp</span>
              </TooltipTrigger>
              <TooltipContent side="top">Chuyển lớp</TooltipContent>
            </Tooltip>

            {/* Xóa */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={remove.isPending}
                    className="size-8 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                    onClick={() => {
                      if (
                        window.confirm(
                          t("removeConfirm", { studentName: s.fullName }),
                        )
                      ) {
                        remove.mutate(s.id);
                      }
                    }}
                  />
                }
              >
                <Trash2 className="size-4" />
                <span className="sr-only">{t("remove")}</span>
              </TooltipTrigger>
              <TooltipContent side="top">{t("remove")}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form
          className="relative max-w-md flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("search")}
            className="h-10 bg-background pl-9 text-sm"
          />
        </form>

        <select
          aria-label={t("ariaAddTransfer")}
          value=""
          disabled={pending}
          onChange={(e) => {
            if (e.target.value) handleEnrollmentChange(Number(e.target.value));
            e.target.value = "";
          }}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:w-72"
        >
          <option value="">{t("addOrTransfer")}</option>
          {available.map((s) => {
            const active = s.classes?.find((m) => m.status === "ACTIVE");
            return (
              <option key={s.id} value={s.id}>
                {s.fullName}
                {active ? t("transferFrom", { className: active.name }) : ""}
              </option>
            );
          })}
        </select>
      </div>

      {(add.isError || transfer.isError || remove.isError) && (
        <p role="alert" className="text-sm text-destructive">
          {t("membershipError")}
        </p>
      )}

      <DataTable
        data={members}
        columns={columns}
        getRowKey={(s) => s.id}
        isLoading={membersQuery.isLoading}
        loadingState={<SkeletonTable columns={5} />}
        emptyState={
          <RegionState
            variant="empty"
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
        errorState={
          membersQuery.isError ? (
            <RegionState
              variant="error"
              title={t("loadErrorTitle")}
              description={t("loadErrorDescription")}
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void membersQuery.refetch()}
                >
                  {tRoot("retry")}
                </Button>
              }
            />
          ) : undefined
        }
        pagination={{
          page: pageData?.page ?? page,
          totalPages: pageData?.totalPages ?? 0,
          totalElements: pageData?.totalElements ?? 0,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    </div>
  );
}
