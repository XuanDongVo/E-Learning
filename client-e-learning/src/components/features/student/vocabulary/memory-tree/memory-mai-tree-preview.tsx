"use client";

import { useState } from "react";
import { Flower2, Play, RotateCcw, Sprout } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { ScrapbookHeading } from "@/components/student-ui/scrapbook-heading";
import { MemoryMaiTree, MEMORY_MAI_STAGES, type MemoryMaiStage } from "./memory-mai-tree";

const STAGES: Record<MemoryMaiStage, { name: string; detail: string }> = {
  0: { name: "Hạt giống", detail: "Một khởi đầu nhỏ, đang chờ ngày nảy mầm." },
  3: { name: "Mầm đầu tiên", detail: "Hai chiếc lá đầu tiên xuất hiện." },
  7: { name: "Mai non", detail: "Thân gỗ lớn lên, những nhánh lá mới hình thành." },
  14: { name: "Mai trưởng thành", detail: "Tán cây vươn rộng, các nụ hoa bắt đầu hé lộ." },
  30: { name: "Mai cổ thụ", detail: "Gốc mai vững chãi, hoa vàng bung nở và cánh hoa rơi." },
};

/** Isolated demo only. No learning progress routes or real backend calls. */
export function MemoryMaiTreePreview() {
  const [stage, setStage] = useState<MemoryMaiStage>(30);
  const [renderKey, setRenderKey] = useState(0);
  const [playing, setPlaying] = useState(false);

  const replay = () => setRenderKey((n) => n + 1);

  const playJourney = async () => {
    if (playing) return;
    setPlaying(true);
    // Deliberately a preview action: users can still select a stage manually.
    for (const next of MEMORY_MAI_STAGES) {
      setStage(next);
      setRenderKey((n) => n + 1);
      await new Promise<void>((resolve) => window.setTimeout(resolve, next === 30 ? 1600 : 1350));
    }
    setPlaying(false);
  };

  return (
    <main className="student-vocab mx-auto max-w-5xl space-y-5 pb-12">
      <div className="space-y-2">
        <p className="student-meta text-primary">BẢN XEM TRƯỚC · CHỈ COMPONENT</p>
        <ScrapbookHeading as="h1" className="student-page-title">Cây mai tri thức</ScrapbookHeading>
        <p className="student-body text-muted-foreground max-w-2xl">
          Thử 5 mốc trưởng thành của cùng một cây mai vàng Việt Nam. Dữ liệu đang dùng để minh họa, chưa kết nối tiến độ từ vựng.
        </p>
      </div>

      <PaperSurface as="section" variant="plain" className="overflow-hidden px-3 py-5 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="space-y-1">
            <span className="student-meta text-primary">KHU VƯỜN NHỎ</span>
            <h2 className="student-section-title">{STAGES[stage].name}</h2>
            <p className="student-body text-muted-foreground">{STAGES[stage].detail}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b49c71] bg-[#f7edd5] px-3 py-2 text-sm font-bold text-[#66523d]">
            <Sprout className="size-4" aria-hidden="true" />
            {stage === 0 ? "Khởi đầu" : "Mốc " + stage + " ngày"}
          </span>
        </div>
        <div className="mx-auto w-full max-w-[540px]">
          <MemoryMaiTree key={renderKey} stage={stage} />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {stage === 30 ? "Chạm vào cây để ngắm cánh hoa mai rơi." : "Chọn các mốc bên dưới để khám phá từng giai đoạn."}
        </p>
      </PaperSurface>

      <section aria-labelledby="preview-milestones" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="preview-milestones" className="student-section-title">Hành trình phát triển</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={replay} disabled={playing} className="student-control student-control--quiet inline-flex items-center gap-2 px-3">
              <RotateCcw className="size-4" aria-hidden="true" /> Phát lại
            </button>
            <button type="button" onClick={() => void playJourney()} disabled={playing} className="student-control student-control--action inline-flex items-center gap-2 px-3">
              <Play className="size-4" aria-hidden="true" /> {playing ? "Đang phát..." : "Xem quá trình lớn lên"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Chọn giai đoạn cây mai">
          {MEMORY_MAI_STAGES.map((value) => (
            <button
              type="button"
              key={value}
              disabled={playing}
              aria-pressed={stage === value}
              onClick={() => { setStage(value); replay(); }}
              className={"flex min-h-20 flex-col items-start justify-center gap-1 rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
                (stage === value ? "border-[#7a8e61] bg-[#eaf0df] text-[#375439]" : "border-[#d2bea0] bg-[#fdf9f0] text-[#655840] hover:bg-[#f4ead6]")}
            >
              <span className="text-xs font-bold opacity-70">{value === 0 ? "Bắt đầu" : value + " ngày"}</span>
              <span className="text-sm font-bold leading-snug">{STAGES[value].name}</span>
            </button>
          ))}
        </div>
        {stage === 30 && (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Flower2 className="size-4" aria-hidden="true" />
            Cánh hoa rơi chạy nhẹ trên điện thoại; khi bật giảm chuyển động, hiệu ứng sẽ tự tắt.
          </p>
        )}
      </section>
    </main>
  );
}
