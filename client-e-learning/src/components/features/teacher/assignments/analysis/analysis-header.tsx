"use client";

import { Link } from "@/i18n/navigation";
import { MOCK_ASSIGNMENT } from "./mock-data";

export function AnalysisHeader() {
  return (
    <header className="border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-sm">
        <Link href="/teacher/assignments" className="text-muted-foreground hover:text-foreground">
          ← Về trình soạn
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="font-medium text-foreground">Kết quả · {MOCK_ASSIGNMENT.title}</span>
      </div>
    </header>
  );
}
