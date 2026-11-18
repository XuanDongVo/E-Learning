import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { PaperSurface } from "./paper-surface";
import { StudentButton } from "./student-button";
import { StudentTextField } from "./student-text-field";

describe("Student Design System v2 foundations", () => {
  it("keeps paper material independent from visual importance", () => {
    const content = renderToStaticMarkup(
      <PaperSurface variant="kraft">Quiet content</PaperSurface>,
    );
    const feature = renderToStaticMarkup(
      <PaperSurface as="section" variant="kraft" emphasis="feature" tape>
        Header
      </PaperSurface>,
    );
    expect(content).toContain("student-paper--kraft");
    expect(content).toContain("student-paper--content");
    expect(feature).toContain("student-paper--feature");
    expect(feature).toContain("student-washi");
    expect(feature).toContain("<section");
  });

  it("sets correct native loading and disabled semantics", () => {
    const html = renderToStaticMarkup(
      <StudentButton variant="action" loading>Đang tải</StudentButton>,
    );
    expect(html).toContain('type="button"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("student-control--action");
  });

  it("links labels, helper text and errors with icon padding", () => {
    const html = renderToStaticMarkup(
      createElement(StudentTextField, {
        id: "word-search", label: "Tìm từ",
        leading: createElement("span", null, "⌕"),
        hint: "Nhập từ khóa", error: "Từ khóa không hợp lệ",
      }),
    );
    expect(html).toContain('for="word-search"');
    expect(html).toContain('id="word-search"');
    expect(html).toContain("student-field--with-leading");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="word-search-hint word-search-error"');
    expect(html).toContain('role="alert"');
  });

  it("announces a successful field without relying on color alone", () => {
    const html = renderToStaticMarkup(
      createElement(StudentTextField, {
        id: "saved-name",
        label: "Tên hiển thị",
        defaultValue: "Mai",
        success: "Đã lưu thay đổi",
      }),
    );
    expect(html).toContain('data-validation="success"');
    expect(html).toContain('aria-describedby="saved-name-success"');
    expect(html).toContain('id="saved-name-success"');
    expect(html).toContain('role="status"');
    expect(html).toContain("Đã lưu thay đổi");
  });
});
