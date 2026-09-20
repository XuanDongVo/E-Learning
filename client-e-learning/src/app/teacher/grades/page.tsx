"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { gradeService } from "@/services/grade.service";
import type { CreateGradeRequest, Grade } from "@/types/grade";

const emptyForm = {
  code: "",
  name: "",
  displayOrder: 1,
};

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGradeRequest>(emptyForm);

  const activeGrades = useMemo(
    () => grades.filter((grade) => grade.status !== "INACTIVE"),
    [grades],
  );

  const inactiveGrades = useMemo(
    () => grades.filter((grade) => grade.status === "INACTIVE"),
    [grades],
  );

  const loadGrades = async () => {
    try {
      setIsLoading(true);
      const response = await gradeService.listAll();
      setGrades(response.data ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load grades",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGrades();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.code.trim() || !form.name.trim()) {
      setError("Code and name are required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateGradeRequest = {
        code: form.code.trim(),
        name: form.name.trim(),
        displayOrder: Number(form.displayOrder),
      };

      if (editingId !== null) {
        await gradeService.update(editingId, payload);
      } else {
        await gradeService.create(payload);
      }

      setError(null);
      resetForm();
      await loadGrades();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save grade",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setForm({
      code: grade.code,
      name: grade.name,
      displayOrder: grade.displayOrder,
    });
    setError(null);
  };

  const handleDeactivate = async (gradeId: number) => {
    try {
      await gradeService.deactivate(gradeId);
      await loadGrades();
      setError(null);
    } catch (deactivateError) {
      setError(
        deactivateError instanceof Error
          ? deactivateError.message
          : "Unable to deactivate grade",
      );
    }
  };

  const handleActivate = async (gradeId: number) => {
    try {
      await gradeService.activate(gradeId);
      await loadGrades();
      setError(null);
    } catch (activateError) {
      setError(
        activateError instanceof Error
          ? activateError.message
          : "Unable to activate grade",
      );
    }
  };

  const handleDelete = async (gradeId: number) => {
    const confirmed = window.confirm("Delete this grade? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      await gradeService.delete(gradeId);
      await loadGrades();
      if (editingId === gradeId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete grade",
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            Settings
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Grade management
          </h1>
          <p className="mt-2 text-sm text-neutral-muted">
            Manage grade codes, labels, and ordering for classes and student grouping.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            resetForm();
            setError(null);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {editingId !== null ? "New grade" : "Add grade"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[var(--radius-lg)] border border-border-color bg-card-bg p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">
              {editingId !== null ? "Update grade" : "Create grade"}
            </h2>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-sm font-bold text-neutral-muted hover:text-neutral-dark"
              >
                <XCircle className="h-4 w-4" /> Cancel
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold">
              Grade code
              <input
                required
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value })}
                placeholder="GRADE_6"
                className="mt-2 h-10 w-full rounded-xl border border-border-color bg-background-app px-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold">
              Grade name
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Grade 6"
                className="mt-2 h-10 w-full rounded-xl border border-border-color bg-background-app px-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold">
              Display order
              <input
                required
                type="number"
                min={1}
                value={form.displayOrder}
                onChange={(event) =>
                  setForm({ ...form, displayOrder: Number(event.target.value || 1) })
                }
                className="mt-2 h-10 w-full rounded-xl border border-border-color bg-background-app px-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingId !== null ? "Update" : "Create"}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <section className="rounded-[var(--radius-lg)] border border-border-color bg-card-bg p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                  Active
                </p>
                <h2 className="mt-1 text-xl font-extrabold">Current grades</h2>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                {activeGrades.length} active
              </span>
            </div>

            {isLoading ? (
              <div className="rounded-xl border border-dashed border-border-color p-8 text-center text-sm text-neutral-muted">
                Loading grades...
              </div>
            ) : activeGrades.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-color p-8 text-center text-sm text-neutral-muted">
                No active grades yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activeGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex flex-col gap-3 rounded-xl border border-border-color bg-background-app p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-extrabold">{grade.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-muted">
                          <span>{grade.code}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <ArrowUpDown className="h-3 w-3" />
                            {grade.displayOrder}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => handleEdit(grade)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleDeactivate(grade.id)}>
                        Inactive
                      </Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(grade.id)}>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border-color bg-card-bg p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                  Inactive
                </p>
                <h2 className="mt-1 text-xl font-extrabold">Archived grades</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {inactiveGrades.length} hidden
              </span>
            </div>

            {inactiveGrades.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-color p-6 text-center text-sm text-neutral-muted">
                No archived grade.
              </div>
            ) : (
              <div className="space-y-3">
                {inactiveGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between rounded-xl border border-border-color bg-background-app p-3"
                  >
                    <div>
                      <p className="font-bold text-neutral-muted">{grade.name}</p>
                      <p className="text-xs text-neutral-subtle">{grade.code}</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => handleActivate(grade.id)}>
                      Reactivate
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
