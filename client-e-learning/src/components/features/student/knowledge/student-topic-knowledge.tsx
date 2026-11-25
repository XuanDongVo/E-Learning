"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpenText,
  ChevronRight,
  LibraryBig,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { KnowledgeDocumentRenderer } from "@/components/features/knowledge-note/knowledge-document-renderer";
import { studentKnowledgeNoteService } from "@/services/student/student-knowledge-note.service";

/** S03.2 — Topic-aware reading uses server-validated, published links. */
export function StudentTopicKnowledge({ topicId }: { topicId: number }) {
  const t = useTranslations("student.knowledge.topic");
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["student", "knowledge-notes", "topic", topicId],
    queryFn: async () =>
      (await studentKnowledgeNoteService.forTopic(topicId)).data,
    enabled: Number.isSafeInteger(topicId) && topicId > 0,
    staleTime: 60_000,
  });
  const primary = query.data?.primary;
  const detailQuery = useQuery({
    queryKey: ["student", "knowledge-notes", "detail", primary?.id],
    queryFn: async () =>
      (await studentKnowledgeNoteService.get(primary!.id)).data,
    enabled: open && Boolean(primary?.id),
    staleTime: 60_000,
  });
  const supplementary = query.data?.supplementary ?? [];
  const hasExcerpt = Boolean(primary?.summaryDocument.content.length);

  if (query.isPending) {
    return (
      <PaperSurface
        as="section"
        className="student-topic-knowledge space-y-3 p-4 sm:p-5"
        role="status"
      >
        <p className="student-label">{t("loading")}</p>
        <div className="h-12 animate-pulse rounded bg-muted/60" />
      </PaperSurface>
    );
  }
  if (query.isError) {
    return (
      <PaperSurface
        as="section"
        className="student-topic-knowledge space-y-2 p-4 sm:p-5"
      >
        <h3 className="student-card-title">
          {t("loadError")}
        </h3>
        <p className="student-body text-muted-foreground">
          {t("loadErrorDescription")}
        </p>
        <button
          type="button"
          className="student-control student-control--secondary w-fit px-4"
          onClick={() => void query.refetch()}
        >
          {t("retry")}
        </button>
      </PaperSurface>
    );
  }
  if (!primary && !supplementary.length) {
    return (
      <PaperSurface as="section" className="student-topic-knowledge p-4 sm:p-5">
        <p className="student-label text-foreground">
          {t("empty")}
        </p>
        <Link
          href="/student/knowledge"
          className="student-label mt-2 inline-flex items-center gap-1 text-primary underline underline-offset-4"
        >
          {t("explore")}{" "}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </PaperSurface>
    );
  }
  return (
    <>
      <PaperSurface
        as="section"
        variant="lined"
        emphasis="feature"
        className="student-topic-knowledge space-y-4 p-4 sm:p-6"
        aria-label={t("aria")}
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="student-meta flex items-center gap-2 text-primary">
              <Sparkles className="size-4" aria-hidden="true" /> {t("eyebrow")}
            </p>
            <h3 className="student-section-title text-foreground">
              {t("heading")}
            </h3>
            {primary && (
              <p className="student-label text-muted-foreground">
                {primary.title}
              </p>
            )}
          </div>
          <StudentIllustration
            id="illustration.topic-notes"
            decorative
            className="hidden w-20 shrink-0 sm:block"
          />
        </div>
        {primary ? (
          <>
            {hasExcerpt ? (
              <div className="student-topic-knowledge__excerpt">
                <KnowledgeDocumentRenderer
                  document={primary.summaryDocument}
                  compact
                  idPrefix={`topic-${topicId}-excerpt-`}
                />
              </div>
            ) : (
              <p className="student-body text-muted-foreground">
                {t("noSummary")}
              </p>
            )}
            {primary.totalKeyPoints > 3 && (
              <p className="student-caption text-muted-foreground">
                {t("summaryCount", { total: primary.totalKeyPoints })}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="student-control student-control--secondary inline-flex items-center gap-2 px-4"
                onClick={() => setOpen(true)}
              >
                <BookOpenText className="size-4" aria-hidden="true" /> {t("quickRead")}
              </button>
              <Link
                href={`/student/knowledge/${primary.id}?topicId=${topicId}`}
                className="student-control student-control--action inline-flex items-center gap-2 px-4"
              >
                {t("fullRead")}{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : (
          <p className="student-body text-muted-foreground">
            {t("noPrimary")}
          </p>
        )}
        {supplementary.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <h4 className="student-label text-foreground">
              {t("readMore", { count: supplementary.length })}
            </h4>
            {supplementary.map((note) => (
              <Link
                key={note.id}
                href={`/student/knowledge/${note.id}?topicId=${topicId}`}
                className="student-topic-knowledge__related flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <LibraryBig
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">{note.title}</span>
                <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </PaperSurface>
      {primary && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="student-theme w-[calc(100vw-1.5rem)] sm:max-w-[90vw] lg:max-w-5xl xl:max-w-6xl max-h-[90dvh] overflow-y-auto border-2 border-ink bg-card shadow-pop p-4 sm:p-6 lg:p-8">
            <DialogHeader>
              <DialogTitle className="student-section-title text-foreground">
                {primary.title}
              </DialogTitle>
              <DialogDescription>
                {t("dialogDescription")}
              </DialogDescription>
            </DialogHeader>
            {detailQuery.isPending ? (
              <p className="student-body" role="status">
                {t("dialogLoading")}
              </p>
            ) : detailQuery.isError ? (
              <div className="space-y-2">
                <p className="student-body">
                  {t("dialogError")}
                </p>
                <button
                  type="button"
                  className="student-control student-control--secondary px-4"
                  onClick={() => void detailQuery.refetch()}
                >
                  {t("retry")}
                </button>
              </div>
            ) : detailQuery.data?.document ? (
              <div className="student-knowledge-reading">
                <KnowledgeDocumentRenderer
                  document={detailQuery.data.document}
                  idPrefix={`topic-${topicId}-dialog-`}
                />
              </div>
            ) : (
              <p className="student-body">
                {t("dialogEmpty")}
              </p>
            )}
            <Link
              href={`/student/knowledge/${primary.id}`}
              className="student-control student-control--action inline-flex w-fit items-center gap-2 px-4"
            >
              {t("dialogReadAll")} <ArrowRight className="size-4" />
            </Link>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
