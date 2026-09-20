"use client";

import { Card } from "@/components/ui/card";
import { Headphones, Laptop, Sparkles } from "lucide-react";

export function MascotBanner() {
  return (
    <Card className="relative overflow-hidden border border-[#F1F5F9] bg-linear-to-b from-[#F0F9FF] via-[#E0F2FE]/50 to-[#F8FAFC] p-4 sm:p-5 shadow-2xs h-full flex flex-col items-center justify-between text-center min-h-[220px]">
      {/* Decorative Sparkles */}
      <div className="absolute top-3 left-3 text-[#38BDF8] opacity-60">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="absolute top-4 right-3 text-[#818CF8] opacity-60">
        <Sparkles className="h-3 w-3" />
      </div>

      {/* Slogan */}
      <div className="relative z-10 pt-1">
        <h3 className="text-body-sm sm:text-body font-extrabold text-[#3B82F6] tracking-tight leading-snug">
          Small steps
          <br />
          make big progress!
        </h3>
      </div>

      {/* Stylized Character Illustration */}
      <div className="relative my-auto flex items-center justify-center">
        {/* Desk & Student graphic container */}
        <div className="relative flex flex-col items-center">
          {/* Student Head & Headphones */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#FED7AA] to-[#FDBA74] shadow-sm">
            {/* Headphones */}
            <div className="absolute -top-1 inset-x-0 mx-auto flex justify-between px-1">
              <div className="h-6 w-3 rounded-full bg-[#3B82F6]" />
              <div className="h-6 w-3 rounded-full bg-[#3B82F6]" />
            </div>
            {/* Face details */}
            <span className="text-ui-2xl select-none" role="img" aria-label="Student face">
              🧑‍💻
            </span>
          </div>

          {/* Laptop on desk */}
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-7 w-12 items-center justify-center rounded-lg bg-[#0F172A] text-white shadow-xs">
              <Laptop className="h-4 w-4 text-[#38BDF8]" />
            </div>
            {/* Small plant on desk */}
            <span className="text-body select-none" role="img" aria-label="Plant">
              🪴
            </span>
          </div>
        </div>
      </div>

      {/* Bottom subtle bar */}
      <div className="text-caption font-bold text-[#64748B] bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-sky-100 shadow-2xs">
        Keep learning today! 🎯
      </div>
    </Card>
  );
}
