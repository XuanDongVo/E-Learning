import { Activity, CheckCircle2, Clock3 } from "lucide-react";

const activity = [{ text: "Unit 2 Review was assigned to 6A", time: "12 min ago", icon: Activity }, { text: "18 students completed Grammar Practice", time: "1 hr ago", icon: CheckCircle2 }, { text: "New activity draft needs review", time: "Yesterday", icon: Clock3 }];

export function RecentActivityCard() {
  return <section className="rounded-[var(--radius-md)] border border-border-color bg-card-bg p-5 shadow-sm"><p className="text-body-sm font-bold uppercase tracking-[0.14em] text-neutral-subtle">Keep moving</p><h2 className="mt-1 text-card-title font-extrabold">Recent activity</h2><div className="mt-4 space-y-4">{activity.map(({ text, time, icon: Icon }) => <div key={text} className="flex gap-3"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary"><Icon className="h-3.5 w-3.5" /></span><div><p className="text-body-sm font-bold leading-5">{text}</p><p className="text-body-sm text-neutral-subtle">{time}</p></div></div>)}</div></section>;
}