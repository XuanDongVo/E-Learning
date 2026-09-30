"use client";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {Activity as ActivityIcon,Brain,Clock3,Plus,Sparkles,AlertTriangle} from "lucide-react";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {gradeService} from "@/services/grade.service";
import {unitService} from "@/services/content/content.unit.service";
import {activityService} from "@/services/activity.service";
import {QUERY_KEYS} from "@/services/query-keys";
import type {ActivityMode,ActivityStatus} from "@/types/activity";

const labels={LEARNING:"Learning",TRY_HARD:"Try Hard",BOTH:"Both"} as const;
const icons={LEARNING:Brain,TRY_HARD:Clock3,BOTH:Sparkles};

export function ActivityWorkspace(){
 const params=useSearchParams();
 const requested=Number(params.get("unitId")||0);
 const [gradeId,setGradeId]=useState<number>();
 const [unitId,setUnitId]=useState(requested);
 const [status,setStatus]=useState<"ALL"|ActivityStatus>("ALL");
 const grades=useQuery({queryKey:["grades"],queryFn:async()=>(await gradeService.list()).data||[]});
 const activeGrade=gradeId||grades.data?.[0]?.id;
 const units=useQuery({queryKey:QUERY_KEYS.contentUnits(activeGrade||0),queryFn:async()=>(await unitService.list(activeGrade!)).data||[],enabled:!!activeGrade});
 const unit=units.data?.find(x=>x.id===unitId)||units.data?.[0];
 const activities=useQuery({queryKey:QUERY_KEYS.activities(unit?.id||0),queryFn:async()=>(await activityService.list(unit!.id)).data||[],enabled:!!unit});
 const list=(activities.data||[]).filter(x=>status==="ALL"||x.status===status);
 return <div className="mx-auto max-w-[1320px] space-y-6">
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
   <div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Learning workspace</p><h1 className="mt-2 text-3xl font-extrabold text-neutral-dark">Activities</h1><p className="mt-2 text-sm text-neutral-muted">Manage activities by Grade and Unit. Question Banks remain in Content.</p></div>
   {unit&&<Link href={"/teacher/activities/new?unitId="+unit.id} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-white"><Plus size={16}/>Create activity</Link>}
  </header>
  <section className="rounded-2xl border border-border-color bg-white p-4 shadow-sm">
   <div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-xs font-extrabold uppercase tracking-wider text-neutral-subtle">Grade</span>{grades.data?.map(g=><button key={g.id} onClick={()=>{setGradeId(g.id);setUnitId(0)}} className={(activeGrade===g.id?"bg-primary text-white":"border border-border-color")+" rounded-xl px-4 py-2 text-sm font-bold"}>{g.name}</button>)}</div>
   <div className="mt-4 border-t border-border-color pt-4"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-extrabold uppercase tracking-wider text-neutral-subtle">Units</span><select value={status} onChange={e=>setStatus(e.target.value as "ALL"|ActivityStatus)} className="rounded-lg border px-3 py-2 text-xs font-bold"><option value="ALL">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></div><div className="flex gap-2 overflow-x-auto">{units.data?.map(u=><button key={u.id} onClick={()=>setUnitId(u.id)} className={(unit?.id===u.id?"border-primary bg-primary-light":"border-border-color bg-white")+" min-w-[190px] rounded-xl border p-3 text-left"}><span className="text-xs font-extrabold text-neutral-subtle">{u.code}</span><span className="mt-1 block text-sm font-extrabold text-neutral-dark">{u.name}</span></button>)}</div></div>
  </section>
  {unit&&<section><div className="mb-4"><p className="text-xs font-extrabold uppercase tracking-wider text-primary">{unit.code} · Grade {unit.gradeId}</p><h2 className="mt-1 text-xl font-extrabold">{unit.name}</h2></div>{activities.isLoading?<div className="rounded-2xl border bg-white p-12 text-center text-sm text-neutral-muted">Loading activities...</div>:list.length===0?<div className="rounded-2xl border border-dashed bg-white p-16 text-center"><ActivityIcon className="mx-auto text-slate-300"/><p className="mt-3 font-extrabold">No activities in this unit</p><Link href={"/teacher/activities/new?unitId="+unit.id} className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Create activity</Link></div>:<div className="overflow-hidden rounded-2xl border bg-white">{list.map(a=>{const Icon=icons[a.mode as ActivityMode];return <Link key={a.id} href={"/teacher/activities/"+a.id} className="grid gap-3 border-b px-5 py-4 hover:bg-slate-50 md:grid-cols-[1fr_8rem_9rem_10rem_8rem] md:items-center"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-light text-primary"><Icon size={16}/></span><div className="min-w-0"><p className="truncate font-extrabold">{a.name}</p><p className="truncate text-xs text-neutral-muted">{a.description||"No description"}</p></div></div><div className="ml-12 text-sm font-extrabold md:ml-0">{a.totalQuestions} questions</div><div className="ml-12 text-xs font-bold md:ml-0">{labels[a.mode]}</div><div className="ml-12 text-xs text-neutral-muted md:ml-0">{a.banks.length} banks</div><div className="ml-12 flex items-center gap-2 md:ml-0"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold">{a.status}</span>{!a.readiness.ready&&a.status!=="ARCHIVED"&&<AlertTriangle size={14} className="text-amber-500"/>}</div></Link>})}</div>}</section>}
 </div>
}
