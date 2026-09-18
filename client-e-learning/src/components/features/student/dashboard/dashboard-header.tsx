"use client";

import { Bell, Flame, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/types";

interface DashboardHeaderProps {
  user: UserProfile;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Greeting Bar with Bell & Avatar on the Right */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-extrabold text-neutral-dark tracking-tight flex items-center gap-2">
            Hi, {user.name}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm font-medium text-neutral-muted mt-0.5">
            Keep going! You&apos;re doing great!
          </p>
        </div>

        {/* Right side notification & profile */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-border-color text-neutral-muted hover:bg-background-app shadow-2xs transition-colors"
          >
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <Link href="/student/profile">
            <Avatar className="h-10 w-10 border-2 border-white shadow-xs">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* 3 Stat Cards in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Streak Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-border-color bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent">
            <Flame className="h-6 w-6 fill-accent text-accent" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-neutral-dark">
              {user.streakDays} Day Streak
            </div>
            <div className="text-xs font-semibold text-neutral-subtle">
              Keep it up!
            </div>
          </div>
        </div>

        {/* XP Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-border-color bg-white p-4 shadow-2xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent">
            <Star className="h-6 w-6 fill-accent text-accent" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-neutral-dark">
              {new Intl.NumberFormat().format(user.xp)} XP
            </div>
            <div className="text-xs font-semibold text-neutral-subtle">
              Next level: {new Intl.NumberFormat().format(user.nextLevelXp)}
            </div>
          </div>
        </div>

        {/* Class Rank Card */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border-color bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent">
              <Trophy className="h-6 w-6 fill-accent text-accent" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-muted">Class Rank</div>
              <div className="text-sm font-extrabold text-neutral-dark">
                #{user.classRank} / {user.totalStudentsInClass}
              </div>
            </div>
          </div>
          <Link
            href="#ranking"
            className="text-xs font-bold text-neutral-muted hover:text-primary transition-colors whitespace-nowrap"
          >
            View ranking
          </Link>
        </div>
      </div>
    </div>
  );
}
