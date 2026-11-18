"use client";

import { useState } from "react";
import { BookOpen, Layers3 } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentButton } from "@/components/student-ui/student-button";
import { StudentTextField } from "@/components/student-ui/student-text-field";
import { StudentDataList } from "@/components/student-ui/data-list/student-data-list";
import { StudentDataListItem } from "@/components/student-ui/data-list/student-data-list-item";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { StudentPageHeading } from "./student-page-heading";
import { StudentBackLink } from "./student-back-link";
import { StudentCollectionPanel } from "./student-collection-panel";
import { StudentCollectionEmptyState } from "./student-collection-empty-state";

type Preview = "hub" | "collection" | "detail";

const FIXTURES = [
  { id: "one", name: "Từ vựng — bài mẫu", description: "Nội dung giả lập để thử mật độ danh sách." },
  { id: "two", name: "Bài đọc — bài mẫu", description: "Không sử dụng dữ liệu hoặc điểm số thật." },
  { id: "three", name: "Luyện tập — bài mẫu", description: "Không liên kết với API hoặc activity." },
];

/** Only for the internal Design Lab; none of these fixtures are Student records. */
export function StudentPatternsGallery() {
  const [view, setView] = useState<Preview>("collection");
  const [query, setQuery] = useState("");
  const items = FIXTURES.filter((item) => item.name.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));

  return (
    <section className="space-y-4" aria-labelledby="lab-page-patterns">
      <div className="max-w-3xl space-y-1">
        <h2 id="lab-page-patterns" className="student-section-title">Page patterns · Phase 4</h2>
        <p className="student-body text-muted-foreground">
          So sánh Hub, Collection và Detail với cùng hệ thống hình ảnh nhưng bố cục khác nhau.
          Đây chỉ là fixture để thử component; Workspace, Assessment và Game giữ cấu trúc riêng.
        </p>
      </div>
      <div role="group" aria-label="Chọn loại bố cục" className="flex flex-wrap gap-2">
        {(["hub", "collection", "detail"] as const).map((value) => (
          <StudentButton
            key={value}
            variant={view === value ? "secondary" : "quiet"}
            size="compact"
            aria-pressed={view === value}
            onClick={() => setView(value)}
          >
            {value === "hub" ? "Hub" : value === "collection" ? "Collection" : "Detail"}
          </StudentButton>
        ))}
      </div>
      {view === "hub" && (
        <PaperSurface as="section" variant="kraft" emphasis="feature" className="p-5 sm:p-7">
          <StudentPageHeading
            as="h3"
            eyebrow="HUB · Preview"
            title="Hôm nay học gì?"
            description="Một hành trình có điểm bắt đầu rõ ràng. Đây là demo, không phải trang học thật."
            actions={<StudentButton variant="action" onClick={() => setView("collection")}>Xem bộ sưu tập mẫu</StudentButton>}
            artwork={<StudentIllustration id="scene.study-desk" decorative className="w-36 sm:w-48" />}
            artworkClassName="hidden sm:block"
          />
        </PaperSurface>
      )}
      {view === "collection" && (
        <div className="space-y-4">
          <PaperSurface as="section" variant="kraft" emphasis="feature" className="p-5 sm:p-6">
            <StudentPageHeading
              as="h3"
              eyebrow="COLLECTION · Preview"
              title="Bộ sưu tập mẫu"
              description="Cấu trúc dữ liệu: lọc, danh sách và trạng thái trống."
              artwork={<StudentIllustration id="illustration.word-collection" decorative className="w-28" />}
              artworkClassName="hidden sm:block"
            />
          </PaperSurface>
          <StudentCollectionPanel
            ariaLive="polite"
            toolbar={
              <StudentTextField
                id="lab-pattern-search"
                type="search"
                label="Tìm nội dung minh họa"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Thử tìm từ không có trong danh sách..."
              />
            }
            footer={<p className="student-caption text-muted-foreground">Dữ liệu demo cố định; không có pagination/API.</p>}
          >
            {items.length === 0 ? (
              <StudentCollectionEmptyState
                title="Không tìm thấy mục phù hợp"
                description="Bạn có thể xóa bộ lọc để tiếp tục xem dữ liệu mẫu."
                action={<StudentButton variant="secondary" onClick={() => setQuery("")}>Xóa tìm kiếm</StudentButton>}
              />
            ) : (
              <StudentDataList density="comfortable">
                {items.map((item) => (
                  <StudentDataListItem key={item.id}
                    leading={<BookOpen className="size-4" aria-hidden="true" />}
                    content={<h3 className="student-card-title">{item.name}</h3>}
                    metadata={<p className="student-meta text-muted-foreground">{item.description}</p>}
                    trailing={<span className="student-chip">Ví dụ</span>}
                  />
                ))}
              </StudentDataList>
            )}
          </StudentCollectionPanel>
        </div>
      )}
      {view === "detail" && (
        <div className="space-y-3">
          <StudentBackLink href="/student/units">Tất cả bài học (route thật)</StudentBackLink>
          <PaperSurface as="section" variant="kraft" emphasis="feature" className="p-5 sm:p-7">
            <StudentPageHeading
              as="h3"
              eyebrow="DETAIL · Preview"
              title="Một Unit minh họa"
              description="Chi tiết có bối cảnh, nội dung chính và hành động riêng. Không cần copy hero từ Hub."
              artwork={<StudentIllustration id="scene.open-notebook" decorative className="w-32" />}
              artworkClassName="hidden sm:block"
            />
          </PaperSurface>
          <PaperSurface as="section" className="space-y-2 p-5">
            <h3 className="student-card-title">Nội dung chính</h3>
            <div className="flex gap-3">
              <Layers3 className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="student-body text-muted-foreground">
                Chỉ mô phỏng thứ tự thông tin; Unit thật tiếp tục sử dụng UnitCover và dữ liệu từ server.
              </p>
            </div>
          </PaperSurface>
        </div>
      )}
      <p className="student-caption text-muted-foreground">
        Preview chỉ mô phỏng độ rộng nội dung. Cần kiểm tra media query trên viewport 360/390px và desktop thật.
      </p>
    </section>
  );
}
