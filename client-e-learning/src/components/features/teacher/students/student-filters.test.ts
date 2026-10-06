import { describe, expect, it } from "vitest";
import { filterStudents } from "./student-filters";

const students = [
  {
    id: 1, fullName: "Alice Nguyen", email: "alice@test.com", phone: "0901",
    classes: [{ id: 1, name: "6A", gradeId: 6, gradeName: "Grade 6", academicYear: "2026 - 2027", status: "ACTIVE" as const }],
    primaryGuardian: null, accountStatus: "ACTIVE" as const,
  },
  {
    id: 2, fullName: "Bob Tran", email: "bob@test.com", phone: "0902",
    classes: [{ id: 2, name: "6B", gradeId: 6, gradeName: "Grade 6", academicYear: "2026 - 2027", status: "INACTIVE" as const }],
    primaryGuardian: null, accountStatus: "INACTIVE" as const,
  },
  {
    id: 3, fullName: "Chi Le", email: "chi@test.com", phone: null,
    classes: [], primaryGuardian: null, accountStatus: "ACTIVE" as const,
  },
];

describe("filterStudents", () => {
  it("returns all students with default filters", () => {
    expect(filterStudents(students, "", "all")).toHaveLength(3);
  });
  it("filters name, email and phone", () => {
    expect(filterStudents(students, "alice", "all")[0].id).toBe(1);
    expect(filterStudents(students, "bob@test", "all")[0].id).toBe(2);
    expect(filterStudents(students, "0902", "all")[0].id).toBe(2);
  });
  it("filters account status", () => {
    expect(filterStudents(students, "", "INACTIVE")[0].id).toBe(2);
  });
  it("filters active class", () => {
    expect(filterStudents(students, "", "all", "1")[0].id).toBe(1);
  });
  it("filters grade", () => {
    expect(filterStudents(students, "", "all", "all", "6")).toHaveLength(1);
  });
  it("finds students with no active class", () => {
    expect(filterStudents(students, "", "all", "all", "all", true).map((item) => item.id)).toEqual([2, 3]);
  });
});
