"use client";

import { useState } from "react";
import { BookOpen, Monitor, Search, Smartphone, Sparkles } from "lucide-react";
import { PaperSurface } from "./paper-surface";
import { ScrapbookHeading } from "./scrapbook-heading";
import { StudentButton, type StudentButtonVariant } from "./student-button";
import { StudentTextField } from "./student-text-field";
import { StudentDataList } from "./data-list/student-data-list";
import { StudentDataListItem } from "./data-list/student-data-list-item";
import { StudentVisualGallery } from "./visuals/student-visual-gallery";
import { StudentPatternsGallery } from "./patterns/student-patterns-gallery";

type ButtonState = "default" | "pressed" | "disabled" | "loading";
type PreviewViewport = "desktop" | "mobile";

const BUTTON_VARIANTS: Array<{ value: StudentButtonVariant; label: string }> = [
  { value: "action", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "quiet", label: "Quiet" },
  { value: "accent", label: "Accent" },
  { value: "danger", label: "Destructive" },
];

const BUTTON_STATES: Array<{ value: ButtonState; label: string }> = [
  { value: "default", label: "Default" },
  { value: "pressed", label: "Pressed" },
  { value: "disabled", label: "Disabled" },
  { value: "loading", label: "Loading" },
];

const TYPE_SPECIMENS = [
  { className: "student-page-title", sample: "Tiêu đề trang", token: ".student-page-title · 30/36px", use: "Một H1 ngắn, định hướng toàn trang." },
  { className: "student-section-title", sample: "Tiêu đề khu vực", token: ".student-section-title · 22px", use: "Chia nhịp nội dung lớn, không dùng cho nhãn nhỏ." },
  { className: "student-card-title", sample: "Tiêu đề nội dung", token: ".student-card-title · 18px", use: "Tên item, card hoặc nội dung cần scan nhanh." },
  { className: "student-body", sample: "Văn bản giao diện dễ đọc.", token: ".student-body · 15px", use: "Mô tả và hướng dẫn thao tác thông thường." },
  { className: "student-reading", sample: "Đoạn học liệu dài cần nhịp chữ thoáng.", token: ".student-reading · 16px", use: "Đoạn đọc dài và nội dung học tập." },
  { className: "student-label", sample: "Nhãn biểu mẫu", token: ".student-label · 14px", use: "Label, nhóm control và thông tin cần nhấn rõ." },
  { className: "student-meta", sample: "Metadata", token: ".student-meta · 13px", use: "Số lượng, thời gian và dữ liệu phụ ngắn." },
  { className: "student-caption", sample: "Chú thích", token: ".student-caption · 12px", use: "Helper text; không dùng cho nội dung chính." },
] as const;

/** Dev-only visual fixtures, never connected to Student accounts or APIs. */
export function StudentFoundationsLab() {
  const [search, setSearch] = useState("");
  const [pressCount, setPressCount] = useState(0);
  const [buttonVariant, setButtonVariant] = useState<StudentButtonVariant>("action");
  const [buttonState, setButtonState] = useState<ButtonState>("default");
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-10">
      <header className="max-w-3xl space-y-2">
        <p className="student-meta text-primary">Internal preview · Student UI v2</p>
        <ScrapbookHeading as="h1" className="student-page-title">Sổ tay giao diện Student</ScrapbookHeading>
        <p className="student-body text-muted-foreground">
          Workbench dành cho developer kiểm tra vai trò, trạng thái và khả năng truy cập; không phải dữ liệu học tập thật.
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="lab-surfaces">
        <div className="max-w-3xl space-y-1">
          <h2 id="lab-surfaces" className="student-section-title">Bề mặt và mức nhấn</h2>
          <p className="student-body text-muted-foreground">Content là mặc định. Feature chỉ dành cho một trọng tâm; Accent hỗ trợ ngữ cảnh.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <PaperSurface as="article" className="space-y-2 p-5">
            <h3 className="student-card-title">Content</h3>
            <p className="student-body">Nội dung đọc, danh sách và form. Viền nhẹ, không shadow mặc định.</p>
          </PaperSurface>
          <PaperSurface as="article" variant="kraft" emphasis="feature" className="space-y-2 p-5">
            <h3 className="student-card-title">Feature</h3>
            <p className="student-body">Một điểm nhấn có chủ đích. Không tự động cần washi hoặc viền quá mạnh.</p>
          </PaperSurface>
          <PaperSurface as="article" emphasis="accent" className="space-y-2 p-5">
            <h3 className="student-card-title">Accent</h3>
            <p className="student-body">Thông tin phụ hoặc trạng thái; không cạnh tranh với hành động chính.</p>
          </PaperSurface>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="lab-typography">
        <div className="max-w-3xl space-y-1">
          <h2 id="lab-typography" className="student-section-title">Typography theo chức năng đọc</h2>
          <p className="student-body text-muted-foreground">Mỗi role đi cùng token và tình huống sử dụng, thay vì chỉ là một cột chữ mẫu.</p>
        </div>
        <PaperSurface className="px-5 py-2">
          {TYPE_SPECIMENS.map((item) => (
            <div key={item.className} className="student-lab-token-row">
              <p className={item.className}>{item.sample}</p>
              <code className="student-meta text-primary">{item.token}</code>
              <p className="student-body text-muted-foreground">{item.use}</p>
            </div>
          ))}
        </PaperSurface>
      </section>

      <section className="space-y-3" aria-labelledby="lab-controls">
        <div className="max-w-3xl space-y-1">
          <h2 id="lab-controls" className="student-section-title">Button workbench</h2>
          <p className="student-body text-muted-foreground">So sánh variant, trạng thái và chiều rộng preview. Dùng phím Tab để kiểm tra focus ring.</p>
        </div>
        <PaperSurface className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="student-label">Variant</legend>
              <div className="flex flex-wrap gap-2">
                {BUTTON_VARIANTS.map((item) => (
                  <StudentButton key={item.value} size="compact" variant="quiet" aria-pressed={buttonVariant === item.value} onClick={() => setButtonVariant(item.value)}>
                    {item.label}
                  </StudentButton>
                ))}
              </div>
            </fieldset>
            <fieldset className="space-y-2">
              <legend className="student-label">State</legend>
              <div className="flex flex-wrap gap-2">
                {BUTTON_STATES.map((item) => (
                  <StudentButton key={item.value} size="compact" variant="quiet" aria-pressed={buttonState === item.value} onClick={() => setButtonState(item.value)}>
                    {item.label}
                  </StudentButton>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-border pt-4">
            <fieldset className="space-y-2">
              <legend className="student-label">Preview width</legend>
              <div className="flex flex-wrap gap-2">
                <StudentButton size="compact" variant="quiet" aria-pressed={viewport === "desktop"} onClick={() => setViewport("desktop")}>
                  <Monitor className="size-4" aria-hidden="true" /> Desktop
                </StudentButton>
                <StudentButton size="compact" variant="quiet" aria-pressed={viewport === "mobile"} onClick={() => setViewport("mobile")}>
                  <Smartphone className="size-4" aria-hidden="true" /> Mobile 390
                </StudentButton>
              </div>
            </fieldset>
            <p className="student-meta text-muted-foreground">Target tối thiểu 44px · focus bàn phím bắt buộc</p>
          </div>

          <div className="student-lab-specimen">
            <div className="student-lab-preview" data-viewport={viewport}>
              <PaperSurface variant="lined" className="space-y-3 p-5 text-center">
                <p className="student-label">Interactive specimen</p>
                <StudentButton
                  variant={buttonVariant}
                  disabled={buttonState === "disabled"}
                  loading={buttonState === "loading"}
                  aria-pressed={buttonState === "pressed" ? true : undefined}
                  onClick={() => setPressCount((count) => count + 1)}
                >
                  {buttonVariant === "accent" ? <Sparkles className="size-4" aria-hidden="true" /> : null}
                  {buttonState === "loading" ? "Đang xử lý" : "Thử hành động"}
                </StudentButton>
                <p className="student-meta text-muted-foreground" aria-live="polite">Đã bấm: {pressCount} lần</p>
              </PaperSurface>
            </div>
          </div>
        </PaperSurface>
      </section>

      <section className="space-y-3" aria-labelledby="lab-fields">
        <div className="max-w-3xl space-y-1">
          <h2 id="lab-fields" className="student-section-title">Fields và feedback</h2>
          <p className="student-body text-muted-foreground">Error và success luôn có thông điệp chữ; màu chỉ là tín hiệu bổ sung.</p>
        </div>
        <PaperSurface className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <StudentTextField id="lab-search" label="Tìm kiếm" type="search" leading={<Search className="size-4" />} value={search} onChange={(event) => setSearch(event.target.value)} hint="Hãy thử nhập từ khóa." />
          <StudentTextField id="lab-error" label="Validation error" defaultValue="example" error="Vui lòng kiểm tra dữ liệu." />
          <StudentTextField id="lab-disabled" label="Disabled field" disabled defaultValue="Không thể sửa" />
          <StudentTextField id="lab-success" label="Success field" defaultValue="Đã lưu" success="Thay đổi đã được lưu." />
        </PaperSurface>
      </section>

      <section className="space-y-3" aria-labelledby="lab-list">
        <div className="max-w-3xl space-y-1">
          <h2 id="lab-list" className="student-section-title">Danh sách trong ngữ cảnh thật</h2>
          <p className="student-body text-muted-foreground">Kiểm tra mật độ, metadata và action 44px trên desktop lẫn mobile.</p>
        </div>
        <StudentDataList>
          <StudentDataListItem
            leading={<BookOpen className="size-5" aria-hidden="true" />}
            content={<strong className="student-card-title">Một dòng minh họa</strong>}
            metadata={<span className="student-meta text-muted-foreground">Không có dữ liệu học sinh thật</span>}
            trailing={<span className="student-chip">Ví dụ</span>}
            actions={<StudentButton variant="secondary" size="compact" onClick={() => setPressCount((count) => count + 1)}>Thử</StudentButton>}
          />
        </StudentDataList>
      </section>
      <StudentPatternsGallery />
      <StudentVisualGallery />
    </div>
  );
}
