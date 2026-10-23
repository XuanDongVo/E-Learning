import { describe, expect, it } from "vitest";
import {
  AppError,
  appErrorMessageKey,
  getAppErrorMessage,
  toAppError,
} from "./app-error";

describe("AppError", () => {
  it("preserves code, HTTP status, details, and source", () => {
    const error = new AppError({
      code: "VALIDATION_FAILED",
      message: "[VALIDATION_FAILED] invalid input",
      status: 400,
      details: { fieldErrors: [{ field: "email", code: "INVALID_FORMAT" }] },
      source: "api",
    });

    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ fieldErrors: [{ field: "email", code: "INVALID_FORMAT" }] });
    expect(error.source).toBe("api");
  });

  it("normalizes legacy Error objects without throwing", () => {
    const error = toAppError(new Error("legacy failure"));
    expect(error.code).toBe("UNKNOWN_ERROR");
    expect(error.message).toBe("legacy failure");
    expect(error.source).toBe("unknown");
  });

  it("resolves stable codes to message keys by category", () => {
    expect(appErrorMessageKey("AUTHENTICATION_FAILED")).toBe("authentication");
    expect(appErrorMessageKey("CLASS_NOT_FOUND")).toBe("notFound");
    expect(appErrorMessageKey("ASSIGNMENT_NOT_READY")).toBe("conflict");
    expect(appErrorMessageKey("HTTP_502")).toBe("server");
  });

  it("uses code-based localized copy when available", () => {
    const error = new AppError({
      code: "CLASS_NOT_FOUND",
      message: "[CLASS_NOT_FOUND] Class not found",
      status: 404,
      source: "api",
    });
    const translate = (key: string) => key === "classNotFound" ? "Không tìm thấy lớp học." : key;
    expect(getAppErrorMessage(error, translate)).toBe("Không tìm thấy lớp học.");
  });
});
