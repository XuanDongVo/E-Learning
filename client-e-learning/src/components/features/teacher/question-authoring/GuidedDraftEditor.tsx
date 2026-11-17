"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { guidedDefinitionService } from "@/services/content/guided-definition.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { QuestionMatchingMode, QuestionType } from "@/types/question";
import type { GuidedDefinitionDraftState, GuidedStep, GuidedStepType } from "@/types/guided-reasoning";

const control = "mt-1 w-full rounded-lg border-2 border-input bg-card px-3 py-2 text-body text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const secondary = "inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-card px-3 py-2 text-body-sm font-semibold text-foreground shadow-pop-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function GuidedDraftEditor({ value, onChange, finalQuestionType }: {
  value: GuidedDefinitionDraftState | undefined;
  onChange: (next: GuidedDefinitionDraftState | undefined) => void;
  finalQuestionType: QuestionType;
}) {
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [draggedStepKey, setDraggedStepKey] = useState<string | null>(null);
  const capabilities = useQuery({
    queryKey: QUERY_KEYS.guidedCapabilities,
    queryFn: async () => (await guidedDefinitionService.capabilities()).data,
  });
  const enabled = value?.enabled ?? false;
  const supported: GuidedStepType[] = capabilities.data?.supportedStepTypes ?? ["SINGLE_CHOICE", "TRUE_FALSE", "TYPE_ANSWER"];
  const draft = value ?? { enabled: true, introContent: "", steps: [] };
  const update = (patch: Partial<GuidedDefinitionDraftState>) => onChange({ ...draft, ...patch, enabled: true });

  if (finalQuestionType === "MATCHING" || finalQuestionType === "CLOZE") {
    return <section className="rounded-xl border-2 border-ink bg-card p-5 shadow-pop-sm"><h3 className="text-card-title font-bold text-foreground">Guided Reasoning</h3><p className="mt-1 text-body-sm text-muted-foreground">Guided v1 is unavailable for this final Question type. Choose a supported final type first.</p></section>;
  }

  if (!enabled) {
    return (
      <section className="rounded-xl border-2 border-ink bg-card p-5 shadow-pop-sm">
        <h3 className="text-card-title font-bold text-foreground">Guided Reasoning</h3>
        <p className="mt-1 text-body-sm text-muted-foreground">Students complete guided steps before the final Question.</p>
        <button type="button" className={`${secondary} mt-4`} onClick={() => onChange({ enabled: true, introContent: "", steps: [] })}>
          <Plus size={15} aria-hidden /> Enable Guided Reasoning
        </button>
      </section>
    );
  }

  const updateStep = (index: number, patch: Partial<GuidedStep>) => update({
    steps: draft.steps.map((step, current) => current === index ? { ...step, ...patch } : step),
  });
  const addStep = () => {
    const type = supported[0] ?? "SINGLE_CHOICE";
    const step = makeStep(type, draft.steps.length);
    update({ steps: [...draft.steps, step] });
    setOpenStep(step.stepKey);
  };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.steps.length) return;
    const next = [...draft.steps];
    [next[index], next[target]] = [next[target], next[index]];
    update({ steps: normalize(next) });
  };
  const moveTo = (fromKey: string, toIndex: number) => {
    const fromIndex = draft.steps.findIndex((step) => step.stepKey === fromKey);
    if (fromIndex < 0 || fromIndex === toIndex) return;
    const next = [...draft.steps];
    const [moving] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moving);
    update({ steps: normalize(next) });
  };

  return (
    <section className="rounded-xl border-2 border-ink bg-card p-5 shadow-pop-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-card-title font-bold text-foreground">Guided Reasoning</h3>
          <p className="mt-1 text-body-sm text-muted-foreground">Steps are shown before the final Question. A draft may stay incomplete.</p>
        </div>
        <button type="button" className="text-body-sm font-semibold text-destructive hover:underline" onClick={() => onChange({ ...draft, enabled: false })}>Turn off</button>
      </div>
      <label className="mt-5 block">
        <span className="text-body-sm font-semibold text-foreground">Opening context <span className="font-normal text-muted-foreground">(optional)</span></span>
        <textarea className={`${control} min-h-20`} value={draft.introContent} onChange={(event) => update({ introContent: event.target.value })} placeholder="Give students context before Step 1." />
      </label>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div><h4 className="text-body font-bold text-foreground">Guided steps ({draft.steps.length})</h4><p className="text-body-sm text-muted-foreground">Collapsed by default for long sequences.</p></div>
        <button type="button" className={secondary} onClick={addStep} disabled={capabilities.isLoading}><Plus size={15} aria-hidden /> Add step</button>
      </div>
      {capabilities.isError && <p role="alert" className="mt-3 text-body-sm text-destructive">Guided capabilities could not be loaded. Try again before saving.</p>}
      <div className="mt-3 space-y-3">
        {draft.steps.map((step, index) => (
          <GuidedStepCard key={step.stepKey} step={step} index={index} total={draft.steps.length} supported={supported} expanded={openStep === step.stepKey}
            onToggle={() => setOpenStep((current) => current === step.stepKey ? null : step.stepKey)}
            onChange={(patch) => updateStep(index, patch)} onMove={move}
            onDragStart={() => setDraggedStepKey(step.stepKey)} onDrop={() => { if (draggedStepKey) moveTo(draggedStepKey, index); setDraggedStepKey(null); }}
            onDuplicate={() => { const copy = { ...step, stepKey: key(), position: index + 1, options: step.options.map((option) => ({ ...option })), acceptedAnswers: [...step.acceptedAnswers] }; const next = [...draft.steps]; next.splice(index + 1, 0, copy); update({ steps: normalize(next) }); setOpenStep(copy.stepKey); }}
            onDelete={() => update({ steps: normalize(draft.steps.filter((_, current) => current !== index)) })} />
        ))}
      </div>
    </section>
  );
}

function GuidedStepCard({ step, index, total, supported, expanded, onToggle, onChange, onMove, onDuplicate, onDelete, onDragStart, onDrop }: {
  step: GuidedStep; index: number; total: number; supported: GuidedStepType[]; expanded: boolean; onToggle: () => void;
  onChange: (patch: Partial<GuidedStep>) => void; onMove: (index: number, direction: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void; onDragStart: () => void; onDrop: () => void;
}) {
  const changeType = (type: GuidedStepType) => onChange({ ...makeStep(type, step.position, step.stepKey), prompt: step.prompt });
  return <article draggable onDragStart={onDragStart} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="rounded-lg border border-border bg-secondary/40">
    <div className="flex items-center gap-2 p-3">
      <GripVertical size={16} className="shrink-0 text-muted-foreground" aria-hidden />
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onToggle} aria-expanded={expanded}>
        <span className="text-body-sm font-bold text-foreground">Step {index + 1}</span><span className="ml-2 text-body-sm text-muted-foreground">{label(step.type)} · {step.prompt?.trim() || "Untitled"}</span>
      </button>
      <button type="button" className="rounded p-1 text-muted-foreground hover:bg-card" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move step earlier"><ChevronUp size={16} /></button>
      <button type="button" className="rounded p-1 text-muted-foreground hover:bg-card" onClick={() => onMove(index, 1)} disabled={index === total - 1} aria-label="Move step later"><ChevronDown size={16} /></button>
      <button type="button" className="rounded p-1 text-muted-foreground hover:bg-card" onClick={onDuplicate} aria-label="Duplicate step"><Copy size={16} /></button>
      <button type="button" className="rounded p-1 text-destructive hover:bg-destructive-soft" onClick={onDelete} aria-label="Delete step"><Trash2 size={16} /></button>
    </div>
    {expanded && <div className="border-t border-border p-4">
      <div className="grid gap-4 md:grid-cols-2"><Field label="Step type"><select className={control} value={step.type} onChange={(event) => changeType(event.target.value as GuidedStepType)}>{supported.map((type) => <option key={type} value={type}>{label(type)}</option>)}</select></Field><Field label="Prompt"><textarea className={`${control} min-h-20`} value={step.prompt ?? ""} onChange={(event) => onChange({ prompt: event.target.value })} /></Field></div>
      {step.type === "SINGLE_CHOICE" && <ChoiceFields step={step} onChange={onChange} />}
      {step.type === "TRUE_FALSE" && <Field label="Correct answer"><select className={control} value={String(step.expected ?? true)} onChange={(event) => onChange({ expected: event.target.value === "true" })}><option value="true">True</option><option value="false">False</option></select></Field>}
      {step.type === "TYPE_ANSWER" && <TextFields step={step} onChange={onChange} />}
      <div className="mt-4 grid gap-3 md:grid-cols-2"><Toggle label="Allow hint" checked={step.hintEnabled} onChange={(hintEnabled) => onChange({ hintEnabled })} /><Toggle label="Allow one retry" checked={step.retryEnabled} onChange={(retryEnabled) => onChange({ retryEnabled })} /></div>
      {step.hintEnabled && <Field label="Hint"><textarea className={`${control} min-h-16`} value={step.hint ?? ""} onChange={(event) => onChange({ hint: event.target.value })} /></Field>}
      <Field label="Explanation for post-final review (optional)"><textarea className={`${control} min-h-16`} value={step.explanation ?? ""} onChange={(event) => onChange({ explanation: event.target.value })} /></Field>
    </div>}
  </article>;
}

function ChoiceFields({ step, onChange }: { step: GuidedStep; onChange: (patch: Partial<GuidedStep>) => void }) {
  const update = (index: number, content: string) => onChange({ options: step.options.map((option, current) => current === index ? { ...option, content } : option) });
  return <div className="mt-4"><p className="text-body-sm font-semibold text-foreground">Options</p><div className="mt-2 space-y-2">{step.options.map((option, index) => <div key={option.key} className="flex gap-2"><input type="radio" className="mt-2 size-4 accent-primary" checked={step.correctKey === option.key} onChange={() => onChange({ correctKey: option.key })} aria-label={`Set option ${option.key} as correct`} /><input className={control} value={option.content} onChange={(event) => update(index, event.target.value)} placeholder={`Option ${option.key}`} /></div>)}</div><button type="button" className={`${secondary} mt-2`} onClick={() => onChange({ options: [...step.options, { key: optionKey(step.options.length), content: "" }] })}><Plus size={14} /> Add option</button></div>;
}

function TextFields({ step, onChange }: { step: GuidedStep; onChange: (patch: Partial<GuidedStep>) => void }) {
  return <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Accepted answers">{step.acceptedAnswers.map((answer, index) => <input key={index} className={control} value={answer} onChange={(event) => onChange({ acceptedAnswers: step.acceptedAnswers.map((item, current) => current === index ? event.target.value : item) })} />)}<button type="button" className={`${secondary} mt-2`} onClick={() => onChange({ acceptedAnswers: [...step.acceptedAnswers, ""] })}><Plus size={14} /> Add answer</button></Field><Field label="Matching"><select className={control} value={step.matchingMode ?? "CASE_INSENSITIVE_TRIM"} onChange={(event) => onChange({ matchingMode: event.target.value as QuestionMatchingMode })}><option value="CASE_INSENSITIVE_TRIM">Ignore case and outer spaces</option><option value="CASE_SENSITIVE_TRIM">Match case</option></select></Field></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="mt-4 block"><span className="text-body-sm font-semibold text-foreground">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-body-sm font-semibold text-foreground"><input className="size-4 accent-primary" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>; }
function makeStep(type: GuidedStepType, position: number, stepKey = key()): GuidedStep { return { stepKey, position, type, prompt: "", options: type === "SINGLE_CHOICE" ? [{ key: "A", content: "" }, { key: "B", content: "" }] : [], correctKey: type === "SINGLE_CHOICE" ? "A" : null, expected: type === "TRUE_FALSE" ? true : null, acceptedAnswers: type === "TYPE_ANSWER" ? [""] : [], matchingMode: "CASE_INSENSITIVE_TRIM", explanation: "", hintEnabled: false, hint: "", retryEnabled: false }; }
function normalize(steps: GuidedStep[]) { return steps.map((step, position) => ({ ...step, position })); }
function key() { return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `step-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function optionKey(index: number) { return String.fromCharCode(65 + index); }
function label(type: GuidedStepType) { return type === "SINGLE_CHOICE" ? "Single choice" : type === "TRUE_FALSE" ? "True / false" : "Type answer"; }
