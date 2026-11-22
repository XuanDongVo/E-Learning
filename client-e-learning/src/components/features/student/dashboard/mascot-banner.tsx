"use client";

import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { StudentIllustration } from "@/components/student-ui/visuals/student-illustration";
import { StudentDoodle } from "@/components/student-ui/visuals/student-doodle";

export function MascotBanner() {
  return (
    <Card className="relative overflow-hidden border-2 border-ink/15 bg-card p-4 sm:p-5 shadow-2xs h-full flex flex-col items-center justify-between text-center min-h-[220px]">
      {/* Decorative Sparkles & Doodles */}
      <div className="absolute top-3 left-3 text-primary opacity-60">
        <Sparkles className="h-4 w-4" />
      </div>
      <StudentDoodle id="doodle.star-sticker" className="absolute top-2 right-2 w-7 sm:w-8 opacity-75 pointer-events-none" />

      {/* Slogan */}
      <div className="relative z-10 pt-1">
        <h3 className="text-body-sm sm:text-body font-extrabold text-primary tracking-tight leading-snug">
          Small steps
          <br />
          make big progress!
        </h3>
      </div>

      {/* Approved First-Party SVG Visual */}
      <div className="relative my-auto flex items-center justify-center py-2">
        <StudentIllustration
          id="scene.study-desk"
          decorative
          className="w-32 sm:w-40 transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Bottom subtle bar */}
      <div className="text-caption font-bold text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full border border-border shadow-2xs">
        Keep learning today! 🎯
      </div>
    </Card>
  );
}
