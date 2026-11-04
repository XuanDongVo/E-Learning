"use client";

import type { ContentView } from "@/types/content";
import { TeacherPageHeader } from "@/components/features/teacher/shared/teacher-page-header";
import { useTranslations } from "next-intl";

/**
 * TEMPORARY stub after a bad push overwrote this file.
 * Replace with the full ContentOverview from commit 5c71a4e0 + TeacherPageHeader patch.
 * Local patched copy is ready; re-push the full file to complete P1.3.
 */
export function ContentOverview({
  onNavigate,
}: {
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const tContent = useTranslations("teacher.content");
  void onNavigate;

  return (
    <div className="space-y-4">
      <TeacherPageHeader
        title={tContent("content")}
        description={tContent("contentDescription")}
        pipoMood="wave"
        pipoSize={100}
      />
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Content Explorer is temporarily unavailable while the full module is
        restored. Pull the latest branch after the next fix commit, or restore
        this file from git history (commit 5c71a4e0) and re-apply the header
        patch.
      </div>
    </div>
  );
}
