"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  GraduationCap,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { mockClasses, mockGrades } from "@/mock/mock-teacher-classes";
import { ClassResponse, Grade } from "@/types/teacher/teacher-class";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateClassDialog } from "@/components/features/teacher/classes/create-class-dialog";
import { TeacherPageHeader } from "@/components/features/teacher/shared/teacher-page-header";
import { classService } from "@/services/class.service";
import { Class } from "@/types/class";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { ClassesToolbar } from "@/components/features/teacher/classes/classes-toolbar";

export default function TeacherClassesPage() {
  const t = useTranslations("teacher.classes");
  const tErrors = useTranslations("errors");
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<ClassResponse[]>(mockClasses);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "ARCHIVED"
  >("ALL");

  // State Modal Tạo/Sửa lớp
  const [editingClass, setEditingClass] = useState<ClassResponse | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    gradeId: 1,
    academicYear: "2026-2027",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [isCreating, setIsCreating] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = classes.filter((c) => {
    const matchSearch = c.name
      .toLowerCase()
      .includes(search.toLowerCase().trim());
    const matchGrade =
      gradeFilter === "all" || String(c.grade.id) === gradeFilter;
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  });

  const openCreate = () => {
    setEditingClass(null);
    setFormData({ ...formData, gradeId: Number(grades[0]?.id ?? "") });
    setIsCreating(true);
  };

  const openEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      gradeId: Number(classItem.grade.id),
      academicYear: classItem.academicYear,
    });
  };

    const loadClasses = async () => {
    setIsLoading(true);
    try {
      const response = await classService.list();
      setClasses(response.data ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        getAppErrorMessage(loadError, tErrors as (key: string) => string),
      );
    } finally {
      setIsLoading(false);
    }
  };


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingClass) {
        const response = await classService.update(editingClass.id, {
          name: formData.name,
          gradeId: Number(formData.gradeId),
          academicYear: formData.academicYear,
        });
        setClasses((current) =>
          current.map((item) =>
            item.id === editingClass.id ? (response.data as Class) : item,
          ),
        );
      } else {
        const response = await classService.create({
          name: formData.name,
          gradeId: Number(formData.gradeId),
          academicYear: formData.academicYear,
        });
        setClasses((current) =>
          [...current, response.data as Class].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      }
      setIsCreating(false);
      setEditingClass(null);
      setError(null);
    } catch (saveError) {
      setError(
        getAppErrorMessage(saveError, tErrors as (key: string) => string),
      );
    } finally {
      setIsSaving(false);
    }
  }

  const handleArchiveToggle = (id: number) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" }
          : c,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TeacherPageHeader
        title="Classes"
        description="Track due dates, submissions to grade, and progress across classes."
        pipoMood="wave"
      />

      <ClassesToolbar
        query={query}
        gradeFilter={gradeFilter}
        grades={grades}
        onQueryChange={setQuery}
        onGradeChange={setGradeFilter}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-body font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            {t("createClass")}
          </button>
        }
      />
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-body text-red-700"
        >
          <span>{error}</span>
          <button
            onClick={() => void loadClasses()}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid danh sách lớp */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <GraduationCap className="mx-auto size-10 text-muted-foreground opacity-40" />
          <h3 className="mt-3 text-base font-extrabold">
            Không tìm thấy lớp học
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Thử đổi từ khóa hoặc bộ lọc tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <ClassCard
              key={c.id}
              cls={c}
              onEdit={() => {}}
              onArchiveToggle={handleArchiveToggle}
            />
          ))}
        </div>
      )}

      {/* Dialog Tạo / Sửa lớp học */}
      {(isCreating || editingClass) && (
        <CreateClassDialog
          grades={grades}
          form={formData}
          mode={editingClass ? "edit" : "create"}
          isSaving={isSaving}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsCreating(false);
            setEditingClass(null);
          }}
        />
      )}
    </div>
  );
}

interface ClassItem {
  id: number;
  name: string;
  grade: {
    id: number;
    code: string;
    name: string;
    displayOrder?: number;
  };
  academicYear: string;
  studentCount: number;
  status: "ACTIVE" | "ARCHIVED";
}

interface ClassCardProps {
  cls: ClassItem;
  onEdit?: (cls: ClassItem) => void;
  onArchiveToggle?: (id: number) => void;
}

export function ClassCard({ cls, onEdit, onArchiveToggle }: ClassCardProps) {
  const isArchived = cls.status === "ARCHIVED";

  // Lấy mã lớp ngắn gọn (ví dụ "6B", "7A"), tối đa 3 ký tự để avatar luôn vuông vắn
  const shortCode =
    cls.name.match(/\b\d+[A-Za-z]?\b/)?.[0] ||
    cls.grade.code ||
    cls.name.slice(0, 3);

  return (
    <article className="group flex flex-col justify-between rounded-xl border-2 border-ink bg-card p-5 shadow-pop transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div>
        {/* Hàng 1: Avatar mã lớp & (Badge + Menu thao tác) */}
        <div className="flex items-center justify-between gap-2">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-base font-extrabold text-primary transition-transform group-hover:scale-105">
            {shortCode}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isArchived
                  ? "bg-muted text-muted-foreground"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isArchived ? "Đã lưu trữ" : "Đang học"}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Thao tác lớp học"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-xs font-semibold"
                >
                  <Link href={`/teacher/classes/${cls.id}`}>
                    <BookOpen className="mr-2 size-3.5" /> Xem chi tiết
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {}}
                  className="cursor-pointer text-xs font-semibold"
                >
                  <Pencil className="mr-2 size-3.5" /> Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {}}
                  className={`cursor-pointer text-xs font-semibold ${
                    isArchived
                      ? "text-primary"
                      : "text-amber-600 focus:text-amber-600"
                  }`}
                >
                  <Archive className="mr-2 size-3.5" />
                  {isArchived ? "Khôi phục lớp" : "Lưu trữ lớp"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Hàng 2: Tên lớp và Khối học */}
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {cls.grade.name} · {cls.grade.code}
          </p>
          <h2 className="mt-0.5 truncate text-lg font-extrabold text-foreground transition-colors group-hover:text-primary">
            {cls.name}
          </h2>
        </div>

        {/* Hàng 3: Năm học */}
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0 text-muted-foreground/80" />
          <span>Năm học {cls.academicYear}</span>
        </div>
      </div>

      {/* Footer card: Sĩ số & Nút Vào lớp */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
          <Users className="size-4 shrink-0 text-primary" />
          <span>
            <strong className="text-foreground">{cls.studentCount}</strong> học
            sinh
          </span>
        </div>

        <Button
          size="sm"
          className="h-8 rounded-lg font-bold text-xs shadow-none"
        >
          <Link href={`/teacher/classes/${cls.id}`}>Vào lớp →</Link>
        </Button>
      </div>
    </article>
  );
}
