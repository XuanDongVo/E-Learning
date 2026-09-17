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

export function DashboardView() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: fetchDashboardData,
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-3 animate-pulse p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto lg:h-screen">
        <div className="h-7 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-14 bg-slate-100 rounded-2xl" />
          <div className="h-14 bg-slate-100 rounded-2xl" />
          <div className="h-14 bg-slate-100 rounded-2xl" />
        </div>
        <div className="flex flex-col lg:flex-row lg:flex-[3] gap-4">
          <div className="w-full lg:w-5/12 h-64 lg:h-auto bg-slate-100 rounded-2xl" />
          <div className="w-full lg:w-7/12 h-64 lg:h-auto bg-slate-100 rounded-2xl" />
        </div>
        <div className="flex flex-col lg:flex-row lg:flex-[2] gap-4">
          <div className="w-full lg:w-5/12 h-48 lg:h-auto bg-slate-100 rounded-2xl" />
          <div className="w-full lg:w-4/12 h-48 lg:h-auto bg-slate-100 rounded-2xl" />
          <div className="w-full lg:w-3/12 h-48 lg:h-auto bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-6 max-w-[1440px] mx-auto pb-24 sm:pb-20 lg:pb-4 lg:h-screen lg:max-h-screen lg:overflow-hidden">
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
