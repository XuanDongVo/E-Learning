import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentMascotScene } from "./student-mascot-scene";

describe("StudentMascotScene", () => {
  it("shows a readable guide message while treating Pipo art as decorative", () => {
    const html = renderToStaticMarkup(
      <StudentMascotScene variant="guide" mood="wave" prop="book"
        message="Cùng xem bài học nhé!" />,
    );
    expect(html).toContain('data-mascot-variant="guide"');
    expect(html).toContain("Cùng xem bài học nhé!");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("student-mascot-scene__message");
  });

  it("renders a silent sticker without fake accessible speech", () => {
    const html = renderToStaticMarkup(
      <StudentMascotScene variant="guide" presentation="sticker"
        message="Không được đọc lời thoại từ một sticker trang trí" />,
    );
    expect(html).toContain('data-mascot-presentation="sticker"');
    expect(html).not.toContain("Không được đọc lời thoại");
    expect(html).not.toContain("student-mascot-scene__message");
  });

  it("reserves milestone treatment for an explicit milestone variant", () => {
    const feedback = renderToStaticMarkup(
      <StudentMascotScene variant="feedback" mood="think" message="Hãy thử lại." />,
    );
    const milestone = renderToStaticMarkup(
      <StudentMascotScene variant="milestone" mood="celebrate" prop="badge"
        message="Đã lên Level 3!" />,
    );
    expect(feedback).toContain('data-mascot-variant="feedback"');
    expect(milestone).toContain('data-mascot-variant="milestone"');
    expect(milestone).toContain("Đã lên Level 3!");
    expect(feedback).not.toContain('data-mascot-variant="milestone"');
  });
});
