import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { UnitCover, unitLabel } from "./unit-cover";

describe("UnitCover — Student illustrated cover fallback", () => {
  it("extracts compact labels from Grade 7 seed Unit codes", () => {
    expect(unitLabel("G7-SEED-U03")).toBe("03");
    expect(unitLabel("UNIT-12")).toBe("12");
    expect(unitLabel(3)).toBe("03");
    expect(unitLabel("CUSTOM")).toBe("CUSTOM");
  });

  it("renders a complete decorative notebook illustration when cover is missing", () => {
    const html = renderToStaticMarkup(
      <UnitCover label="03" name="Community Service" variant="hero" className="h-44" />,
    );
    expect(html).toContain("student-unit-cover-illustrated");
    expect(html).toContain('data-cover-tone="sage"');
    expect(html).toContain('data-cover-variant="hero"');
    expect(html).toContain("student-unit-cover-notebook");
    expect(html).toContain(">03</span>");
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<img");
  });

  it("chooses stable distinct palettes for adjacent units", () => {
    const first = renderToStaticMarkup(<UnitCover label="01" name="Hobbies" />);
    const second = renderToStaticMarkup(<UnitCover label="02" name="Healthy Living" />);
    expect(first).toContain('data-cover-tone="clay"');
    expect(second).toContain('data-cover-tone="denim"');
    expect(first).toContain("student-unit-cover-notebook");
    expect(second).toContain("student-unit-cover-notebook");
  });
});
