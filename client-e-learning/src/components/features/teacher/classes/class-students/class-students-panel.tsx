"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBanner, RegionState } from "@/components/feedback";
import { ClassStudentsTable } from "./class-students-table";
import { AddStudentDialog } from "./add-student-dialog";
import { RemoveStudentDialog } from "./remove-student-dialog";
import { TransferStudentDialog } from "./transfer-student-dialog";
import { useClassStudents } from "./use-class-students";
import type { TargetClassOption } from "./types";
import type { StudentSummary } from "@/types/teacher/student";

export function ClassStudentsPanel({ classId }: { classId: number }) {
  const t = useTranslations("teacher.classes.classStudents");
  const tRoot = useTranslations("teacher.classes");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addOpen, setAddOpen] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<StudentSummary | null>(
    null,
  );
  const [transferringStudent, setTransferringStudent] =
    useState<StudentSummary | null>(null);

  const {
    membersQuery,
    availableStudentsQuery,
    classesQuery,
    addMutation,
    transferMutation,
    removeMutation,
  } = useClassStudents(classId, { search, page, pageSize });

  const membersPage = membersQuery.data?.data;
  const members = membersPage?.items ?? [];
  const currentClass = classesQuery.data?.data?.find(
    (item) => item.id === classId,
  );
  const availableClasses: TargetClassOption[] = (classesQuery.data?.data ?? [])
    .filter((item) => item.id !== classId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      gradeName: item.grade?.name,
      academicYear: item.academicYear,
    }));
  const availableStudents = availableStudentsQuery.data?.data?.items ?? [];
  const mutationError =
    addMutation.isError || transferMutation.isError || removeMutation.isError;

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form className="relative max-w-md flex-1" onSubmit={applySearch}>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("search")}
            className="h-10 bg-background pl-9 text-sm"
          />
        </form>
        <Button
          type="button"
          onClick={() => setAddOpen(true)}
          className="h-10 gap-2 font-bold shadow-sm"
        >
          <UserPlus className="size-4" />
          {t("addStudent")}
        </Button>
      </div>

      {mutationError ? (
        <PageBanner tone="error" message={t("membershipError")} />
      ) : null}

      <ClassStudentsTable
        students={members}
        isLoading={membersQuery.isLoading}
        error={
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
        onView={(student) => window.open(`/teacher/students/${student.id}`, "_blank")}
        onTransfer={setTransferringStudent}
        onRemove={setRemovingStudent}
        removePending={removeMutation.isPending}
        pagination={{
          page: membersPage?.page ?? page,
          totalPages: membersPage?.totalPages ?? 0,
          totalElements: membersPage?.totalElements ?? 0,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />

      <AddStudentDialog
        open={addOpen}
        className={currentClass?.name}
        students={availableStudents}
        isLoading={availableStudentsQuery.isLoading}
        isError={availableStudentsQuery.isError}
        isAdding={addMutation.isPending}
        onClose={() => setAddOpen(false)}
        onAdd={(studentId) =>
          addMutation.mutate(studentId, {
            onSuccess: () => setAddOpen(false),
          })
        }
      />

      <RemoveStudentDialog
        student={removingStudent}
        className={currentClass?.name}
        isRemoving={removeMutation.isPending}
        onClose={() => setRemovingStudent(null)}
        onRemove={(studentId) => {
          removeMutation.mutate(studentId, {
            onSuccess: () => setRemovingStudent(null),
          });
        }}
      />

      <TransferStudentDialog
        student={transferringStudent}
        currentClassId={classId}
        currentClassName={currentClass?.name}
        availableClasses={availableClasses}
        isTransferring={transferMutation.isPending}
        onClose={() => setTransferringStudent(null)}
        onTransfer={async (studentId, targetClassId) => {
          await transferMutation.mutateAsync({ studentId, targetClassId });
        }}
      />
    </div>
  );
}
