"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BookOpen, ClipboardList, LayoutDashboard, Menu, Settings, ShieldCheck, UserRound, Users, X } from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SessionActions } from "@/components/auth/session-actions";

const groups = [
  { label:"Overview", items:[["Dashboard","/teacher",LayoutDashboard]] },
  { label:"Teaching", items:[["Classes","/teacher/classes",Users],["Students",null,UserRound]] },
  { label:"Content", items:[["Content","/teacher/content",BookOpen],["Activities","/teacher/activities",Activity],["Assignments",null,ClipboardList]] },
  { label:"Insights", items:[["Reports",null,BarChart3],["Settings",null,Settings]] },
] as const;

function Sidebar({mobile=false,onClose}:{mobile?:boolean;onClose?:()=>void}) {
  const pathname=usePathname();
  return <aside className={mobile?"fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border-color bg-card-bg px-4 py-6 lg:hidden":"sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border-color bg-card-bg px-4 py-6 lg:flex"}>
    <div><div className="mb-8 flex items-center justify-between"><Link href="/teacher" onClick={onClose} className="flex items-center gap-3 px-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><ShieldCheck className="h-6 w-6"/></span><span className="text-ui-xl font-extrabold">Learn<span className="text-secondary">Teacher</span></span></Link>{mobile&&<button onClick={onClose} aria-label="Close navigation" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-background-app"><X className="h-5 w-5"/></button>}</div>
      <nav className="space-y-5" aria-label="Teacher navigation">{groups.map(group=><div key={group.label}><p className="mb-2 px-4 text-label font-semibold text-neutral-muted">{group.label}</p><div className="space-y-1">{group.items.map(([label,href,Icon])=>{const active=!!href&&(pathname===href||(href!=="/teacher"&&pathname.startsWith(href+"/")));if(!href)return <div key={label} className="flex h-10 items-center gap-3 rounded-xl px-4 text-body font-semibold text-neutral-subtle" aria-disabled="true"><Icon className="h-5 w-5"/><span className="flex-1">{label}</span><span className="rounded-full bg-background-app px-2 py-0.5 text-caption text-neutral-muted">Soon</span></div>;return <Link key={label} href={href} onClick={onClose} aria-current={active?"page":undefined} className={active?"flex h-10 items-center gap-3 rounded-xl bg-secondary-light px-4 text-body font-semibold text-secondary-text":"flex h-10 items-center gap-3 rounded-xl px-4 text-body font-semibold text-neutral-muted hover:bg-background-app"}><Icon className={active?"h-5 w-5 text-secondary":"h-5 w-5"}/><span>{label}</span></Link>})}</div></div>)}</nav>
    </div>
    <Link href="/student" onClick={onClose} className="border-t border-border-color p-2 pt-4 text-body-sm font-semibold text-primary">Switch to Student View</Link>
  </aside>;
}

export default function TeacherLayout({children}:{children:React.ReactNode}) {
  const [open,setOpen]=useState(false);
  return <AuthGuard requiredRole="TEACHER"><div className="min-h-screen bg-background-app lg:flex"><Sidebar/>{open&&<><button aria-label="Close navigation" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-neutral-dark/30 lg:hidden"/><Sidebar mobile onClose={()=>setOpen(false)}/></>}<div className="flex min-w-0 flex-1 flex-col"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-color bg-card-bg px-4 sm:px-6"><div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-xl lg:hidden"><Menu className="h-5 w-5"/></button><span className="text-body font-semibold">Teacher Portal</span></div><SessionActions/></header><main className="flex-1 p-4 md:p-6">{children}</main></div></div></AuthGuard>;
}
