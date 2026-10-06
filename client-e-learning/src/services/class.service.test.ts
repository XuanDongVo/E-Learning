import { describe, expect, it, vi } from "vitest";
import { request } from "@/services/api.service";
import { classService } from "./class.service";

vi.mock("@/services/api.service", () => ({ request: vi.fn() }));
const mockedRequest = vi.mocked(request);

describe("classService", () => {
  it("updates a class with PUT", async () => {
    mockedRequest.mockResolvedValue({ data: null } as never);
    await classService.update(7, { name: "6A", gradeId: 6, academicYear: "2026 - 2027" });
    expect(mockedRequest).toHaveBeenCalledWith("/v1/classes/7", {
      method: "PUT",
      body: JSON.stringify({ name: "6A", gradeId: 6, academicYear: "2026 - 2027" }),
    });
  });

  it("archives a class with PATCH", async () => {
    mockedRequest.mockResolvedValue({ data: null } as never);
    await classService.archive(7);
    expect(mockedRequest).toHaveBeenCalledWith("/v1/classes/7/archive", { method: "PATCH" });
  });
});
