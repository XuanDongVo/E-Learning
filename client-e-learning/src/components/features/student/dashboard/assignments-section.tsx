"use client";

import Link from "next/link";
import { BookOpen, FileCode2, BookMarked, ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssignmentOverview } from "@/types";

interface AssignmentsSectionProps {
  assignments: AssignmentOverview[];
}

export function AssignmentsSection({ assignments }: AssignmentsSectionProps) {
  const getItemConfig = (index: number, skill: string) => {
    if (index === 0) {
      return {
        icon: BookOpen,
        bg: "bg-[#FFEDD5]",
        border: "border-[#FED7AA]",
        text: "text-[#EA580C]",
        buttonVariant: "primary" as const,
        buttonText: "Start",
      };
    }
    if (index === 1) {
      return {
        icon: FileCode2,
        bg: "bg-[#F3E8FF]",
        border: "border-[#E9D5FF]",
        text: "text-[#9333EA]",
        buttonVariant: "primary" as const,
        buttonText: "Start",
      };
    }
    return {
      icon: BookMarked,
      bg: "bg-[#E0F2FE]",
      border: "border-[#BAE6FD]",
      text: "text-[#0284C7]",
      buttonVariant: "secondary" as const,
      buttonText: "View",
    };
  };

  return (
    <Card className="border border-border-color bg-white shadow-2xs flex-1 flex flex-col overflow-hidden">
      <div className="p-4 lg:p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-neutral-dark">
            Your Assignments
          </h2>
          <Link
            href="/assignments"
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* List of 3 items or Empty State */}
        {assignments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#10B981] mb-2.5 shadow-2xs">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-dark">
              No pending assignments!
            </h3>
            <p className="text-xs text-neutral-muted mt-0.5 max-w-[220px]">
              You&apos;re all caught up. Keep up the awesome work! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {assignments.slice(0, 3).map((item, idx) => {
              const config = getItemConfig(idx, item.skill);
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-transparent p-2 transition-all hover:bg-background-app"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.bg} ${config.text}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-neutral-dark truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs font-medium text-neutral-subtle mt-0.5">
                        {item.dueDate} • {item.dueRemainingText}
                      </p>
                    </div>
                  </div>

                  <Link href={`/assignments/${item.id}`} className="shrink-0">
                    <Button
                      size="sm"
                      variant={config.buttonVariant}
                      className="h-9 px-5 rounded-xl text-xs font-bold shadow-xs"
                    >
                      {config.buttonText}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
