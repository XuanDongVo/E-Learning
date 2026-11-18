"use client";

import { PipoCharacter } from "@/components/student-ui/visuals/pipo/pipo-character";
import type { PipoMood } from "@/components/student-ui/visuals/pipo/pipo.types";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { STUDENT_VISUAL_IDS, studentVisualRegistry } from "@/lib/student-visuals/registry";
import type { StudentVisualId } from "@/lib/student-visuals/registry";

const LABELS: Record<StudentVisualId, { name: string; purpose: string }> = {
  "scene.study-desk": { name: "Góc học tập", purpose: "Bối cảnh Hub; không thay ảnh học liệu." },
  "scene.open-notebook": { name: "Sổ mở", purpose: "Trang từ vựng hoặc góc đọc." },
  "illustration.no-results": { name: "Không có kết quả", purpose: "Search/filter empty state có thao tác quay lại." },
  "illustration.no-lessons": { name: "Chưa có bài học", purpose: "Học liệu chưa công bố; không tạo dữ liệu giả." },
  "illustration.word-collection": { name: "Kho từ vựng", purpose: "Visual anchor của Vocabulary collection." },
  "illustration.achievement-stamp": { name: "Dấu thành tích", purpose: "Chỉ dùng sau kết quả hoặc milestone được xác nhận." },
  "doodle.arrow": { name: "Mũi tên", purpose: "Chỉ hướng vào hành động hoặc chú thích cụ thể." },
  "doodle.underline": { name: "Gạch chân", purpose: "Nhấn một tiêu đề ngắn, không gạch nhiều khu vực." },
  "doodle.star-sticker": { name: "Ngôi sao", purpose: "Trang trí nhẹ hoặc trạng thái đạt thành tích." },
};

const MOODS: PipoMood[] = ["idle", "happy", "think", "wave", "oops", "cheer", "celebrate", "sleepy"];

/** Static editorial gallery, for dev QA only. Real Student pages use semantic asset IDs. */
export function StudentVisualGallery() {
  return (
    <section className="space-y-4" aria-labelledby="student-lab-visuals">
      <div className="max-w-3xl space-y-1">
        <h2 id="student-lab-visuals" className="student-section-title">Visual Assets · Phase 3</h2>
        <p className="student-body text-muted-foreground">
          Một art direction, không ghép nhiều illustration packs. Các hình ở đây là SVG gốc,
          dùng theo ngữ cảnh và có quy tắc license trong tài liệu dự án.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STUDENT_VISUAL_IDS.map((id) => {
          const item = studentVisualRegistry[id];
          const label = LABELS[id];
          return (
            <article key={id} className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card">
              <div className="flex h-44 items-center justify-center bg-secondary/25 p-5">
                <StudentIllustration id={id} alt={label.name} className="max-h-36 w-auto" />
              </div>
              <div className="space-y-1.5 p-4">
                <p className="student-card-title">{label.name}</p>
                <code className="student-caption block break-all text-primary">{id}</code>
                <p className="student-meta text-muted-foreground">{item.role} · original SVG</p>
                <p className="student-body text-muted-foreground">{label.purpose}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="space-y-2">
        <h3 className="student-card-title">Pipo · những biểu cảm đang có</h3>
        <p className="student-body text-muted-foreground">
          Pipo giữ nguyên nhân dạng; nhân vật gốc là React SVG, không phải bộ mascot bên ngoài.
        </p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {MOODS.map((mood) => (
            <div key={mood} className="space-y-1.5 rounded-lg border border-border/70 bg-card px-1 py-3 text-center">
              <div className="flex justify-center" aria-hidden="true">
                <PipoCharacter mood={mood} size={76} />
              </div>
              <p className="student-caption text-muted-foreground">{mood}</p>
            </div>
          ))}
        </div>
        <p className="student-meta text-muted-foreground">Đạo cụ tái sử dụng trên Pipo gốc (không tạo mascot mới)</p>
        <div className="grid grid-cols-3 gap-3 sm:max-w-sm">
          {(["book", "pencil", "badge"] as const).map((prop) => (
            <div key={prop} className="rounded-lg border border-border/70 bg-card p-2 text-center">
              <div className="flex justify-center" aria-hidden="true">
                <PipoCharacter mood="happy" prop={prop} size={90} />
              </div>
              <p className="student-caption text-muted-foreground">{prop}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
