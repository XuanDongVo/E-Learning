import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentPageHeading } from "./student-page-heading";
import { StudentCollectionPanel } from "./student-collection-panel";

describe("Student page patterns", () => {
  it("renders one page title with optional slots, without forcing a decorative hero", () => {
    const minimal = renderToStaticMarkup(<StudentPageHeading title="Lịch sử học tập" />);
    expect(minimal.match(/<h1\b/g)).toHaveLength(1);
    expect(minimal).not.toContain("student-washi");
    const complete = renderToStaticMarkup(
      <StudentPageHeading eyebrow="Unit 01" title="Từ vựng" description="Danh sách từ"
        artwork={<span aria-hidden="true">visual</span>}
        actions={<button type="button">Ôn tập</button>} />,
    );
    expect(complete).toContain("visual");
    expect(complete).toContain("Ôn tập");
    expect(complete).toContain("Danh sách từ");
  });

  it("preserves independent toolbar, results and pagination composition", () => {
    const html = renderToStaticMarkup(
      <StudentCollectionPanel toolbar={<label>Filter</label>}
        footer={<nav aria-label="Pagination">Next</nav>}>
        <ul><li>Result</li></ul>
      </StudentCollectionPanel>,
    );
    expect(html).toContain("<section");
    expect(html).toContain("border-dashed");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("<label>Filter</label>");
    expect(html).toContain("<li>Result</li>");
    expect(html).toContain('aria-label="Pagination"');
  });

  it("allows collection layout without filters or separator", () => {
    const html = renderToStaticMarkup(
      <StudentCollectionPanel separator={false} ariaLive="off">Simple content</StudentCollectionPanel>,
    );
    expect(html).not.toContain("border-dashed");
    expect(html).toContain('aria-live="off"');
  });
});
