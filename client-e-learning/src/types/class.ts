export interface Class {
  id: number;
  name: string;
  grade: number;
  academicYear: string;
  studentCount: number;
}

export interface CreateClassRequest {
  name: string;
  grade: number;
  academicYear: string;
}