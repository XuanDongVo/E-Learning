import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { Grade } from "@/types/grade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";

interface ClassForm {
  name: string;
  gradeId: number;
  academicYear: string;
}

interface CreateClassDialogProps {
  grades: Grade[];
  form: ClassForm;
  isSaving: boolean;
  mode?: "create" | "edit";
  onChange: (form: ClassForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function CreateClassDialog({
  grades,
  form,
  isSaving,
  mode = "create",
  onChange,
  onSubmit,
  onClose,
}: CreateClassDialogProps) {
  const t = useTranslations("teacher.classes");
  const editing = mode === "edit";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {editing ? t("editClass") : t("createClass")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editing
                ? t("editClassSubtitle")
                : t("createClassSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-5 text-xs font-bold">
            <div>
              <label
                htmlFor="class-name"
                className="mb-1.5 block text-muted-foreground"
              >
                {t("className")} *
              </label>
              <Input
                id="class-name"
                required
                value={form.name}
                onChange={(event) =>
                  onChange({ ...form, name: event.target.value })
                }
                placeholder="Ví dụ: Lớp 6A"
                className="h-10 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-muted-foreground">
                {t("grade")} *
              </label>
              <Select
                value={form.gradeId ? String(form.gradeId) : undefined}
                onValueChange={(value) =>
                  onChange({ ...form, gradeId: Number(value) })
                }
                disabled={grades.length === 0}
              >
                <SelectTrigger className="h-10 w-full text-sm">
                  <SelectValue placeholder={t("selectGrade")} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.name} ({grade.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="academic-year"
                className="mb-1.5 block text-muted-foreground"
              >
                {t("academicYear")} *
              </label>
              <Input
                id="academic-year"
                required
                value={form.academicYear}
                // onChange={(event) =>
                //   onChange({ ...form, academicYear: event.target.value })
                // }
                placeholder="2026-2027"
                className="h-10 text-sm"
                disabled={editing}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs font-bold"
            >
              {t("cancel")}
            </Button>

            <Button
              type="submit"
              disabled={isSaving || grades.length === 0}
              className="text-xs font-bold"
            >
              <Check className="mr-1 size-3.5" />
              {isSaving
                ? editing
                  ? t("saving")
                  : t("creating")
                : editing
                  ? t("saveChanges")
                  : t("createClass")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}