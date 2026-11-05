"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { CreateClassDialog } from "@/components/features/teacher/classes/create-class-dialog";
import { ClassesGrid } from "@/components/features/teacher/classes/classes-grid";
import { ClassesHeader } from "@/components/features/teacher/classes/classes-header";
import { ClassesToolbar } from "@/components/features/teacher/classes/classes-toolbar";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { classService } from "@/services/class.service";
import { gradeService } from "@/services/grade.service";
import type { Class } from "@/types/class";
import type { Grade } from "@/types/grade";

export default function TeacherClassesPage() {
  const t = useTranslations("teacher.classes");
  const tErrors = useTranslations("errors");

  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gradeId: 0,
    academicYear: "2026-2027",
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [classesRes, gradesRes] = await Promise.all([
        classService.list(),
        gradeService.list(),
      ]);
      setClasses(classesRes.data ?? []);
      setGrades(gradesRes.data ?? []);
      setError(null);
    } catch (loadError) {
      setError(getAppErrorMessage(loadError, tErrors as (key: string) => string));
    } finally {
      setIsLoading(false);
    }
  }, [tErrors]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return classes.filter((item) => {
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.grade.name.toLowerCase().includes(q);
      const matchGrade =
        gradeFilter === "all" || String(item.grade.id) === gradeFilter;
      return matchSearch && matchGrade;
    });
  }, [classes, query, gradeFilter]);

  const openCreate = () => {
    setEditingClass(null);
    setFormData({
      name: "",
      gradeId: Number(grades[0]?.id ?? 0),
      academicYear: "2026-2027",
    });
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
        const updated = response.data as Class;
        setClasses((current) =>
          current.map((item) => (item.id === editingClass.id ? updated : item)),
        );
      } else {
        const response = await classService.create({
          name: formData.name,
          gradeId: Number(formData.gradeId),
          academicYear: formData.academicYear,
        });
        const created = response.data as Class;
        setClasses((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
      setIsCreating(false);
      setEditingClass(null);
      setError(null);
    } catch (saveError) {
      setError(getAppErrorMessage(saveError, tErrors as (key: string) => string));
    } finally {
      setIsSaving(false);
    }
  }

  const handleArchive = async (classItem: Class) => {
    try {
      if (classItem.status === "ARCHIVED") {
        const response = await classService.restore(classItem.id);
        const restored = response.data as Class;
        setClasses((current) =>
          current.map((item) => (item.id === classItem.id ? restored : item)),
        );
      } else {
        const response = await classService.archive(classItem.id);
        const archived = response.data as Class;
        setClasses((current) =>
          current.map((item) => (item.id === classItem.id ? archived : item)),
        );
      }
      setError(null);
    } catch (archiveError) {
      setError(
        getAppErrorMessage(archiveError, tErrors as (key: string) => string),
      );
    }
  };

  console.log("classes", classes);

  return (
    <div className="space-y-6">
      <ClassesHeader />

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
            type="button"
            onClick={() => void load()}
            className="font-bold underline"
          >
            {t("retry")}
          </button>
        </div>
      )}

      <ClassesGrid
        classes={filtered}
        isLoading={isLoading}
        onEdit={openEdit}
        onArchive={handleArchive}
      />

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
