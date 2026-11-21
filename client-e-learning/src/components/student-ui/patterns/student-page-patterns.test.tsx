import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentPageHeading } from "./student-page-heading";
import { StudentCollectionPanel } from "./student-collection-panel";

describe("Student page patterns", () => {
  it("renders one page title with optional slots, without forcing a decorative hero", () => {
    const minimal = renderToStaticMarkup(<StudentPageHeading title="Lịch sử học tập" />);
    expect(minimal.match(/<h1\b/g)).toHaveLength(1);
    expect(minimal).not.toContain("student-washi");
    const embedded = renderToStaticMarkup(<StudentPageHeading as="h3" title="In the lab" />);
    expect(embedded).not.toContain("<h1");
    expect(embedded).toContain("<h3");
    const complete = renderToStaticMarkup(
      <StudentPageHeading eyebrow="Unit 01" title="Từ vựng" description="Danh sách từ"
        artwork={<span aria-hidden="true">visual</span>}
        actions={<button type="button">Ôn tập</button>} />,
    );
    expect(complete).toContain("visual");
    expect(complete).toContain("Ôn tập");
    expect(complete).toContain("Danh sách từ");
  });

  it("keeps a text-only page heading lightweight and semantically correct", () => {
    const html = renderToStaticMarkup(
      <StudentPageHeading title="Bài học của bạn" description="Xem kiến thức trước khi luyện tập." />,
    );
    expect(html.match(/<h1\\b/g)).toHaveLength(1);
    expect(html).toContain("student-page-heading__title");
    expect(html).toContain("student-page-heading__description");
    expect(html).toContain('data-heading-level="h1"');
    expect(html).not.toContain("student-page-heading__artwork");
    expect(html).not.toContain("student-page-heading__actions");
    expect(html).not.toContain("student-paper");
  });

  it("honors nested heading levels, caller layout classes and action slots", () => {
    const html = renderToStaticMarkup(
      <StudentPageHeading
        as="h3"
        title="Các chuyên đề"
        eyebrow={<span><strong>UNIT 03</strong> · GRAMMAR</span>}
        actions={<a href="#practice">Luyện tập</a>}
        artwork={<span aria-hidden="true">Pipo</span>}
        artworkClassName="hidden sm:block"
        contentClassName="max-w-xl"
        className="gap-5"
      />,
    );
    expect(html).toContain('<h3 class="student-handwriting');
    expect(html).toContain('data-heading-level="h3"');
    expect(html).toContain('data-has-artwork="true"');
    expect(html).toContain("student-page-heading__eyebrow");
    expect(html).toContain("student-page-heading__actions");
    expect(html).toContain('href="#practice"');
    expect(html).toContain("hidden sm:block");
    expect(html).toContain("max-w-xl");
    expect(html).toContain("gap-5");
    expect(html).not.toContain("<h1");
  });

  it("preserves independent toolbar, results and pagination composition", () => {
    const html = renderToStaticMarkup(
      <StudentCollectionPanel toolbar={<label>Filter</label>} ariaLive="polite"
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
