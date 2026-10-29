import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Class } from "@/types/class";
import { ClassCard } from "./class-card";

interface ClassesGridProps {
  classes: Class[];
  isLoading: boolean;
  onEdit: (classItem: Class) => void;
  onArchive: (classItem: Class) => void;
}

export function ClassesGrid({ classes, isLoading, onEdit, onArchive }: ClassesGridProps) {
  const t = useTranslations("teacher.classes");

  if (isLoading) return <div className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-10 text-center text-body text-neutral-muted">{t("loading")}</div>;
  if (classes.length === 0) return <div className="rounded-[var(--radius-md)] border border-dashed border-border-color bg-card-bg p-10 text-center"><Building2 className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 text-body font-bold">{t("emptyTitle")}</p><p className="mt-1 text-body text-neutral-muted">{t("emptySubtitle")}</p></div>;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{classes.map((classItem) => <ClassCard key={classItem.id} classItem={classItem} onEdit={onEdit} onArchive={onArchive} />)}</div>;
}
