"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activityService } from "@/services/activity.service";
import { unitService } from "@/services/content/content.unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { ActivityMode, ActivitySourceOption, DistributionMode, SelectionStrategy, ActivityBankRequest } from "@/types/activity";

type SelectedBank = ActivitySourceOption & { displayOrder: number; percentage?: number; fixedCount?: number };

const strategies: { value: SelectionStrategy; label: string; description: string }[] = [
  { value: "RANDOM", label: "Random", description: "Choose randomly inside each bank quota." },
  { value: "WEAKNESS_PRIORITY", label: "Weakness priority", description: "Prioritize weaker areas when answer history exists." },
];

const modes: { value: ActivityMode; label: string; description: string }[] = [
  { value: "LEARNING", label: "Learning", description: "Untimed practice with no lives." },
  { value: "TRY_HARD", label: "Try Hard", description: "Timed challenge with limited lives." },
  { value: "BOTH", label: "Both", description: "Student chooses Learning or Try Hard at start." },
];

export function ActivityEditor({ activityId }: { activityId?: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const requestedUnitId = Number(params.get("unitId") || 0);

  const existing = useQuery({ queryKey: QUERY_KEYS.activity(activityId || 0), queryFn: async () => (await activityService.get(activityId!)).data, enabled: !!activityId });
  const unitId = existing.data?.unitId || requestedUnitId;
  const unit = useQuery({ queryKey: QUERY_KEYS.contentUnit(unitId), queryFn: async () => (await unitService.get(unitId)).data, enabled: !!unitId });
  const sources = useQuery({ queryKey: QUERY_KEYS.activitySources(unitId), queryFn: async () => (await activityService.sources(unitId)).data || [], enabled: !!unitId });

  const [initialized, setInitialized] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [distribution, setDistribution] = useState<DistributionMode>("EQUAL");
  const [total, setTotal] = useState(10);
  const [availableSelectionStrategies, setAvailableSelectionStrategies] = useState<SelectionStrategy[]>(["RANDOM"]);
  const [mode, setMode] = useState<ActivityMode>("BOTH");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | undefined>(60);
  const [lives, setLives] = useState<number | undefined>(3);
  const [banks, setBanks] = useState<SelectedBank[]>([]);

  useEffect(() => {
    if (!existing.data || initialized) return;
    const a = existing.data;
    setInitialized(true); setName(a.name); setDescription(a.description || "");
    setDistribution(a.distributionMode); setTotal(a.totalQuestions);
    setAvailableSelectionStrategies(a.availableSelectionStrategies);
    setMode(a.mode); setTimeLimitSeconds(a.mode === "LEARNING" ? undefined : a.timeLimitSeconds || 60);
    setLives(a.mode === "LEARNING" ? undefined : a.lives || 3);
    setBanks(a.banks.map(b => ({ ...b, status: "PUBLISHED", percentage: b.percentage ?? undefined, fixedCount: b.fixedCount ?? undefined })));
  }, [existing.data, initialized]);

  const selected = useMemo(() => new Set(banks.map(b => b.questionBankId)), [banks]);
  const grouped = useMemo(() => {
    const sections = new Map<string, Map<string, ActivitySourceOption[]>>();
    for (const source of sources.data || []) {
      if (source.status === "ARCHIVED") continue;
      if (!sections.has(source.sectionName)) sections.set(source.sectionName, new Map());
      const topics = sections.get(source.sectionName)!;
      if (!topics.has(source.topicName)) topics.set(source.topicName, []);
      topics.get(source.topicName)!.push(source);
    }
    return [...sections.entries()];
  }, [sources.data]);

  const allocation = useMemo(() => {
    if (!banks.length) return [];
    if (distribution === "FIXED_COUNT") return banks.map(b => ({ id: b.questionBankId, count: b.fixedCount || 0 }));
    if (distribution === "EQUAL") {
      const each = Math.floor(total / banks.length);
      return banks.map(b => ({ id: b.questionBankId, count: each }));
    }
    const base = banks.map(b => {
      const exact = total * (b.percentage || 0) / 100;
      return { id: b.questionBankId, floor: Math.floor(exact), fraction: exact - Math.floor(exact) };
    });
    let remaining = total - base.reduce((s, x) => s + x.floor, 0);
    const extras = new Set(base.sort((a,b) => b.fraction-a.fraction || a.id-b.id).slice(0, remaining).map(x => x.id));
    return base.map(x => ({ id: x.id, count: x.floor + (extras.has(x.id) ? 1 : 0) }));
  }, [banks, distribution, total]);

  const allocationTotal = allocation.reduce((s, x) => s + x.count, 0);
  const percentageTotal = banks.reduce((s,b) => s + (b.percentage || 0), 0);
  const fixedTotal = banks.reduce((s,b) => s + (b.fixedCount || 0), 0);
  const distributionError = !banks.length ? "Select at least one Question Bank."
    : distribution === "EQUAL" && total % banks.length !== 0 ? "Equal distribution must divide evenly."
    : distribution === "PERCENTAGE" && (percentageTotal !== 100 || banks.some(b => !b.percentage || b.percentage < 1)) ? "Percentages must be positive and total exactly 100%."
    : distribution === "FIXED_COUNT" && (fixedTotal !== total || banks.some(b => !b.fixedCount || b.fixedCount < 1)) ? "Fixed counts must be positive and add up to the total."
    : "";
  const formError = !unitId ? "A Unit is required." : !name.trim() ? "Activity name is required." : !availableSelectionStrategies.length ? "Select at least one practice option." : distributionError;

  const save = useMutation({
    mutationFn: async () => {
      if (formError) throw new Error(formError);
      const payload = {
        name: name.trim(), description: description.trim() || undefined,
        distributionMode: distribution, totalQuestions: total,
        availableSelectionStrategies, mode,
        timeLimitSeconds: mode === "LEARNING" ? undefined : timeLimitSeconds,
        lives: mode === "LEARNING" ? undefined : lives,
        banks: banks.map((b): ActivityBankRequest => ({
          questionBankId: b.questionBankId, displayOrder: b.displayOrder,
          ...(distribution === "PERCENTAGE" ? { percentage: b.percentage } : {}),
          ...(distribution === "FIXED_COUNT" ? { fixedCount: b.fixedCount } : {}),
        })),
      };
      return activityId ? activityService.update(activityId, payload) : activityService.create({ unitId: unitId!, ...payload });
    },
    onSuccess: async r => {
      if (!r.data) return;
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.activities(r.data.unitId) });
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.activity(r.data.id) });
      toast.success(activityId ? "Activity updated" : "Activity saved as draft");
      router.push(`/teacher/activities/${r.data.id}`);
    },
    onError: e => toast.error(e instanceof Error ? e.message : "Could not save activity"),
  });

  const toggleBank = (source: ActivitySourceOption) => setBanks(cur => {
    const exists = cur.some(b => b.questionBankId === source.questionBankId);
    const next = exists
      ? cur.filter(b => b.questionBankId !== source.questionBankId)
      : [...cur, {
          ...source,
          displayOrder: cur.length,
          ...(distribution === "PERCENTAGE" ? { percentage: 0 } : {}),
          ...(distribution === "FIXED_COUNT" ? { fixedCount: 1 } : {}),
        }];

    if (distribution === "FIXED_COUNT") {
      setTotal(next.reduce((sum, bank) => sum + (bank.fixedCount || 0), 0));
    }

    return next;
  });

  const changeDistribution = (next: DistributionMode) => {
    setDistribution(next);
    if (next === "EQUAL") setBanks(cur => cur.map(b => ({ ...b, percentage: undefined, fixedCount: undefined })));
    if (next === "PERCENTAGE") setBanks(cur => cur.map((b,i) => ({ ...b, percentage: cur.length === 1 ? 100 : (i === 0 ? 0 : undefined), fixedCount: undefined })));
    if (next === "FIXED_COUNT") setBanks(cur => {
      const nextBanks = cur.map(b => ({ ...b, percentage: undefined, fixedCount: b.fixedCount && b.fixedCount > 0 ? b.fixedCount : 1 }));
      setTotal(nextBanks.reduce((s,b) => s + (b.fixedCount || 0), 0)); return nextBanks;
    });
  };

  const changeMode = (next: ActivityMode) => {
    setMode(next);
    if (next === "LEARNING") { setTimeLimitSeconds(undefined); setLives(undefined); }
    else { setTimeLimitSeconds(v => v || 60); setLives(v => v || 3); }
  };

  return <div className="mx-auto max-w-6xl pb-16">
    <header className="sticky top-16 z-20 -mx-4 mb-6 border-b border-border-color bg-card-bg px-4 py-3 md:-mx-6 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/teacher/activities?unitId=${unitId || ""}`} className="mb-1 inline-flex items-center gap-1 text-body-sm font-semibold text-neutral-muted"><ArrowLeft className="h-4 w-4" />Activities</Link>
          <h1 className="truncate text-section-title font-bold text-neutral-dark">{name || (activityId ? "Edit activity" : "New activity")}</h1>
        </div>
        <button type="button" onClick={() => save.mutate()} disabled={save.isPending || !!formError} className="h-10 shrink-0 rounded-lg bg-primary px-4 text-body font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{save.isPending ? "Saving…" : activityId ? "Save changes" : "Save draft"}</button>
      </div>
    </header>

    {existing.isError && <div className="mb-6 border border-danger-light bg-danger-light p-4 text-body text-danger-text">Could not load this Activity.</div>}

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <main className="space-y-6">
        <EditorSection title="Activity details">
          <Field label="Activity name"><input value={name} maxLength={150} onChange={e=>setName(e.target.value)} className={inputClass()} placeholder="e.g. Unit 1 Grammar Practice"/></Field>
          <Field label="Description" hint="Optional. Keep it to one short sentence."><textarea value={description} maxLength={1000} onChange={e=>setDescription(e.target.value)} className={inputClass()+" min-h-24 py-2"} placeholder="What should students practice?"/></Field>
        </EditorSection>

        <EditorSection title="Question Banks" description="Only Question Banks from this Unit can be selected.">
          {sources.isLoading ? <p className="text-body text-neutral-muted">Loading Question Banks…</p> :
           sources.isError ? <div className="border-l-2 border-danger bg-background-app p-4 text-body text-danger-text">Could not load Question Banks.</div> :
           grouped.length === 0 ? <div className="border border-border-color p-6 text-body text-neutral-muted">No Question Banks are available in this Unit.</div> :
           <div className="border border-border-color">
             {grouped.map(([section,topics]) => <div key={section}>
               <div className="border-b border-border-color bg-background-app px-4 py-3 text-body font-semibold">{section}</div>
               {[...topics.entries()].map(([topic,list]) => <div key={topic}>
                 <div className="border-b border-border-color px-4 py-2 text-body-sm font-semibold text-neutral-muted">{topic}</div>
                 {list.map(source => <button key={source.questionBankId} type="button" disabled={source.status==="ARCHIVED"} onClick={()=>toggleBank(source)} aria-pressed={selected.has(source.questionBankId)} className={`flex min-h-12 w-full items-center gap-3 border-b border-border-color px-4 py-3 text-left ${selected.has(source.questionBankId)?"bg-primary-light":"hover:bg-background-app"}`}>
                   <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-lg border ${selected.has(source.questionBankId)?"border-primary bg-primary text-primary-foreground":"border-border-input bg-card-bg"}`}>{selected.has(source.questionBankId)&&<Check className="h-3.5 w-3.5"/>}</span>
                   <span className="min-w-0 flex-1"><span className="block truncate text-body font-semibold">{source.questionBankName}</span><span className="mt-1 block text-body-sm text-neutral-muted">{source.readyQuestions}/{source.totalQuestions} ready · {source.status==="PUBLISHED"?"Published":"Draft"}</span></span>
                 </button>)}
               </div>)}
             </div>)}
           </div>}
        </EditorSection>

        <EditorSection title="Question set" description="Distribution controls how many questions come from each selected Question Bank.">
          <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
            <Field label="Total questions" hint={distribution==="FIXED_COUNT"?"Calculated from fixed counts.":"Total questions in one Activity run."}>
              <input type="number" min={distribution==="FIXED_COUNT"?0:1} value={total} readOnly={distribution==="FIXED_COUNT"} onChange={e=>distribution!=="FIXED_COUNT"&&setTotal(Math.max(1,Number(e.target.value)))} className={inputClass()}/>
            </Field>
            <div><p className="text-body font-semibold">Distribution</p><div className="mt-2 grid gap-2 md:grid-cols-3">{(["EQUAL","PERCENTAGE","FIXED_COUNT"] as DistributionMode[]).map(v=><button key={v} type="button" onClick={()=>changeDistribution(v)} aria-pressed={distribution===v} className={`rounded-lg border px-4 py-3 text-left text-body font-semibold ${distribution===v?"border-primary bg-primary-light text-primary":"border-border-color hover:bg-background-app"}`}>{v==="FIXED_COUNT"?"Fixed count":v==="PERCENTAGE"?"Percentage":"Equal"}</button>)}</div></div>
          </div>
          {banks.length>0&&distribution!=="EQUAL"&&<div className="mt-5 border border-border-color"><div className="grid grid-cols-[1fr_7rem] border-b border-border-color bg-background-app px-4 py-2 text-label font-semibold text-neutral-muted"><span>Question Bank</span><span className="text-right">{distribution==="PERCENTAGE"?"Percentage":"Questions"}</span></div>{banks.map(b=><div key={b.questionBankId} className="grid grid-cols-[1fr_7rem] items-center gap-3 border-b border-border-color px-4 py-3 last:border-b-0"><span className="truncate text-body font-semibold">{b.questionBankName}</span><input type="number" min={1} max={distribution==="PERCENTAGE"?100:undefined} value={distribution==="PERCENTAGE"?b.percentage??"":b.fixedCount??""} onChange={e=>{
  const value=Math.max(1,Number(e.target.value));
  setBanks(cur=>cur.map(x=>x.questionBankId===b.questionBankId
    ? {...x,...(distribution==="PERCENTAGE"?{percentage:value}:{fixedCount:value})}:x));
  if(distribution==="FIXED_COUNT"){
    setTotal(banks.reduce((sum,bank)=>sum+(bank.questionBankId===b.questionBankId?value:bank.fixedCount||0),0));
  }
}} className={inputClass()+" text-right"}/></div>)}</div>}
          <div className={`mt-4 flex items-start gap-2 border-l-2 p-3 text-body-sm ${distributionError?"border-accent bg-background-app text-accent-text":"border-success bg-background-app text-success"}`}>{distributionError?<AlertTriangle className="mt-0.5 h-4 w-4"/>:<Check className="mt-0.5 h-4 w-4"/>}<p>{distributionError||`Allocated ${allocationTotal} / ${total} questions.`}</p></div>
        </EditorSection>

        <EditorSection title="Practice options" description="Students can choose one of the enabled selection strategies when more than one is allowed.">
          <div className="grid gap-2 md:grid-cols-2">{strategies.map(o=>{const on=availableSelectionStrategies.includes(o.value);return <button key={o.value} type="button" aria-pressed={on} onClick={()=>setAvailableSelectionStrategies(cur=>on?cur.filter(x=>x!==o.value):[...cur,o.value])} className={`rounded-lg border p-4 text-left ${on?"border-primary bg-primary-light":"border-border-color hover:bg-background-app"}`}><div className="flex gap-3"><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-lg border ${on?"border-primary bg-primary text-primary-foreground":"border-border-input"}`}>{on&&<Check className="h-3.5 w-3.5"/>}</span><span><span className="block text-body font-semibold">{o.label}</span><span className="mt-1 block text-body-sm text-neutral-muted">{o.description}</span></span></div></button>})}</div>
        </EditorSection>

        <EditorSection title="Student mode" description="The time limit applies to the whole Activity run, not to each question.">
          <div className="grid gap-2 md:grid-cols-3">{modes.map(o=><button key={o.value} type="button" aria-pressed={mode===o.value} onClick={()=>changeMode(o.value)} className={`rounded-lg border p-4 text-left ${mode===o.value?"border-primary bg-primary-light":"border-border-color hover:bg-background-app"}`}><span className="block text-body font-semibold">{o.label}</span><span className="mt-1 block text-body-sm text-neutral-muted">{o.description}</span></button>)}</div>
          {mode!=="LEARNING"&&<div className="mt-5 grid gap-4 border border-border-color bg-background-app p-4 md:grid-cols-2"><Field label="Time limit (seconds)" hint="One timer for the entire Activity run."><input type="number" min={1} value={timeLimitSeconds??""} onChange={e=>setTimeLimitSeconds(Math.max(1,Number(e.target.value)))} className={inputClass()}/></Field><Field label="Lives" hint="Used only in Try Hard."><input type="number" min={1} value={lives??""} onChange={e=>setLives(Math.max(1,Number(e.target.value)))} className={inputClass()}/></Field></div>}
        </EditorSection>
      </main>

      <aside className="xl:sticky xl:top-24 xl:self-start"><section className="border border-border-color bg-card-bg p-5"><h2 className="text-card-title font-semibold">Configuration summary</h2><dl className="mt-4 space-y-3 text-body-sm"><Row label="Unit" value={unit.data?.code||"—"}/><Row label="Question Banks" value={String(banks.length)}/><Row label="Questions" value={String(total)}/><Row label="Distribution" value={distribution==="FIXED_COUNT"?"Fixed count":distribution==="PERCENTAGE"?"Percentage":"Equal"}/><Row label="Practice options" value={String(availableSelectionStrategies.length)}/><Row label="Mode" value={modes.find(x=>x.value===mode)?.label||mode}/></dl><div className="mt-5 border border-border-color bg-background-app p-3 text-body-sm text-neutral-muted"><div className="flex gap-2"><Info className="h-4 w-4 shrink-0 text-primary"/><p>Saving creates a draft configuration. Publishing is separate and checks live Question Bank readiness.</p></div></div>{formError&&<div className="mt-4 border-l-2 border-accent bg-background-app p-3 text-body-sm text-accent-text">{formError}</div>}</section></aside>
    </div>
  );
}

function EditorSection({title,description,children}:{title:string;description?:string;children:React.ReactNode}){return <section className="border-t border-border-color py-6"><header className="border-b border-border-color pb-4"><h2 className="text-section-title font-bold">{title}</h2>{description&&<p className="mt-1 max-w-prose text-body text-neutral-muted">{description}</p>}</header><div className="pt-5 space-y-4">{children}</div></section>}
function Field({label,hint,children}:{label:string;hint?:string;children:React.ReactNode}){return <label className="block"><span className="text-body font-semibold">{label}</span>{children}{hint&&<span className="mt-1 block text-body-sm text-neutral-muted">{hint}</span>}</label>}
function inputClass(){return "mt-2 h-10 w-full rounded-lg border border-border-input bg-card-bg px-3 text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"}
function Row({label,value}:{label:string;value:string}){return <div className="flex justify-between gap-4"><dt className="text-neutral-muted">{label}</dt><dd className="font-semibold text-right">{value}</dd></div>}
