import { UnitDetailView } from "@/components/features/student/units/unit-detail-view";

export default async function StudentUnitDetailPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  return <UnitDetailView unitId={Number(unitId)} />;
}
