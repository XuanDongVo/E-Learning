import { describe, expect, it, vi } from "vitest";
import { request } from "@/services/api.service";
import { studentService } from "./student.service";

vi.mock("@/services/api.service", () => ({ request: vi.fn() }));
const mockedRequest = vi.mocked(request);

describe("studentService", () => {
  it("lists teacher students from the management endpoint", async () => {
    mockedRequest.mockResolvedValue({ success: true, code: "SUCCESS", message: "ok", data: [] } as never);
    await studentService.list();
    expect(mockedRequest).toHaveBeenCalledWith("/v1/users/students");
  });
  it("updates student account status with PATCH", async () => {
    mockedRequest.mockResolvedValue({ success: true, code: "SUCCESS", message: "ok", data: null } as never);
    await studentService.updateStatus(2, { status: "INACTIVE" });
    expect(mockedRequest).toHaveBeenCalledWith("/v1/users/students/2/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "INACTIVE" }),
    });
  });
  it("updates the current student profile with PUT", async () => {
    mockedRequest.mockResolvedValue({ success: true, code: "SUCCESS", message: "ok", data: null } as never);
    await studentService.updateProfile({ fullName: "Updated" });
    expect(mockedRequest).toHaveBeenCalledWith("/v1/student/profile", {
      method: "PUT",
      body: JSON.stringify({ fullName: "Updated" }),
    });
  });
  it("removes a class member with DELETE", async () => {
    mockedRequest.mockResolvedValue({ success: true, code: "SUCCESS", message: "ok", data: null } as never);
    await studentService.removeFromClass(7, 2);
    expect(mockedRequest).toHaveBeenCalledWith("/v1/classes/7/members/2", { method: "DELETE" });
  });
});
