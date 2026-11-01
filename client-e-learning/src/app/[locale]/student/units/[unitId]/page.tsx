import { UnitDetailView } from "@/components/features/student/units/unit-detail-view";

export default async function StudentUnitDetailPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-6 max-w-[1440px] mx-auto pb-24 sm:pb-20 lg:pb-4 lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <UnitDetailView unitId={Number(unitId)} />;
    </div>
  );
}
