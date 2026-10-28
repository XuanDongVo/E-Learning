import { Sparkles } from "lucide-react";
import { Pipo } from "./student-foundation";

interface AssignmentHeroProps {
  todoCount: number;
}

export function AssignmentHero({ todoCount }: AssignmentHeroProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-3xl border-2 border-foreground bg-warm-soft p-5 sm:p-7 shadow-pop-lg">
      <div className="shrink-0">
        <Pipo
          mood={todoCount > 0 ? "wave" : "celebrate"}
          size={110}
          stage={1}
        />
      </div>
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary-hover">
          <Sparkles size={15} />
          Your assignments
        </span>
        <h1 className="my-1.5 text-2xl sm:text-3xl font-extrabold leading-snug">
          {todoCount > 0 ? (
            <>
              You have{" "}
              <mark className="rounded-lg bg-accent-soft px-2 py-0.5 text-foreground shadow-[inset_0_-6px_0_rgba(240,168,28,0.35)]">
                {todoCount} assignments
              </mark>{" "}
              waiting!
            </>
          ) : (
            "All done — great job!"
          )}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Pick one, focus, and show what you know.
        </p>
      </div>
    </header>
  );
}
