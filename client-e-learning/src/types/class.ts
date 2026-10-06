export type ClassStatus = "ACTIVE" | "ARCHIVED";

export interface Class {
  id: number;
  name: string;
  grade: { id: number; code: string; name: string; displayOrder: number };
  academicYear: string;
  studentCount: number;
  status: ClassStatus;
}

export interface CreateClassRequest {
  name: string;
  gradeId: number;
  academicYear: string;
}

export interface UpdateClassRequest {
  name: string;
  gradeId: number;
  academicYear: string;
}

export interface ClassCardProps {
  classItem: Class;
  onEdit: (classItem: Class) => void;
  onArchive: (classItem: Class) => void;
}
