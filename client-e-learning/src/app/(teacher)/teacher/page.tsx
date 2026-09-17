import { Card } from "@/components/ui/card";
import { Users, ClipboardList, CheckCircle } from "lucide-react";
import { mockAssignments, mockLeaderboard } from "@/mock/db";

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A]">Class 6A Management</h1>
        <p className="text-sm text-[#64748B]">Overview of active assignments and student progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{mockLeaderboard.length}</div>
            <div className="text-xs text-[#64748B]">Active Students</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#0F172A]">{mockAssignments.length}</div>
            <div className="text-xs text-[#64748B]">Total Assignments</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#0F172A]">92%</div>
            <div className="text-xs text-[#64748B]">Average Completion</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
