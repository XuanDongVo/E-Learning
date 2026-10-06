"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { classService } from "@/services/class.service";
import { gradeService } from "@/services/grade.service";
import type { Class } from "@/types/class";
import type { Grade } from "@/types/grade";
import { ClassesGrid } from "@/components/features/teacher/classes/classes-grid";
import { ClassesHeader } from "@/components/features/teacher/classes/classes-header";
import { ClassesToolbar } from "@/components/features/teacher/classes/classes-toolbar";
import { CreateClassDialog } from "@/components/features/teacher/classes/create-class-dialog";

const emptyForm = { name: "", gradeId: "", academicYear: "2026 - 2027" };

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [classesResponse, gradesResponse] = await Promise.all([classService.list(), gradeService.list()]);
        if (!active) return;
        const availableGrades = gradesResponse.data ?? [];
        setClasses(classesResponse.data ?? []);
        setGrades(availableGrades);
        setForm((current) => ({ ...current, gradeId: current.gradeId || String(availableGrades[0]?.id ?? "") }));
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load classes and grades");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const filteredClasses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return classes.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery) &&
      (gradeFilter === "all" || String(item.grade.id) === gradeFilter)
    );
  }, [classes, query, gradeFilter]);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const response = await classService.list();
      setClasses(response.data ?? []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingClass(null);
    setForm({ ...emptyForm, gradeId: String(grades[0]?.id ?? "") });
    setIsCreating(true);
  };

  const openEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setForm({ name: classItem.name, gradeId: String(classItem.grade.id), academicYear: classItem.academicYear });
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingClass) {
        const response = await classService.update(editingClass.id, { name: form.name, gradeId: Number(form.gradeId), academicYear: form.academicYear });
        setClasses((current) => current.map((item) => item.id === editingClass.id ? response.data as Class : item));
      } else {
        const response = await classService.create({ name: form.name, gradeId: Number(form.gradeId), academicYear: form.academicYear });
        setClasses((current) => [...current, response.data as Class].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsCreating(false);
      setEditingClass(null);
      setError(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save class");
    } finally {
      setIsSaving(false);
    }
  }

  const archiveClass = async (classItem: Class) => {
    if (!window.confirm("Archive " + classItem.name + "?")) return;
    try {
      const response = await classService.archive(classItem.id);
      setClasses((current) => current.map((item) => item.id === classItem.id ? response.data as Class : item));
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Unable to archive class");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ClassesHeader onCreate={openCreate} />
      <ClassesToolbar query={query} gradeFilter={gradeFilter} grades={grades} onQueryChange={setQuery} onGradeChange={setGradeFilter} />
      {error && <div role="alert" className="flex items-center justify-between rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-body text-red-700"><span>{error}</span><button onClick={() => void loadClasses()} className="font-bold underline">Retry</button></div>}
      <ClassesGrid classes={filteredClasses} isLoading={isLoading} onEdit={openEdit} onArchive={archiveClass} />
      {(isCreating || editingClass) && (
        <CreateClassDialog
          grades={grades}
          form={form}
          mode={editingClass ? "edit" : "create"}
          isSaving={isSaving}
          onChange={setForm}
          onSubmit={handleSubmit}
          onClose={() => { setIsCreating(false); setEditingClass(null); }}
        />
      )}
    </div>
  );
}
