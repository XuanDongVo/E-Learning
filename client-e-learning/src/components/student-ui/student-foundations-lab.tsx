"use client";

import { useState } from "react";
import { BookOpen, Search, Sparkles } from "lucide-react";
import { PaperSurface } from "./paper-surface";
import { ScrapbookHeading } from "./scrapbook-heading";
import { StudentButton } from "./student-button";
import { StudentTextField } from "./student-text-field";
import { StudentDataList } from "./data-list/student-data-list";
import { StudentDataListItem } from "./data-list/student-data-list-item";

/** Dev-only visual fixtures, never connected to Student accounts or APIs. */
export function StudentFoundationsLab() {
  const [search, setSearch] = useState("");
  const [pressCount, setPressCount] = useState(0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <header className="space-y-2">
        <p className="student-meta text-primary">Internal preview · Student UI v2</p>
        <ScrapbookHeading as="h1" className="student-page-title">Sổ tay giao diện Student</ScrapbookHeading>
        <p className="student-body text-muted-foreground">
          Dữ liệu minh họa cho developer; không phải tiến độ hoặc bài học của học sinh.
        </p>
      </header>
      <section className="space-y-3" aria-labelledby="lab-surfaces">
        <h2 id="lab-surfaces" className="student-section-title">Bề mặt và mức nhấn</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <PaperSurface as="article" className="space-y-2 p-5">
            <h3 className="student-card-title">Content</h3>
            <p className="student-body">Giấy đọc thông thường, không shadow.</p>
          </PaperSurface>
          <PaperSurface as="article" variant="kraft" emphasis="feature" tape className="space-y-2 p-5">
            <h3 className="student-card-title">Feature</h3>
            <p className="student-body">Một điểm nhấn có chủ đích.</p>
          </PaperSurface>
          <PaperSurface as="article" emphasis="accent" className="space-y-2 p-5">
            <h3 className="student-card-title">Accent</h3>
            <p className="student-body">Thông tin phụ, không cạnh tranh CTA.</p>
          </PaperSurface>
        </div>
      </section>
      <section className="space-y-3" aria-labelledby="lab-typography">
        <h2 id="lab-typography" className="student-section-title">Typography</h2>
        <PaperSurface className="space-y-3 p-5">
          <p className="student-page-title">Tiêu đề trang</p>
          <p className="student-section-title">Tiêu đề khu vực</p>
          <p className="student-card-title">Tiêu đề nội dung</p>
          <p className="student-body">Văn bản giao diện nên dễ đọc trên màn hình nhỏ.</p>
          <p className="student-reading">Đoạn đọc dài cần nhịp chữ thoáng và font rõ ràng.</p>
          <p className="student-label">Nhãn biểu mẫu</p>
          <p className="student-meta">Metadata</p>
          <p className="student-caption">Chú thích</p>
        </PaperSurface>
      </section>
      <section className="space-y-3" aria-labelledby="lab-controls">
        <h2 id="lab-controls" className="student-section-title">Controls và trạng thái</h2>
        <PaperSurface className="space-y-4 p-5">
          <div className="flex flex-wrap gap-3">
            <StudentButton variant="action" onClick={() => setPressCount((n) => n + 1)}>Primary</StudentButton>
            <StudentButton variant="secondary" onClick={() => setPressCount((n) => n + 1)}>Secondary</StudentButton>
            <StudentButton variant="quiet" onClick={() => setPressCount((n) => n + 1)}>Quiet</StudentButton>
            <StudentButton variant="accent" onClick={() => setPressCount((n) => n + 1)}>
              <Sparkles className="size-4" /> Accent
            </StudentButton>
            <StudentButton variant="danger" onClick={() => setPressCount((n) => n + 1)}>Destructive</StudentButton>
            <StudentButton disabled>Disabled</StudentButton>
            <StudentButton loading>Loading</StudentButton>
          </div>
          <p className="student-meta" aria-live="polite">Đã bấm: {pressCount} lần</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <StudentTextField id="lab-search" label="Tìm kiếm" type="search"
              leading={<Search className="size-4" />} value={search} onChange={(e) => setSearch(e.target.value)}
              hint="Hãy thử nhập từ khóa." />
            <StudentTextField id="lab-error" label="Validation error" defaultValue="example"
              error="Vui lòng kiểm tra dữ liệu." />
            <StudentTextField id="lab-disabled" label="Disabled field" disabled defaultValue="Không thể sửa" />
            <StudentTextField id="lab-success" label="Success field" defaultValue="Đã lưu"
              data-validation="success" />
          </div>
        </PaperSurface>
      </section>
      <section className="space-y-3" aria-labelledby="lab-list">
        <h2 id="lab-list" className="student-section-title">Danh sách — functional density</h2>
        <StudentDataList>
          <StudentDataListItem
            leading={<BookOpen className="size-5" aria-hidden="true" />}
            content={<strong className="student-card-title">Một dòng minh họa</strong>}
            metadata={<span className="student-meta text-muted-foreground">Không có dữ liệu học sinh thực</span>}
            trailing={<span className="student-chip">Ví dụ</span>}
            actions={<StudentButton variant="secondary" size="compact"
              onClick={() => setPressCount((n) => n + 1)}>Thử</StudentButton>}
          />
        </StudentDataList>
      </section>
    </div>
  );
}
