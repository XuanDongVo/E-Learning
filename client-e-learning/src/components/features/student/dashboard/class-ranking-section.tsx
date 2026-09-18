"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardMember } from "@/types";
import { cn } from "@/lib/utils";

interface ClassRankingSectionProps {
  members: LeaderboardMember[];
}

export function ClassRankingSection({ members }: ClassRankingSectionProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />;
      case 2:
        return <Trophy className="h-4 w-4 fill-[#D97706] text-[#D97706]" />;
      case 3:
        return (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4F46E5] text-white text-[10px] font-bold">
            3
          </div>
        );
      default:
        return (
          <span className="text-xs font-bold text-[#64748B] w-4 text-center">
            {rank}
          </span>
        );
    }
  };

  return (
    <Card id="ranking" className="border border-[#F1F5F9] bg-white shadow-2xs flex-1 flex flex-col overflow-hidden">
      <div className="p-4 lg:p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-[#0F172A]">
            Class Ranking
          </h2>
          <Link
            href="/student/progress#ranking"
            className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Top 5 list */}
        <div className="space-y-1.5">
          {members.slice(0, 5).map((member) => {
            const isRank3 = member.rank === 3;

            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl px-3 py-2 transition-all",
                  isRank3
                    ? "bg-[#EEF2FF] border border-[#C7D2FE]/70"
                    : "hover:bg-[#F8FAFC]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 flex justify-center shrink-0">
                    {getRankIcon(member.rank)}
                  </div>
                  <Avatar className="h-7 w-7 border border-white shrink-0">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "text-xs truncate",
                      isRank3
                        ? "font-extrabold text-[#4F46E5]"
                        : "font-semibold text-[#0F172A]"
                    )}
                  >
                    {member.name}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#0F172A] shrink-0">
                  {new Intl.NumberFormat().format(member.xp)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
