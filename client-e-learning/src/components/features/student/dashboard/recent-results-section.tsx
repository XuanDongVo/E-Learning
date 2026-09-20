"use client";

import Link from "next/link";
import { ArrowRight, BookMarked } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RecentResult } from "@/types";

interface RecentResultsSectionProps {
  results: RecentResult[];
}

export function RecentResultsSection({ results }: RecentResultsSectionProps) {
  return (
    <Card className="border border-[#F1F5F9] bg-white shadow-2xs flex-1 flex flex-col overflow-hidden">
      <div className="p-4 lg:p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-card-title font-extrabold text-[#0F172A]">
            Recent Results
          </h2>
          <Link
            href="/student/progress"
            className="text-body-sm font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Results List */}
        <div className="space-y-3.5">
          {results.map((res) => (
            <div
              key={res.id}
              className="flex items-center justify-between gap-2 rounded-2xl border border-transparent bg-transparent p-2 transition-all hover:bg-[#F8FAFC]"
            >
              {/* Left icon and title */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#9333EA]">
                  <BookMarked className="h-5 w-5" />
                </div>
                <h4 className="text-body font-bold text-[#0F172A] truncate">
                  {res.title}
                </h4>
              </div>

              {/* Right metrics: Score, +XP, Timestamp */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <span className="text-body font-extrabold text-[#0F172A] w-12 text-right">
                  {res.score}
                </span>

                <span className="text-body-sm font-extrabold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-lg">
                  {res.xpEarnedText}
                </span>

                <span className="text-body-sm font-medium text-[#94A3B8] w-16 text-right hidden sm:inline-block">
                  {res.timestampText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
