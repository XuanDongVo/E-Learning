"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookMarked,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { StudentBackLink } from "@/components/student-ui/patterns/student-back-link";
import { StudentCollectionEmptyState } from "@/components/student-ui/patterns/student-collection-empty-state";
import { StudentPageHeading } from "@/components/student-ui/patterns/student-page-heading";
import { StudentDoodle } from "@/components/student-ui/visuals/student-doodle";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { StudentMascotScene } from "@/components/student-ui/visuals/pipo/student-mascot-scene";
import { studentKnowledgeNoteService } from "@/services/student/student-knowledge-note.service";
import { studentUnitService } from "@/services/student/student-unit.service";
import type { StudentKnowledgeNoteSummary } from "@/types/student-knowledge-note";

const PAGE_SIZE = 12;

export function StudentKnowledgeLibrary() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [unitId, setUnitId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLElement | null>(null);
  const shouldFocusListRef = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [input]);

  const unitsQuery = useQuery({
    queryKey: ["student", "knowledge-notes", "visible-units"],
    queryFn: async () => (await studentUnitService.list()).data ?? [],
  });
  const unitDetailQuery = useQuery({
    queryKey: ["student", "knowledge-notes", "unit-topics", unitId],
    queryFn: async () =>
      (await studentUnitService.getUnitDetail(Number(unitId))).data,
    enabled: Boolean(unitId),
  });
  const visibleTopics = (unitDetailQuery.data?.sections ?? []).flatMap(
    (section) => section.topics,
  );
  const notesQuery = useQuery({
    queryKey: [
      "student",
      "knowledge-notes",
      "library",
      search,
      unitId,
      topicId,
      page,
    ],
    queryFn: async () =>
      (
        await studentKnowledgeNoteService.list({
          search: search || undefined,
          unitId: unitId ? Number(unitId) : undefined,
          topicId: topicId ? Number(topicId) : undefined,
          page,
          size: PAGE_SIZE,
        })
      ).data,
  });

  const notes = notesQuery.data?.items ?? [];
  const hasFilters = Boolean(search || unitId || topicId);
  const total = notesQuery.data?.totalElements ?? 0;
  const pages = notesQuery.data?.totalPages ?? 1;

  useEffect(() => {
    if (notesQuery.isError) {
      shouldFocusListRef.current = false;
      return;
    }
    if (!shouldFocusListRef.current || notesQuery.isFetching) return;

    const frame = window.requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;

      list.focus({ preventScroll: true });
      list.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      shouldFocusListRef.current = false;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [notesQuery.isError, notesQuery.isFetching, page]);

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;
    shouldFocusListRef.current = true;
    setPage(nextPage);
  };

  const clearFilters = () => {
    setInput("");
    setSearch("");
    setUnitId("");
    setTopicId("");
    setPage(1);
  };

  return (
    <main className="student-knowledge mx-auto max-w-6xl space-y-6 pb-12">
      {/* <StudentBackLink href="/student">Về Learning Hub</StudentBackLink> */}
      <PaperSurface
        as="section"
        variant="kraft"
        tape
        emphasis="feature"
        className="student-knowledge-hero relative overflow-hidden p-5 sm:p-3"
      >
        <StudentDoodle
          id="doodle.star-sticker"
          className="pointer-events-none absolute -right-3 -top-3 hidden w-16 rotate-[16deg] opacity-90 sm:block"
        />
        <StudentPageHeading
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <BookMarked className="size-4" aria-hidden="true" /> GÓC ĐỌC CỦA
              BẠN · KNOWLEDGE LIBRARY
            </span>
          }
          title={
            <>
              Sổ tay <span className="student-highlight">kiến thức</span>
            </>
          }
          description="Những trang lý thuyết được thầy biên soạn. Mở một trang, đọc theo nhịp của bạn và quay lại bất cứ lúc nào."
          artwork={
            <div className="student-knowledge-hero-art relative">
              <StudentIllustration
                id="scene.knowledge-shelf"
                decorative
                priority
                className="relative z-10 w-full max-w-[330px] drop-shadow-sm"
              />
              <StudentDoodle
                id="doodle.reading-trail"
                className="pointer-events-none absolute -bottom-4 left-0 w-28 -rotate-12 opacity-80"
              />
              <StudentMascotScene
                variant="guide" mood="think" prop="book" presentation="sticker"
                size="compact" className="pointer-events-none absolute bottom-1 -left-3 z-20"
              />
            </div>
          }
          artworkClassName="hidden w-[40%] max-w-[340px] sm:block"
          className="gap-5"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="student-chip bg-card !p-2">
            <Sparkles className="size-3.5" aria-hidden="true" /> Học theo cách
            của bạn
          </span>
          <span className="student-chip bg-card !p-2">
            <BookOpenText className="size-3.5" aria-hidden="true" /> Công thức ·
            Ví dụ · Ghi chú
          </span>
        </div>
        <StudentMascotScene
          variant="guide" mood="think" prop="book"
          message="Chọn một trang lý thuyết bạn muốn đọc nhé!"
          className="mt-4 sm:hidden"
        />
      </PaperSurface>

      <PaperSurface
        as="section"
        variant="plain"
        className="space-y-4 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="student-section-title">Tìm một trang để đọc</h2>
            <p className="student-body text-muted-foreground">
              Chỉ hiển thị học liệu đã công bố thuộc khối lớp của bạn.
            </p>
          </div>
          <StudentDoodle
            id="doodle.bookmark-note"
            className="pointer-events-none hidden h-16 w-auto rotate-[8deg] sm:block"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)_minmax(160px,220px)]">
          <label className="block space-y-1.5">
            <span className="student-label">Tìm theo tên hoặc mô tả</span>
            <span className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ví dụ: thì hiện tại đơn"
                aria-label="Tìm bài lý thuyết"
                className="student-field w-full !pl-10 !pr-3"
              />
            </span>
          </label>
          <label className="block space-y-1.5">
            <span className="student-label">Theo bài học (Unit)</span>
            <select
              aria-label="Lọc theo Unit"
              value={unitId}
              onChange={(event) => {
                setUnitId(event.target.value);
                setTopicId("");
                setPage(1);
              }}
              disabled={unitsQuery.isPending || unitsQuery.isError}
              className="student-control w-full px-3"
            >
              <option value="">Tất cả học liệu</option>
              {(unitsQuery.data ?? []).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.code} · {unit.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="student-label">Theo chuyên đề (Topic)</span>
            <select
              aria-label="Lọc theo Topic"
              value={topicId}
              onChange={(event) => {
                setTopicId(event.target.value);
                setPage(1);
              }}
              disabled={
                !unitId ||
                unitDetailQuery.isPending ||
                unitDetailQuery.isError ||
                visibleTopics.length === 0
              }
              className="student-control w-full px-3"
            >
              <option value="">Tất cả Topic</option>
              {visibleTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {unitDetailQuery.isError && unitId && (
          <p role="status" className="text-sm text-destructive">
            Không thể tải Topic của Unit này.
            <button
              type="button"
              className="ml-2 font-bold underline"
              onClick={() => void unitDetailQuery.refetch()}
            >
              Thử lại
            </button>
          </p>
        )}
        {unitsQuery.isError && (
          <p role="status" className="text-sm text-destructive">
            Không thể tải danh sách Unit.
            <button
              type="button"
              onClick={() => void unitsQuery.refetch()}
              className="ml-2 font-bold underline"
            >
              Thử lại
            </button>
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-3">
          <p className="student-meta text-muted-foreground" role="status">
            {notesQuery.isPending
              ? "Đang tìm trang phù hợp…"
              : `${total} bài lý thuyết${hasFilters ? " phù hợp" : " đã công bố"}`}
          </p>
          {hasFilters && (
            <button
              type="button"
              className="student-label min-h-10 text-primary underline underline-offset-4"
              onClick={clearFilters}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </PaperSurface>

      {notesQuery.isPending ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          role="status"
          aria-label="Đang tải sổ tay"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="student-knowledge-skeleton h-52 animate-pulse rounded-xl border-2 border-ink/30 bg-card"
            />
          ))}
        </div>
      ) : notesQuery.isError ? (
        <PaperSurface
          as="section"
          className="space-y-3 p-6 sm:p-8"
          role="alert"
        >
          <h2 className="student-card-title">Chưa thể mở thư viện</h2>
          <p className="student-body text-muted-foreground">
            {notesQuery.error instanceof Error
              ? notesQuery.error.message
              : "Không thể tải bài lý thuyết."}
          </p>
          <button
            type="button"
            className="student-control student-control--action"
            onClick={() => void notesQuery.refetch()}
          >
            Tải lại
          </button>
        </PaperSurface>
      ) : notes.length === 0 ? (
        <PaperSurface as="section" className="p-6">
          <StudentCollectionEmptyState
            title={
              hasFilters
                ? "Chưa tìm thấy trang phù hợp"
                : "Sổ tay đang chờ trang đầu tiên"
            }
            description={
              hasFilters
                ? "Bạn có thể tìm bằng từ khóa khác hoặc trở về tất cả học liệu."
                : "Các bài lý thuyết sẽ xuất hiện khi thầy cô công bố. Bạn vẫn có thể luyện tập ở Learning Hub."
            }
            illustration={
              hasFilters ? "illustration.no-results" : "illustration.no-lessons"
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  className="student-control student-control--action"
                  onClick={clearFilters}
                >
                  Xem tất cả
                </button>
              ) : (
                <Link
                  href="/student/units"
                  className="student-control student-control--action"
                >
                  Đến Learning Hub
                </Link>
              )
            }
          />
        </PaperSurface>
      ) : (
        <>
          <section
            ref={listRef}
            id="knowledge-note-card-list"
            tabIndex={-1}
            aria-label="Danh sách bài lý thuyết"
            className="scroll-mt-24 grid gap-4 outline-none sm:grid-cols-2 xl:grid-cols-3"
          >
            {notes.map((note, i) => (
              <KnowledgeNoteCard
                key={note.id}
                note={note}
                index={(page - 1) * PAGE_SIZE + i}
              />
            ))}
          </section>
          {pages > 1 && (
            <nav
              aria-label="Trang sổ tay"
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <button
                type="button"
                className="student-control student-control--secondary flex items-center gap-1 px-3"
                disabled={page <= 1}
                onClick={() => changePage(Math.max(1, page - 1))}
              >
                <ChevronLeft className="size-4" /> Trước
              </button>
              <span
                className="student-meta text-muted-foreground"
                aria-live="polite"
              >
                Trang {page} / {pages}
              </span>
              <button
                type="button"
                className="student-control student-control--secondary flex items-center gap-1 px-3"
                disabled={page >= pages}
                onClick={() => changePage(Math.min(pages, page + 1))}
              >
                Sau <ChevronRight className="size-4" />
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

function KnowledgeNoteCard({
  note,
  index,
}: {
  note: StudentKnowledgeNoteSummary;
  index: number;
}) {
  const tag = note.units[0];
  return (
    <Link
      href={`/student/knowledge/${note.id}`}
      className="student-knowledge-card group relative flex min-w-0 flex-col p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="student-knowledge-card-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <BookMarked
          className="size-6 -rotate-12 text-primary transition-transform group-hover:rotate-0"
          aria-hidden="true"
        />
      </div>
      <p className="student-meta mb-2 text-primary">  
        {tag ? `${tag.code} · ${tag.name}` : "GÓC ĐỌC TỰ DO"}
      </p>
      <h3 className="student-card-title mb-2 line-clamp-3 text-foreground group-hover:text-primary">
        {note.title}
      </h3>
      <p className="student-body mb-5 line-clamp-3 flex-1 text-muted-foreground">
        {note.description?.trim() ||
          "Một trang kiến thức để bạn khám phá và ôn lại khi cần."}
      </p>
      <span className="student-label mt-auto inline-flex items-center gap-2 border-t border-dashed border-border pt-3 text-primary">
        Mở trang kiến thức{" "}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
