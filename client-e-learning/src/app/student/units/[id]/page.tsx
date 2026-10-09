import { UnitDetailView } from "@/components/features/student/units/unit-detail-view";

export default async function StudentUnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UnitDetailView unitId={Number(id)} />;
}
