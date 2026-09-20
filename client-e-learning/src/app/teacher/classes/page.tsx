"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Building2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { classService } from "@/services/class.service";
import { gradeService } from "@/services/grade.service";
import type { Class } from "@/types/class";
import type { Grade } from "@/types/grade";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gradeId: "",
    academicYear: "2026 - 2027",
  });

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const response = await classService.list();
      setClasses(response.data ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load classes",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const [classesResponse, gradesResponse] = await Promise.all([
          classService.list(),
          gradeService.list(),
        ]);
        if (active) {
          const availableGrades = gradesResponse.data ?? [];
          setClasses(classesResponse.data ?? []);
          setGrades(availableGrades);
          setForm((current) => ({
            ...current,
            gradeId: current.gradeId || String(availableGrades[0]?.id ?? ""),
          }));
          setError(null);
          setIsLoading(false);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load classes and grades",
          );
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(query.toLowerCase()) &&
    (gradeFilter === "all" || String(classItem.grade.id) === gradeFilter),
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await classService.create({
        name: form.name,
        gradeId: Number(form.gradeId),
        academicYear: form.academicYear,
      });
      setClasses((current) =>
        [...current, response.data as Class].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setForm({
        name: "",
        gradeId: String(grades[0]?.id ?? ""),
        academicYear: "2026 - 2027",
      });
      setIsCreating(false);
      setError(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to create class",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            Teacher workspace
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Classes
          </h1>
          <p className="mt-2 text-sm text-neutral-muted">
            Organize your classes and keep each learner connected.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Create class
        </button>
      </div>
      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border-color bg-card-bg p-4 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-subtle" />
          <input
            aria-label="Search classes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search classes..."
            className="h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-background-app pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="sm:w-48">
          <span className="sr-only">Filter by grade</span>
          <select
            aria-label="Filter by grade"
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
            className="h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-background-app px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">All grades</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
      {isLoading ? (
        <div className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-10 text-center text-sm text-neutral-muted">
          Loading classes...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-border-color bg-card-bg p-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm font-bold">No classes yet</p>
          <p className="mt-1 text-sm text-neutral-muted">
            Create your first class to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((classItem) => (
            <article
              key={classItem.id}
              className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-light text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <button
                  aria-label={`More options for ${classItem.name}`}
                  className="text-neutral-subtle hover:text-primary"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              <h2 className="mt-5 text-lg font-extrabold">{classItem.name}</h2>
              <p className="mt-1 text-sm text-neutral-muted">
                {classItem.grade.name} · {classItem.studentCount} students
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-border-color pt-4 text-xs font-bold text-neutral-muted">
                <span>{classItem.academicYear}</span>
                <span className="text-primary">View class</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-dark/30 p-5">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-[var(--radius-lg)] bg-card-bg p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Create class</h2>
                <p className="mt-1 text-sm text-neutral-muted">
                  Add a class to your teaching workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                aria-label="Close"
                className="text-xl text-neutral-muted"
              >
                ×
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-bold">
                Class name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-border-color px-3 text-sm outline-none focus:border-primary"
                  placeholder="6A"
                />
              </label>
              <label className="block text-sm font-bold">
                Grade
                <select
                  required
                  value={form.gradeId}
                  onChange={(event) =>
                    setForm({ ...form, gradeId: event.target.value })
                  }
                  disabled={grades.length === 0}
                  className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-border-color bg-card-bg px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="" disabled>Select a grade</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-bold">
                Academic year
                <input
                  required
                  value={form.academicYear}
                  onChange={(event) =>
                    setForm({ ...form, academicYear: event.target.value })
                  }
                  className="mt-2 h-10 w-full rounded-[var(--radius-md)] border border-border-color px-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Create class"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
