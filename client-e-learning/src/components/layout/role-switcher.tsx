"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, GraduationCap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RoleSwitcher() {
  const pathname = usePathname();
  const isTeacherPath = pathname.startsWith("/teacher");

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50">
      <div className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/95 p-1.5 shadow-lg backdrop-blur-md">
        <Link
          href="/student"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-body-sm font-bold transition-all ${
            !isTeacherPath
              ? "bg-[#4F46E5] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Student</span>
        </Link>
        <Link
          href="/teacher"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-body-sm font-bold transition-all ${
            isTeacherPath
              ? "bg-[#06B6D4] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Teacher</span>
        </Link>
      </div>
    </div>
  );
}
