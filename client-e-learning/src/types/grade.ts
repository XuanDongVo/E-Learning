export interface Grade {
  id: number;
  code: string;
  name: string;
  displayOrder: number;
  status?: "ACTIVE" | "INACTIVE";
}

export interface CreateGradeRequest {
  code: string;
  name: string;
  displayOrder: number;
}