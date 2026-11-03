import { useTranslations } from "next-intl";
import type { Class } from "@/types/class";
import { ClassCard } from "./class-card";
import { RegionState } from "@/components/feedback";
import { SkeletonGrid } from "@/components/ui/skeleton/skeleton-grid";

interface ClassesGridProps {
  classes: Class[];
  isLoading: boolean;
  onEdit: (classItem: Class) => void;
  onArchive: (classItem: Class) => void;
}

export function ClassesGrid({ classes, isLoading, onEdit, onArchive }: ClassesGridProps) {
  const t = useTranslations("teacher.classes");

  if (isLoading) return <SkeletonGrid count={6} />;
  if (classes.length === 0) return <RegionState variant="empty" title={t("emptyTitle")} description={t("emptySubtitle")} />;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{classes.map((classItem) => <ClassCard key={classItem.id} classItem={classItem} onEdit={onEdit} onArchive={onArchive} />)}</div>;
}
