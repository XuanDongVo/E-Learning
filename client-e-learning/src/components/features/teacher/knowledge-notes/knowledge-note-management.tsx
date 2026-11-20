
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

  const columns: DataTableColumn<KnowledgeNote>[] = [
    {
      id: "title",
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
          )}
        </div>
      ),
    },
    {
      id: "grade",
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
    },
    {
      id: "status",
      header: "Trạng thái",
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
      header: <span className="sr-only">Hành động</span>,
      align: "right",
      cell: (note) => (
        <Link
          href={`/teacher/knowledge-notes/${note.id}/edit`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
        >
          <Pencil className="size-4" />
          Soạn bài
        </Link>
      ),
    },
  ];

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
    </TeacherKnowledgeNoteLayout>
  );
}
