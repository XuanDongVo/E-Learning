import Link from "next/link";
import { BarChart2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProgressPlaceholderPage() {
  return <div className="mx-auto max-w-7xl space-y-6 p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><BarChart2 className="h-5 w-5" /></div><div><h1 className="text-2xl font-extrabold text-neutral-dark">Progress & Leaderboard</h1><p className="text-sm text-neutral-muted">Learning Analytics & XP Breakdown</p></div></div><div className="space-y-3 rounded-2xl border border-border-color bg-card-bg p-8 text-center"><p className="text-neutral-muted">Module Progress đang sẵn sàng để triển khai tiếp theo.</p><Link href="/student"><Button variant="secondary" className="gap-2"><ArrowLeft className="h-4 w-4" /> Quay lại Dashboard</Button></Link></div></div>;
}