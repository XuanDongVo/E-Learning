import { ArrowUpRight, BarChart3 } from "lucide-react";

const classes = [{ name: "6A", score: 81, delta: "+4.2%" }, { name: "7B", score: 74, delta: "+1.8%" }, { name: "8A", score: 68, delta: "-2.1%" }];

export function ClassPerformanceCard() {
  return (
    <section className="rounded-2xl border-2 border-ink bg-card p-6 shadow-pop">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body-sm font-bold uppercase tracking-[0.14em] text-neutral-subtle">Overview</p>
          <h2 className="mt-1 text-card-title font-extrabold text-foreground">Class performance</h2>
        </div>
        <div className="grid size-9 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-pop-sm">
          <BarChart3 className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {classes.map((item) => (
          <div key={item.name}>
            <div className="mb-1.5 flex items-center justify-between text-body-sm">
              <span className="font-extrabold text-foreground">Class {item.name}</span>
              <span className={item.delta.startsWith("+") ? "font-bold text-success" : "font-bold text-destructive"}>{item.delta}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full border border-border bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${item.score}%` }} />
            </div>
            <p className="mt-1 text-right text-body-sm font-bold text-neutral-muted">{item.score}% average</p>
          </div>
        ))}
      </div>
      <button className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-extrabold text-primary hover:underline">
        View reports <ArrowUpRight className="h-4 w-4" />
      </button>
    </section>
  );
}