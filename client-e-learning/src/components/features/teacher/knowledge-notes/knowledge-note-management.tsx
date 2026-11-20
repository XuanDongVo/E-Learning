<<<<<<< HEAD

"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FilePlus2,
  Pencil,
  RotateCcw,
  Search,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { RegionState } from "@/components/feedback";

import { gradeService } from "@/services/grade.service";
import { useTeacherKnowledgeNotes } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import type {
  KnowledgeNote,
  KnowledgeNoteStatus,
  TeacherKnowledgeNoteListFilters,
} from "@/types/knowledge-note";
import { formatDateTime } from "@/utils/format";

import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";
import { TeacherKnowledgeNoteCreateDialog } from "./knowledge-note-create";
import { TeacherListToolbar } from "@/components/features/teacher/shared/teacher-list-toolbar";

const statusLabels: Record<KnowledgeNoteStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã công bố",
  UNPUBLISHED: "Đã gỡ công bố",
  ARCHIVED: "Lưu trữ",
};

const DEFAULT_FILTERS: TeacherKnowledgeNoteListFilters = {
  page: 1,
  size: 20,
};

export function TeacherKnowledgeNoteManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] =
    useState<TeacherKnowledgeNoteListFilters>(DEFAULT_FILTERS);

  const notesQuery = useTeacherKnowledgeNotes(filters);

  const gradesQuery = useQuery({
    queryKey: ["grades"],
    queryFn: gradeService.list,
  });

  const grades = useMemo(
    () => gradesQuery.data?.data ?? [],
    [gradesQuery.data],
  );

  const gradeNames = useMemo(
    () => new Map(grades.map((grade) => [grade.id, grade.name])),
    [grades],
  );

  const page = notesQuery.data;

  const hasFilters =
    Boolean(filters.search) ||
    filters.gradeId !== undefined ||
    filters.status !== undefined ||
    filters.linked !== undefined;

  const updateFilters = (
    patch: Partial<TeacherKnowledgeNoteListFilters>,
  ) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: 1,
    }));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateFilters({
      search: searchInput.trim() || undefined,
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  };
=======
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpenText, Plus, Search, SlidersHorizontal } from "lucide-react";
import { gradeService } from "@/services/grade.service";
import { useTeacherKnowledgeNotes } from "@/hooks/knowledge-note/use-teacher-knowledge-notes";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageBanner, RegionState } from "@/components/feedback";
import type {
  KnowledgeNote,
  KnowledgeNoteStatus,
  TeacherKnowledgeNoteListFilters,
} from "@/types/knowledge-note";
import { TeacherKnowledgeNoteLayout } from "./knowledge-note-layout";
import { toAppError } from "@/lib/errors/app-error";

const statusLabels: Record<KnowledgeNoteStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã công bố",
  UNPUBLISHED: "Đã ẩn",
  ARCHIVED: "Lưu trữ",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  // LocalDateTime from Spring has no timezone; keep SSR/client rendering identical.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? match[3] + "/" + match[2] + "/" + match[1] : "—";
}

export function TeacherKnowledgeNoteManagement() {
  const [inputSearch, setInputSearch] = useState("");
  const [search, setSearch] = useState("");
  const [gradeId, setGradeId] = useState<number | undefined>();
  const [status, setStatus] = useState<KnowledgeNoteStatus | undefined>();
  const [linked, setLinked] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(inputSearch.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [inputSearch]);

  const gradesQuery = useQuery({
    queryKey: ["teacher", "grades", "active"],
    queryFn: async () => {
      const response = await gradeService.list();
      if (!Array.isArray(response.data)) throw new Error("Không thể tải danh sách khối lớp.");
      return response.data;
    },
  });

  const filters: TeacherKnowledgeNoteListFilters = {
    page,
    size,
    ...(search ? { search } : {}),
    ...(gradeId !== undefined ? { gradeId } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(linked !== undefined ? { linked } : {}),
  };
  const notesQuery = useTeacherKnowledgeNotes(filters);
  const notes = notesQuery.data?.items ?? [];
  const gradeNames = useMemo(
    () => new Map((gradesQuery.data ?? []).map((grade) => [grade.id, grade.name])),
    [gradesQuery.data],
  );
  const hasFilters = Boolean(inputSearch.trim() || gradeId || status || linked !== undefined);
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f

  const columns: DataTableColumn<KnowledgeNote>[] = [
    {
      id: "title",
<<<<<<< HEAD
      header: "Bài viết",
      width: "38%",
      cell: (note) => (
        <div className="min-w-0">
          <Link
            href={`/teacher/knowledge-notes/${note.id}`}
            className="font-bold text-foreground hover:text-primary hover:underline"
          >
            {note.title}
          </Link>

          {note.description && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {note.description}
            </p>
=======
      header: "Bài lý thuyết",
      width: "36%",
      cell: (note) => (
        <div className="min-w-0 space-y-1">
          <Link
            href={`/teacher/content/knowledge-notes/${note.id}`}
            className="block font-semibold text-foreground hover:text-primary hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {note.title}
          </Link>
          {note.description && (
            <p className="line-clamp-2 max-w-xl text-xs text-muted-foreground">{note.description}</p>
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
          )}
        </div>
      ),
    },
    {
      id: "grade",
<<<<<<< HEAD
      header: "Khối",
      cell: (note) =>
        gradeNames.get(note.gradeId) ?? `ID ${note.gradeId}`,
    },
    {
      id: "topics",
      header: "Topic",
      cell: (note) => (
        <span className="tabular-nums">
          {note.linkedTopicCount}
        </span>
      ),
=======
      header: "Khối lớp",
      cell: (note) => gradeNames.get(note.gradeId) ?? `ID ${note.gradeId}`,
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
    },
    {
      id: "status",
      header: "Trạng thái",
<<<<<<< HEAD
      cell: (note) => (
        <StatusBadge
          status={note.status}
          label={statusLabels[note.status]}
          tone={
            note.status === "UNPUBLISHED"
              ? "neutral"
              : undefined
          }
        />
      ),
    },
    {
      id: "updatedAt",
      header: "Cập nhật",
      cell: (note) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDateTime(note.updatedAt, "vi-VN")}
        </span>
      ),
    },
    {
      id: "actions",
=======
      cell: (note) => <StatusBadge status={note.status} label={statusLabels[note.status]} />,
    },
    {
      id: "linkedTopics",
      header: "Topic",
      cell: (note) => <span className="font-medium tabular-nums">{note.linkedTopicCount}</span>,
    },
    {
      id: "updated",
      header: "Cập nhật",
      cell: (note) => (
        <time dateTime={note.updatedAt} className="whitespace-nowrap text-muted-foreground">
          {formatDate(note.updatedAt)}
        </time>
      ),
    },
    {
      id: "action",
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
      header: <span className="sr-only">Hành động</span>,
      align: "right",
      cell: (note) => (
        <Link
<<<<<<< HEAD
          href={`/teacher/knowledge-notes/${note.id}/edit`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
        >
          <Pencil className="size-4" />
          Soạn bài
=======
          href={`/teacher/content/knowledge-notes/${note.id}`}
          className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Xem chi tiết
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
        </Link>
      ),
    },
  ];

<<<<<<< HEAD
  return (
    <TeacherKnowledgeNoteLayout
      title="Bài lý thuyết"
      description="Quản lý học liệu độc lập, có thể dùng lại ở nhiều Topic."
    >
      <TeacherListToolbar
        search={
        <form
          onSubmit={submitSearch}
          className="flex min-w-0 flex-1 gap-2"
        >
          <Input
            aria-label="Tìm bài lý thuyết"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Tìm theo tiêu đề hoặc mô tả…"
            className="h-10"
          />

          {/* <Button
            type="submit"
            variant="outline"
            className="h-10"
          >
            <Search />
            Tìm
          </Button> */}
        </form>
        }
        filters={
        <>
          <Select
            value={
              filters.gradeId
                ? String(filters.gradeId)
                : "all"
            }
            onValueChange={(value) =>
              updateFilters({
                gradeId:
                  value === "all"
                    ? undefined
                    : Number(value),
              })
            }
          >
            <SelectTrigger
              className="h-10 min-w-40"
              aria-label="Lọc theo khối"
            >
              <SelectValue placeholder="Tất cả khối" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                Tất cả khối
              </SelectItem>

              {grades.map((grade) => (
                <SelectItem
                  key={grade.id}
                  value={String(grade.id)}
                >
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) =>
              updateFilters({
                status:
                  value === "all"
                    ? undefined
                    : (value as KnowledgeNoteStatus),
              })
            }
          >
            <SelectTrigger
              className="h-10 min-w-40"
              aria-label="Lọc trạng thái"
            >
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                Tất cả trạng thái
              </SelectItem>

              {Object.entries(statusLabels).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={
              filters.linked === undefined
                ? "all"
                : String(filters.linked)
            }
            onValueChange={(value) =>
              updateFilters({
                linked:
                  value === "all"
                    ? undefined
                    : value === "true",
              })
            }
          >
            <SelectTrigger
              className="h-10 min-w-40"
              aria-label="Lọc liên kết Topic"
            >
              <SelectValue placeholder="Liên kết Topic" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                Mọi liên kết
              </SelectItem>
              <SelectItem value="true">
                Đã liên kết
              </SelectItem>
              <SelectItem value="false">
                Chưa liên kết
              </SelectItem>
            </SelectContent>
          </Select>
        </>
        }
        actions={
        <>
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={clearFilters}
        >
          <RotateCcw />
          Đặt lại
        </Button>

        <Button
          type="button"
          className="h-10"
          onClick={() => setCreateDialogOpen(true)}
        >
          <FilePlus2 />
          Tạo bài mới
        </Button>
        </>
        }
      />

      {/* Shared DataTable */}
      <section
        aria-label="Danh sách bài lý thuyết"
        className="mt-5"
      >
        <DataTable
          data={page?.items ?? []}
          columns={columns}
          getRowKey={(note) => note.id}
          minWidth="760px"
          isLoading={notesQuery.isPending}
          className="rounded-xl border-2 border-ink shadow-pop"
          loadingState={
            <RegionState
              variant="loading"
              title="Đang tải danh sách…"
              description="Đang lấy dữ liệu từ server."
            />
          }
          errorState={
            notesQuery.isError ? (
              <RegionState
                variant="error"
                title="Không thể tải danh sách"
                description="Kiểm tra kết nối rồi thử lại."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void notesQuery.refetch()
                    }
                  >
                    Thử lại
                  </Button>
                }
              />
            ) : undefined
          }
          emptyState={
            <RegionState
              variant="empty"
              title={
                hasFilters
                  ? "Không có kết quả phù hợp"
                  : "Chưa có bài lý thuyết"
              }
              description={
                hasFilters
                  ? "Thử thay đổi hoặc đặt lại bộ lọc."
                  : "Tạo bài đầu tiên để bắt đầu biên soạn."
              }
              action={
                hasFilters ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() =>
                      setCreateDialogOpen(true)
                    }
                  >
                    <FilePlus2 />
                    Tạo bài mới
                  </Button>
                )
              }
            />
          }
          pagination={
            page && page.items.length > 0
              ? {
                  page: page.page,
                  totalPages: page.totalPages,
                  totalElements: page.totalElements,
                  pageSize: page.size,
                  pageSizeOptions: [10, 20, 50],

                  totalLabel: `Tổng: ${page.totalElements} bài`,
                  showLabel: "Hiển thị",
                  perPageLabel: "bài/trang",
                  previousLabel: "Trang trước",
                  nextLabel: "Trang sau",

                  onPageChange: (nextPage) =>
                    setFilters((current) => ({
                      ...current,
                      page: nextPage,
                    })),

                  onPageSizeChange: (nextSize) =>
                    setFilters((current) => ({
                      ...current,
                      size: nextSize,
                      page: 1,
                    })),
                }
              : undefined
          }
        />
      </section>

      <TeacherKnowledgeNoteCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
=======
  const resetFilters = () => {
    setInputSearch("");
    setSearch("");
    setGradeId(undefined);
    setStatus(undefined);
    setLinked(undefined);
    setPage(1);
  };

  return (
    <TeacherKnowledgeNoteLayout
      title="Sổ tay kiến thức"
      description="Quản lý các bài lý thuyết theo khối lớp. Một bài có thể sử dụng ở nhiều Topic."
      actions={
        <Link
          href="/teacher/content/knowledge-notes/new"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="size-4" aria-hidden="true" />
          Tạo bài lý thuyết
        </Link>
      }
    >
      {gradesQuery.isError && (
        <PageBanner
          tone="error"
          message={toAppError(gradesQuery.error).message}
          action={<Button type="button" variant="outline" onClick={() => void gradesQuery.refetch()}>Thử lại</Button>}
        />
      )}

      <section aria-label="Lọc bài lý thuyết" className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
          Tìm kiếm và lọc
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Tìm kiếm Knowledge Note"
              placeholder="Tìm tên hoặc mô tả..."
              value={inputSearch}
              onChange={(event) => setInputSearch(event.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <select
            aria-label="Lọc theo khối lớp"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={gradeId ?? ""}
            onChange={(event) => { setGradeId(event.target.value ? Number(event.target.value) : undefined); setPage(1); }}
          >
            <option value="">Tất cả khối</option>
            {(gradesQuery.data ?? []).map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
          </select>
          <select
            aria-label="Lọc theo trạng thái"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={status ?? ""}
            onChange={(event) => { setStatus((event.target.value || undefined) as KnowledgeNoteStatus | undefined); setPage(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select
            aria-label="Lọc theo liên kết Topic"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={linked === undefined ? "" : String(linked)}
            onChange={(event) => {
              setLinked(event.target.value === "" ? undefined : event.target.value === "true");
              setPage(1);
            }}
          >
            <option value="">Tất cả liên kết</option>
            <option value="true">Đã gắn Topic</option>
            <option value="false">Chưa gắn Topic</option>
          </select>
        </div>
        {hasFilters && (
          <button type="button" onClick={resetFilters} className="mt-3 text-xs font-semibold text-primary hover:underline">
            Xóa bộ lọc
          </button>
        )}
      </section>

      <section aria-label="Danh sách Knowledge Note" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <BookOpenText className="size-5 text-primary" aria-hidden="true" />
            Danh sách bài lý thuyết
          </h2>
          {notesQuery.data && (
            <span className="text-sm text-muted-foreground">
              {notesQuery.data.totalElements} bài
            </span>
          )}
        </div>
        <DataTable
          data={notes}
          columns={columns}
          getRowKey={(note) => note.id}
          minWidth="740px"
          className="rounded-xl border border-border shadow-none"
          isLoading={notesQuery.isPending}
          errorState={notesQuery.isError ? (
            <RegionState
              variant="error"
              title="Không tải được danh sách"
              description={toAppError(notesQuery.error).message}
              action={<Button variant="outline" type="button" onClick={() => void notesQuery.refetch()}>Thử lại</Button>}
            />
          ) : undefined}
          emptyState={(
            <RegionState
              variant="empty"
              title={hasFilters ? "Không tìm thấy bài phù hợp" : "Chưa có bài lý thuyết"}
              description={hasFilters ? "Thử thay đổi từ khóa hoặc bộ lọc." : "Tạo bài lý thuyết đầu tiên để bắt đầu xây dựng thư viện."}
              action={hasFilters ? (
                <Button type="button" variant="outline" onClick={resetFilters}>Xóa bộ lọc</Button>
              ) : (
                <Link href="/teacher/content/knowledge-notes/new" className="font-semibold text-primary hover:underline">Tạo bài lý thuyết</Link>
              )}
            />
          )}
          pagination={notesQuery.data ? {
            page: notesQuery.data.page,
            totalPages: notesQuery.data.totalPages,
            totalElements: notesQuery.data.totalElements,
            pageSize: notesQuery.data.size,
            pageSizeOptions: [10, 20, 50],
            totalLabel: `Tổng: ${notesQuery.data.totalElements} bài`,
            showLabel: "Hiển thị",
            perPageLabel: "bài/trang",
            previousLabel: "Trước",
            nextLabel: "Sau",
            onPageChange: setPage,
            onPageSizeChange: (next) => { setSize(next); setPage(1); },
          } : undefined}
        />
      </section>
>>>>>>> c6e0783e4ccd11d570c1b9692e8ab4abe2a29a9f
    </TeacherKnowledgeNoteLayout>
  );
}
