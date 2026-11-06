import { StudentRewardsLeaderboard } from "@/features/student/gamification/student-rewards-leaderboard";
import { StudentStreakOverview } from "@/features/student/gamification/student-streak-overview";

export default function StudentRewardsPage() {
  return (
    <div className="space-y-10">
      <StudentStreakOverview />
      <StudentRewardsLeaderboard />
    </div>
  );
}
