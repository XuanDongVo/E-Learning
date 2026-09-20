"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Unit } from "@/types";
import { cn } from "@/lib/utils";

interface ContinueLearningSectionProps {
  units: Unit[];
}

export function ContinueLearningSection({ units }: ContinueLearningSectionProps) {
  const getBannerVisual = (index: number, unit?: Unit) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-linear-to-b from-[#E0F2FE] to-[#BAE6FD]/40",
          image:
            unit?.coverImage ||
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&auto=format&fit=crop&q=80",
          badge: "Unit 1",
          progressColor: "bg-[#10B981]",
          progressVal: unit?.progressPercent ?? 75,
          btnText: "Continue",
          btnClassName: "bg-primary text-white hover:bg-primary-hover",
          isLocked: false,
        };
      case 1:
        return {
          bg: "bg-linear-to-b from-[#E0F2FE] to-[#CFFAFE]/50",
          image:
            unit?.coverImage ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&auto=format&fit=crop&q=80",
          badge: "Unit 2",
          progressColor: "bg-primary",
          progressVal: unit?.progressPercent ?? 45,
          btnText: "Continue",
          btnClassName: "bg-primary text-white hover:bg-primary-hover",
          isLocked: false,
        };
      default:
        return {
          bg: "bg-linear-to-b from-[#FEF3C7] to-[#FFEDD5]/50",
          image:
            unit?.coverImage ||
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=80",
          badge: `Unit ${index + 1}`,
          progressColor: "bg-accent",
          progressVal: unit?.progressPercent && unit.progressPercent > 0 ? unit.progressPercent : 10,
          btnText: "Explore",
          btnClassName: "bg-primary-light text-neutral-dark hover:bg-indigo-100",
          isLocked: true,
        };
    }
  };

  return (
    <Card className="border border-border-color bg-white shadow-2xs flex-1 flex flex-col overflow-hidden">
      <div className="p-4 lg:p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-card-title font-extrabold text-neutral-dark">
            Continue Learning
          </h2>
          <Link
            href="/student/units"
            className="text-body-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Unit Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {units.slice(0, 3).map((unit, idx) => {
            const visual = getBannerVisual(idx, unit);

            return (
              <div
                key={unit.id}
                className={cn(
                  "flex flex-col rounded-2xl bg-white transition-all duration-200 group overflow-hidden border border-border-color hover:border-primary hover:shadow-md"
                )}
              >
                {/* Visual Illustration / Image */}
                <div
                  className={`relative h-32 sm:h-28 lg:h-32 xl:h-36 w-full overflow-hidden ${visual.bg} shrink-0`}
                >
                  <Image
                    src={visual.image}
                    alt={unit.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 250px"
                  />

                  {/* Top-left Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-body-sm font-bold tracking-tight shadow-xs bg-white/95 text-neutral-dark border border-white/40"
                      )}
                    >
                      {visual.badge}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-body font-extrabold text-neutral-dark truncate">
                      {unit.title}
                    </h3>
                    <p className="text-body-sm font-medium text-neutral-muted mt-0.5">
                      {unit.totalTopicsCount || (idx === 0 ? 5 : 4)} topics •{" "}
                      {unit.totalActivitiesCount || (idx === 0 ? 20 : idx === 1 ? 18 : 16)} activities
                    </p>
                  </div>

                  {/* Mastery & Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-medium text-neutral-muted">Mastery</span>
                      <span className="font-extrabold text-neutral-dark">
                        {visual.progressVal}%
                      </span>
                    </div>
                    <Progress
                      value={visual.progressVal}
                      indicatorColor={visual.progressColor}
                      className="h-1.5 bg-[#EEF2F6]"
                    />
                  </div>

                  {/* Action Button */}
                  <Link href={`/student/units/${unit.id}`} className="w-full">
                    <Button
                      size="sm"
                      className={cn(
                        "w-full h-9 rounded-xl text-body-sm font-bold shadow-none flex items-center justify-center gap-1.5 transition-all",
                        visual.btnClassName
                      )}
                    >
                      <span>{visual.btnText}</span>
                      {visual.isLocked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
