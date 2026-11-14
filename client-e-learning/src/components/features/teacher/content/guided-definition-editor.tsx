"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { RegionState } from "@/components/feedback";
import { getAppErrorMessage, toAppError } from "@/lib/errors/app-error";
import { QUERY_KEYS } from "@/services/query-keys";
import { guidedDefinitionService } from "@/services/content/guided-definition.service";
import type { QuestionMatchingMode, QuestionType } from "@/types/question";
import type {
  GuidedDefinition,
  GuidedDefinitionIssue,
  GuidedStep,
  GuidedStepType,
} from "@/types/guided-reasoning";

const stepTypeLabels: Record<GuidedStepType, string> = {
  SINGLE_CHOICE: "Single choice",
  TRUE_FALSE: "True / false",
  TYPE_ANSWER: "Type answer",
};

const matchingModeLabels: Record<QuestionMatchingMode, string> = {
  CASE_INSENSITIVE_TRIM: "Ignore case and outer spaces",
  CASE_SENSITIVE_TRIM: "Match case; ignore outer spaces",
};

const sectionClass = "rounded-xl border border-border bg-card p-5";
const inputClass =
  "mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const buttonBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-body font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
const buttonPrimary = `${buttonBase} bg-primary text-primary-foreground hover:bg-primary-hover`;
const buttonOutline = `${buttonBase} border border-input bg-card text-foreground hover:bg-secondary`;

export function GuidedDefinitionEditor({
  questionId,
  finalQuestionType,
}: {
  questionId: number;
  finalQuestionType: QuestionType;
}) {
  const queryClient = useQueryClient();
  const [createMode, setCreateMode] = useState(false);
  const definitionQuery = useQuery({
    queryKey: QUERY_KEYS.guidedDefinition(questionId),
    queryFn: async () => (await guidedDefinitionService.get(questionId)).data,
    retry: false,
  });
  const capabilitiesQuery = useQuery({
    queryKey: QUERY_KEYS.guidedCapabilities,
    queryFn: async () => (await guidedDefinitionService.capabilities()).data,
    enabled: Boolean(definitionQuery.data || createMode),
  });

  if (definitionQuery.isLoading) {
    return <section className={sectionClass} aria-busy="true">Loading Guided Reasoning…</section>;
  }

  const definitionError = definitionQuery.isError ? toAppError(definitionQuery.error) : null;
  const absent = definitionError?.code === "GUIDED_DEFINITION_NOT_FOUND";
  if (definitionError && !absent) {
    return (
      <RegionState
        variant="error"
        description={getAppErrorMessage(definitionQuery.error, (key) => key)}
        action={<button type="button" className={buttonOutline} onClick={() => void definitionQuery.refetch()}>Retry</button>}
      />
    );
  }

  const unsupportedFinal = finalQuestionType === "MATCHING" || finalQuestionType === "CLOZE";
  if (unsupportedFinal) {
    return (
      <section className={sectionClass}>
        <h2 className="text-section-title font-bold">Guided reasoning</h2>
        <p className="mt-2 text-body text-muted-foreground">
          Guided Reasoning v1 is unavailable for this final Question type. Choose Single Choice,
          Multiple Choice, True / False, Fill in the Blank, or Type Answer first.
        </p>
      </section>
    );
  }

  if (!definitionQuery.data && !createMode) {
    return (
      <section className={sectionClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-prose">
            <h2 className="text-section-title font-bold">Guided reasoning</h2>
            <p className="mt-1 text-body text-muted-foreground">
              Add teacher-authored steps that students complete before they see this final Question.
            </p>
          </div>
          <button type="button" className={buttonPrimary} onClick={() => setCreateMode(true)}>
            <Plus size={16} aria-hidden /> Set up guided steps
          </button>
        </div>
      </section>
    );
  }

  if (capabilitiesQuery.isLoading) {
    return <section className={sectionClass} aria-busy="true">Loading editor…</section>;
  }
  if (capabilitiesQuery.isError || !capabilitiesQuery.data) {
    return (
      <RegionState
        variant="error"
        description="Guided editor capabilities could not be loaded."
        action={<button type="button" className={buttonOutline} onClick={() => void capabilitiesQuery.refetch()}>Retry</button>}
      />
    );
  }

  return (
    <GuidedDefinitionEditorForm
      key={`${questionId}-${definitionQuery.data?.version ?? "new"}`}
      questionId={questionId}
      initialDefinition={definitionQuery.data}
      supportedTypes={capabilitiesQuery.data.supportedStepTypes}
      onDiscard={() => {
        setCreateMode(false);
        queryClient.removeQueries({ queryKey: QUERY_KEYS.guidedDefinition(questionId) });
      }}
    />
  );
}

function GuidedDefinitionEditorForm({
  questionId,
  initialDefinition,
  supportedTypes,
  onDiscard,
}: {
  questionId: number;
  initialDefinition?: GuidedDefinition;
  supportedTypes: GuidedStepType[];
  onDiscard: () => void;
}) {
  const queryClient = useQueryClient();
  const [introContent, setIntroContent] = useState(initialDefinition?.introContent ?? "");
  const [steps, setSteps] = useState<GuidedStep[]>(initialDefinition?.steps ?? []);
  const [issues, setIssues] = useState<GuidedDefinitionIssue[]>([]);
  const version = initialDefinition?.version ?? 0;
  const status = initialDefinition?.status ?? "DRAFT";

  const save = useMutation({
    mutationFn: () =>
      guidedDefinitionService.saveDraft(questionId, {
        expectedVersion: version,
        introContent: emptyToNull(introContent),
        steps,
      }),
    onSuccess: () => {
      setIssues([]);
      toast.success("Guided draft saved");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guidedDefinition(questionId) });
    },
    onError: (error) => toast.error("Could not save guided draft", { description: toAppError(error).message }),
  });

  const validate = useMutation({
    mutationFn: () => guidedDefinitionService.validate(questionId, version),
    onSuccess: (response) => {
      const result = response.data;
      if (!result) return;
      setIssues(result.issues);
      if (result.ready) {
        toast.success("Guided definition is ready");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guidedDefinition(questionId) });
      } else {
        toast.error("Guided definition needs attention");
      }
    },
    onError: (error) => toast.error("Could not validate guided definition", { description: toAppError(error).message }),
  });

  const remove = useMutation({
    mutationFn: () => guidedDefinitionService.remove(questionId),
    onSuccess: () => {
      toast.success("Guided definition removed");
      queryClient.removeQueries({ queryKey: QUERY_KEYS.guidedDefinition(questionId) });
      onDiscard();
    },
    onError: (error) => toast.error("Could not remove guided definition", { description: toAppError(error).message }),
  });

  const updateStep = (index: number, update: (step: GuidedStep) => GuidedStep) => {
    setSteps((current) => current.map((step, stepIndex) => stepIndex === index ? update(step) : step));
    setIssues([]);
  };
  const addStep = () => {
    const type = supportedTypes[0] ?? "SINGLE_CHOICE";
    setSteps((current) => [...current, emptyStep(type, current.length)]);
    setIssues([]);
  };
  const removeStep = (index: number) => {
    setSteps((current) => normalizeSteps(current.filter((_, stepIndex) => stepIndex !== index)));
    setIssues([]);
  };
  const moveStep = (index: number, direction: -1 | 1) => {
    setSteps((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return normalizeSteps(next);
    });
    setIssues([]);
  };

  return (
    <section className={sectionClass}>
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-prose">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-section-title font-bold">Guided reasoning</h2>
            <span className={status === "READY" ? "rounded-full bg-success-soft px-2 py-1 text-label text-success" : "rounded-full bg-secondary px-2 py-1 text-label text-muted-foreground"}>
              {status === "READY" ? "Ready" : "Draft"}
            </span>
          </div>
          <p className="mt-1 text-body text-muted-foreground">
            Students complete every step before the final Question becomes available. Step feedback never reveals the answer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonOutline} onClick={() => validate.mutate()} disabled={save.isPending || validate.isPending || remove.isPending}>
            <Check size={16} aria-hidden /> Validate ready
          </button>
          <button type="button" className={buttonPrimary} onClick={() => save.mutate()} disabled={save.isPending || validate.isPending || remove.isPending}>
            <Save size={16} aria-hidden /> {save.isPending ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-body font-semibold">Introduction for the steps</span>
        <span className="mt-1 block text-body-sm text-muted-foreground">Optional context. Do not repeat or reveal the final Question.</span>
        <textarea value={introContent} onChange={(event) => setIntroContent(event.target.value)} className={`${inputClass} min-h-24`} placeholder="Optional context students see before Step 1" />
      </label>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-card-title font-semibold">Guided steps</h3>
            <p className="mt-1 text-body-sm text-muted-foreground">Each Step has its own prompt and optional Hint or one retry.</p>
          </div>
          <button type="button" className={buttonOutline} onClick={addStep}>
            <Plus size={16} aria-hidden /> Add step
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-input bg-secondary px-4 py-5 text-body text-muted-foreground">
            Add at least one Step before validating this definition as Ready.
          </div>
        ) : steps.map((step, index) => (
          <GuidedStepEditor
            key={step.stepKey}
            step={step}
            index={index}
            total={steps.length}
            supportedTypes={supportedTypes}
            issues={issues}
            onChange={(update) => updateStep(index, update)}
            onMove={moveStep}
            onRemove={removeStep}
          />
        ))}
      </div>

      {issues.length > 0 && <IssueSummary issues={issues} />}
      <GuidedPreview introContent={introContent} steps={steps} />

      <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-border pt-5">
        <button
          type="button"
          className={`${buttonBase} text-destructive hover:bg-destructive-soft`}
          onClick={() => {
            if (initialDefinition && window.confirm("Remove this Guided definition? Existing future sessions will no longer use it.")) remove.mutate();
            if (!initialDefinition) onDiscard();
          }}
          disabled={remove.isPending || save.isPending || validate.isPending}
        >
          <Trash2 size={16} aria-hidden /> {initialDefinition ? "Remove guided definition" : "Discard"}
        </button>
        <button type="button" className={buttonOutline} onClick={() => {
          setIntroContent(initialDefinition?.introContent ?? "");
          setSteps(initialDefinition?.steps ?? []);
          setIssues([]);
        }} disabled={save.isPending || validate.isPending || remove.isPending}>
          <RotateCcw size={16} aria-hidden /> Reset unsaved changes
        </button>
      </div>
    </section>
  );
}

function GuidedStepEditor({ step, index, total, supportedTypes, issues, onChange, onMove, onRemove }: {
  step: GuidedStep;
  index: number;
  total: number;
  supportedTypes: GuidedStepType[];
  issues: GuidedDefinitionIssue[];
  onChange: (update: (step: GuidedStep) => GuidedStep) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const issueFor = (suffix: string) => issues.find((issue) => issue.path === `steps[${index}].${suffix}`);
  const setType = (type: GuidedStepType) => onChange((current) => ({ ...emptyStep(type, current.position, current.stepKey), prompt: current.prompt }));
  const updateOptions = (options: GuidedStep["options"]) => onChange((current) => ({ ...current, options }));

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-card-title font-semibold">Step {index + 1}</h4>
        <div className="flex gap-1">
          <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-secondary disabled:opacity-50" aria-label={`Move Step ${index + 1} earlier`} disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp size={16} aria-hidden /></button>
          <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-secondary disabled:opacity-50" aria-label={`Move Step ${index + 1} later`} disabled={index === total - 1} onClick={() => onMove(index, 1)}><ArrowDown size={16} aria-hidden /></button>
          <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive-soft" aria-label={`Remove Step ${index + 1}`} onClick={() => onRemove(index)}><Trash2 size={16} aria-hidden /></button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Step type" issue={issueFor("type")?.code}>
          <select className={inputClass} value={step.type} onChange={(event) => setType(event.target.value as GuidedStepType)}>
            {supportedTypes.map((type) => <option key={type} value={type}>{stepTypeLabels[type]}</option>)}
          </select>
        </Field>
        <Field label="Step key" issue={issueFor("stepKey")?.code} hint="Stable internal identifier; reordering does not change it.">
          <input className={inputClass} value={step.stepKey} onChange={(event) => onChange((current) => ({ ...current, stepKey: event.target.value }))} />
        </Field>
      </div>

      <Field label="Prompt" issue={issueFor("content.required")?.code}>
        <textarea className={`${inputClass} min-h-20`} value={step.prompt ?? ""} onChange={(event) => onChange((current) => ({ ...current, prompt: event.target.value }))} placeholder="What should the student reason about in this step?" />
      </Field>

      {step.type === "SINGLE_CHOICE" && <SingleChoiceFields step={step} issues={issues} index={index} onChange={onChange} onOptionsChange={updateOptions} />}
      {step.type === "TRUE_FALSE" && <Field label="Correct answer" issue={issueFor("answers.true_false.required")?.code}>
        <select className={inputClass} value={String(step.expected ?? true)} onChange={(event) => onChange((current) => ({ ...current, expected: event.target.value === "true" }))}>
          <option value="true">True</option><option value="false">False</option>
        </select>
      </Field>}
      {step.type === "TYPE_ANSWER" && <TypeAnswerFields step={step} issues={issues} index={index} onChange={onChange} />}

      <Field label="Explanation" hint="Shown in review only after the final Question is resolved.">
        <textarea className={`${inputClass} min-h-20`} value={step.explanation ?? ""} onChange={(event) => onChange((current) => ({ ...current, explanation: event.target.value }))} />
      </Field>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex gap-3 rounded-lg border border-border p-3 text-body">
          <input type="checkbox" checked={step.hintEnabled} onChange={(event) => onChange((current) => ({ ...current, hintEnabled: event.target.checked }))} className="mt-1 size-4 accent-primary" />
          <span><span className="block font-semibold">Allow hint</span><span className="mt-1 block text-body-sm text-muted-foreground">A student can reveal this configured hint once.</span></span>
        </label>
        <label className="flex gap-3 rounded-lg border border-border p-3 text-body">
          <input type="checkbox" checked={step.retryEnabled} onChange={(event) => onChange((current) => ({ ...current, retryEnabled: event.target.checked }))} className="mt-1 size-4 accent-primary" />
          <span><span className="block font-semibold">Allow one retry</span><span className="mt-1 block text-body-sm text-muted-foreground">A wrong first answer gets one more attempt.</span></span>
        </label>
      </div>
      {step.hintEnabled && <Field label="Hint" issue={issueFor("hint")?.code}><textarea className={`${inputClass} min-h-20`} value={step.hint ?? ""} onChange={(event) => onChange((current) => ({ ...current, hint: event.target.value }))} /></Field>}
    </article>
  );
}

function SingleChoiceFields({ step, index, issues, onChange, onOptionsChange }: {
  step: GuidedStep; index: number; issues: GuidedDefinitionIssue[];
  onChange: (update: (step: GuidedStep) => GuidedStep) => void;
  onOptionsChange: (options: GuidedStep["options"]) => void;
}) {
  const updateOption = (optionIndex: number, content: string) => onOptionsChange(step.options.map((option, currentIndex) => currentIndex === optionIndex ? { ...option, content } : option));
  return <div className="mt-4"><div className="flex items-center justify-between gap-3"><p className="text-body font-semibold">Options</p><button type="button" className={buttonOutline} onClick={() => onOptionsChange([...step.options, { key: optionKey(step.options.length), content: "" }])}><Plus size={16} aria-hidden /> Add option</button></div><div className="mt-2 space-y-2">{step.options.map((option, optionIndex) => { const optionIssue = issues.find((issue) => issue.path === `steps[${index}].options[${optionIndex}].key` || issue.path === `steps[${index}].options.content.required`); return <div key={option.key} className="flex items-center gap-2"><input type="radio" name={`guided-correct-${step.stepKey}`} checked={step.correctKey === option.key} onChange={() => onChange((current) => ({ ...current, correctKey: option.key }))} aria-label={`Set option ${option.key} as correct`} className="size-4 accent-primary" /><span className="w-5 text-body font-semibold">{option.key}</span><input className="w-full rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" value={option.content} onChange={(event) => updateOption(optionIndex, event.target.value)} placeholder={`Option ${option.key}`} /><button type="button" className="inline-flex size-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive-soft disabled:opacity-50" disabled={step.options.length <= 2} onClick={() => { const next = step.options.filter((_, currentIndex) => currentIndex !== optionIndex).map((item, currentIndex) => ({ ...item, key: optionKey(currentIndex) })); onChange((current) => ({ ...current, options: next, correctKey: next.some((item) => item.key === current.correctKey) ? current.correctKey : next[0]?.key ?? null })); }} aria-label={`Remove option ${option.key}`}><Trash2 size={16} aria-hidden /></button>{optionIssue && <span className="sr-only">{optionIssue.code}</span>}</div>; })}</div></div>;
}

function TypeAnswerFields({ step, index, issues, onChange }: { step: GuidedStep; index: number; issues: GuidedDefinitionIssue[]; onChange: (update: (step: GuidedStep) => GuidedStep) => void; }) {
  const answersIssue = issues.find((issue) => issue.path === `steps[${index}].answers.required`);
  return <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Accepted answers" issue={answersIssue?.code}>{step.acceptedAnswers.map((answer, answerIndex) => <div key={answerIndex} className="mt-2 flex gap-2"><input className="w-full rounded-lg border border-input bg-card px-3 py-2 text-body text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" value={answer} onChange={(event) => onChange((current) => ({ ...current, acceptedAnswers: current.acceptedAnswers.map((item, currentIndex) => currentIndex === answerIndex ? event.target.value : item) }))} /><button type="button" className="inline-flex size-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive-soft disabled:opacity-50" disabled={step.acceptedAnswers.length <= 1} onClick={() => onChange((current) => ({ ...current, acceptedAnswers: current.acceptedAnswers.filter((_, currentIndex) => currentIndex !== answerIndex) }))} aria-label="Remove accepted answer"><Trash2 size={16} aria-hidden /></button></div>)}<button type="button" className={`${buttonOutline} mt-2`} onClick={() => onChange((current) => ({ ...current, acceptedAnswers: [...current.acceptedAnswers, ""] }))}><Plus size={16} aria-hidden /> Add accepted answer</button></Field><Field label="Answer matching"><select className={inputClass} value={step.matchingMode ?? "CASE_INSENSITIVE_TRIM"} onChange={(event) => onChange((current) => ({ ...current, matchingMode: event.target.value as QuestionMatchingMode }))}>{(Object.keys(matchingModeLabels) as QuestionMatchingMode[]).map((mode) => <option key={mode} value={mode}>{matchingModeLabels[mode]}</option>)}</select></Field></div>;
}

function Field({ label, hint, issue, children }: { label: string; hint?: string; issue?: string; children: ReactNode }) {
  return <label className="mt-4 block"><span className="text-body font-semibold">{label}</span>{hint && <span className="mt-1 block text-body-sm text-muted-foreground">{hint}</span>}{children}{issue && <span className="mt-1 block text-body-sm text-destructive">{humanizeIssue(issue)}</span>}</label>;
}

function IssueSummary({ issues }: { issues: GuidedDefinitionIssue[] }) {
  return <section className="mt-6 rounded-lg border-l-4 border-destructive bg-destructive-soft p-4" role="alert"><h3 className="text-card-title font-semibold text-destructive">Fix these before marking Ready</h3><ul className="mt-2 space-y-1 text-body text-foreground">{issues.map((issue) => <li key={`${issue.path}-${issue.code}`}>{issue.path}: {humanizeIssue(issue.code)}</li>)}</ul></section>;
}

function GuidedPreview({ introContent, steps }: { introContent: string; steps: GuidedStep[] }) {
  return <section className="mt-6 rounded-lg border border-border bg-secondary p-4"><div className="flex items-center gap-2"><Eye size={16} aria-hidden /><h3 className="text-card-title font-semibold">Teacher flow preview</h3></div>{introContent.trim() && <p className="mt-3 text-body text-foreground">{introContent}</p>}<ol className="mt-4 space-y-2">{steps.map((step, index) => <li key={step.stepKey} className="flex items-start gap-2 text-body"><ChevronRight size={16} className="mt-1 shrink-0" aria-hidden /><span><span className="font-semibold">Step {index + 1}: </span>{step.prompt?.trim() || "Untitled step"} <span className="text-muted-foreground">({stepTypeLabels[step.type]})</span></span></li>)}</ol><div className="mt-4 rounded-lg border border-border bg-card p-3 text-body"><span className="font-semibold">Final Question</span><span className="ml-2 text-muted-foreground">Shown only after every Step is complete.</span></div></section>;
}

function emptyStep(type: GuidedStepType, position: number, key = createStepKey()): GuidedStep {
  return {
    stepKey: key, position, type, prompt: "", options: type === "SINGLE_CHOICE" ? [{ key: "A", content: "" }, { key: "B", content: "" }] : [], correctKey: type === "SINGLE_CHOICE" ? "A" : null, expected: type === "TRUE_FALSE" ? true : null, acceptedAnswers: type === "TYPE_ANSWER" ? [""] : [], matchingMode: "CASE_INSENSITIVE_TRIM", explanation: "", hintEnabled: false, hint: "", retryEnabled: false,
  };
}

function normalizeSteps(steps: GuidedStep[]) { return steps.map((step, position) => ({ ...step, position })); }
function optionKey(index: number) { return String.fromCharCode(65 + index); }
function createStepKey() { return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function emptyToNull(value: string) { const trimmed = value.trim(); return trimmed || null; }
function humanizeIssue(code: string) { return code.replaceAll("_", " "); }
