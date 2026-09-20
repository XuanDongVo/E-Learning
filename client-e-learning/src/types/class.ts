export interface Class {
  id: number;
  name: string;
  grade: {
    id: number;
    code: string;
    name: string;
  };
  academicYear: string;
  studentCount: number;
}

export interface CreateClassRequest {
  name: string;
  gradeId: number;
  academicYear: string;
}