import { Activity, CheckCircle2, Clock3 } from "lucide-react";

const activity = [{ text: "Unit 2 Review was assigned to 6A", time: "12 min ago", icon: Activity }, { text: "18 students completed Grammar Practice", time: "1 hr ago", icon: CheckCircle2 }, { text: "New activity draft needs review", time: "Yesterday", icon: Clock3 }];

export function RecentActivityCard() {
  return (
    <section className="rounded-2xl border-2 border-ink bg-card p-6 shadow-pop">
      <p className="text-body-sm font-bold uppercase tracking-[0.14em] text-neutral-subtle">Keep moving</p>
      <h2 className="mt-1 text-card-title font-extrabold text-foreground">Recent activity</h2>
      <div className="mt-5 space-y-4">
        {activity.map(({ text, time, icon: Icon }) => (
          <div key={text} className="flex items-start gap-3 rounded-xl border border-border/80 bg-background-app/50 p-3 shadow-pop-sm transition hover:bg-card">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-bold leading-5 text-foreground">{text}</p>
              <p className="mt-0.5 text-caption font-semibold text-neutral-muted">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}