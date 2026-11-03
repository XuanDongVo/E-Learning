"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/services/dashboard.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { DashboardHeader } from "./dashboard-header";
import { AssignmentsSection } from "./assignments-section";
import { ContinueLearningSection } from "./continue-learning-section";
import { RecentResultsSection } from "./recent-results-section";
import { ClassRankingSection } from "./class-ranking-section";
import { MascotBanner } from "./mascot-banner";
import { FullPageState, RegionState } from "@/components/feedback";
import { Button } from "@/components/ui/button";

export function DashboardView() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: fetchDashboardData,
  });

  if (isLoading) {
    return <FullPageState variant="loading" />;
  }

  if (isError || !data) {
    return (
      <RegionState
        variant="error"
        action={
          <Button type="button" variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader user={data.user} />

      {/* Row 1: Assignments + Continue Learning — Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row lg:flex-[2.5] gap-4 min-h-0">
        <div className="w-full lg:w-5/12 flex flex-col min-h-0">
          <AssignmentsSection assignments={data.assignments} />
        </div>
        <div className="w-full lg:w-7/12 flex flex-col min-h-0">
          <ContinueLearningSection units={data.continueUnits} />
        </div>
      </div>

      {/* Row 2: Results + Ranking + Mascot — Stack on mobile, 3 columns on desktop */}
      <div className="flex flex-col lg:flex-row lg:flex-[2] gap-4 min-h-0">
        <div className="w-full lg:w-5/12 flex flex-col min-h-0">
          <RecentResultsSection results={data.recentResults} />
        </div>
        <div className="w-full lg:w-4/12 flex flex-col min-h-0">
          <ClassRankingSection members={data.leaderboard} />
        </div>
        <div className="w-full lg:w-3/12 flex flex-col min-h-0">
          <MascotBanner />
        </div>
      </div>
    </div>
  );
}
