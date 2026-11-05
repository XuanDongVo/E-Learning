import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/services/class.service";
import { teacherStudentService } from "@/services/teacher/student.service";

export function useClassStudents(
  classId: number,
  params: { search?: string; page: number; pageSize: number },
) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["class-members", classId, params.search, params.page, params.pageSize],
    queryFn: () =>
      teacherStudentService.listClassMembers(classId, {
        search: params.search,
        page: params.page,
        size: params.pageSize,
      }),
  });

  const availableStudentsQuery = useQuery({
    queryKey: ["students", "without-active-class"],
    queryFn: () =>
      teacherStudentService.list({
        noClass: true,
        page: 1,
        size: 100,
      }),
  });

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => classService.list(),
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["class-members", classId] }),
      queryClient.invalidateQueries({ queryKey: ["class", classId] }),
      queryClient.invalidateQueries({ queryKey: ["students"] }),
    ]);
  };

  const addMutation = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.addToClass(classId, { studentId }),
    onSuccess: refresh,
  });

  const transferMutation = useMutation({
    mutationFn: ({
      studentId,
      targetClassId,
    }: {
      studentId: number;
      targetClassId: number;
    }) => teacherStudentService.transferToClass(targetClassId, studentId),
    onSuccess: refresh,
  });

  const removeMutation = useMutation({
    mutationFn: (studentId: number) =>
      teacherStudentService.removeFromClass(classId, studentId),
    onSuccess: refresh,
  });

  return {
    membersQuery,
    availableStudentsQuery,
    classesQuery,
    addMutation,
    transferMutation,
    removeMutation,
  };
}
