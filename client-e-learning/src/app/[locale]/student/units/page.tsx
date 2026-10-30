import { UnitsView } from "@/components/features/student/units/units-view";

export default function StudentUnitsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-6 max-w-[1440px] mx-auto pb-24 sm:pb-20 lg:pb-4 lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <UnitsView />
    </div>
  );
}
