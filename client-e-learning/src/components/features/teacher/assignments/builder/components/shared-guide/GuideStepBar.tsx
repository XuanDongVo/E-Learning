import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GuideScenario } from "../../shared-guide";
import { GUIDE_SCENARIOS, GUIDE_STEPS } from "./guide-content";

export function GuideScenarioTabs({ scenario, onChange }: { scenario: GuideScenario; onChange: (scenario: GuideScenario) => void }) {
  return <div className="flex flex-wrap gap-2 border-b bg-muted/30 px-4 py-3">
    {GUIDE_SCENARIOS.map(({ id, label }) => <Button key={id} size="sm" variant={scenario === id ? "default" : "outline"} aria-pressed={scenario === id} onClick={() => onChange(id)}>
      {label}
    </Button>)}
  </div>;
}

export function GuideStepBar({ step, checks, onStep }: { step: number; checks: boolean[]; onStep: (step: number) => void }) {
  return <nav aria-label="Các bước thực hành" className="grid grid-cols-2 gap-2 border-b p-3 sm:grid-cols-3 lg:grid-cols-6">
    {GUIDE_STEPS.map((title, i) => <Button key={title} size="sm" variant="outline" aria-current={step === i ? "step" : undefined} onClick={() => onStep(i)}
      className={cn("h-auto min-h-10 justify-start whitespace-normal text-left text-xs", step === i && "border-primary bg-primary/10 text-primary")}>
      {checks[i] ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <span className="w-4 shrink-0 text-center">{i+1}</span>}
      {title}
    </Button>)}
  </nav>;
}
