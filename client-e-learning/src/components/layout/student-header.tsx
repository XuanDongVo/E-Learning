"use client";

import Link from "next/link";
import { Bell, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockCurrentUser } from "@/mock/db";

export function StudentHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:hidden sticky top-0 z-30">
      {/* Brand */}
      <Link href="/student" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-sm shadow-indigo-200">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-ui-lg font-extrabold tracking-tight text-[#0F172A]">
          Learn<span className="text-[#4F46E5]">Up</span>
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#EF4444]" />
        </button>

        <Link href="/student/profile"> 
          <Avatar className="h-9 w-9 border border-indigo-100">
            <AvatarImage src={mockCurrentUser.avatarUrl} alt={mockCurrentUser.name} />
            <AvatarFallback>{mockCurrentUser.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
