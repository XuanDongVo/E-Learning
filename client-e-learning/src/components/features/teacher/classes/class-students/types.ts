import type { StudentSummary } from "@/types/teacher/student";
import type { DataTablePagination } from "@/components/ui/data-table/data-table";

export interface TargetClassOption {
  id: number;
  name: string;
  gradeName?: string;
  academicYear?: string;
}

export interface ClassStudentsTableProps {
  students: StudentSummary[];
  isLoading: boolean;
  error?: React.ReactNode;
  pagination?: DataTablePagination;
  onView: (student: StudentSummary) => void;
  onTransfer: (student: StudentSummary) => void;
  onRemove: (student: StudentSummary) => void;
  removePending: boolean;
}
