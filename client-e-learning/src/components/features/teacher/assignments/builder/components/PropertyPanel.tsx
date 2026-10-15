import { AlertCircle, AlertTriangle, Copy, Plus, Trash2, Wand2, X } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { contentService } from "@/services/content.service";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import * as ops from "@/components/features/teacher/assignments/builder/ops";
import { useBuilder } from "@/components/features/teacher/assignments/builder/store";
import type { BlockItem, ID, QuestionItem, Section } from "@/types/assignment-builder";
import { createBlankQuestions, useIssues, useNumbering } from "./Canvas";

function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string; error?: string | null }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 border-b px-4 py-4 last:border-0">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}

const MARKUP_HINT = "[[ea]] underlines text · {{1}} or {{answer|alt}} inserts a blank";

function IssueList({ id }: { id: ID }) {
  const issues = useIssues().filter((i) => i.target.id === id);
  if (!issues.length) return null;
  return (
    <div className="space-y-1 border-b px-4 py-3">
      {issues.map((i) => (
        <div key={i.key} className={cn("flex items-start gap-2 text-xs", i.level === "error" ? "text-destructive" : "text-warning-foreground")}>
          {i.level === "error" ? <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-warning" />}
          {i.message}
        </div>
      ))}
    </div>
  );
}

const updateQ = (id: ID, fn: (q: QuestionItem) => void) => useBuilder.getState().mutate((d) => fn(d.items[id] as QuestionItem));
const updateB = (id: ID, fn: (b: BlockItem) => void) => useBuilder.getState().mutate((d) => fn(d.items[id] as BlockItem));

function ListEditor({ values, onChange, placeholder, addLabel }: { values: string[]; onChange: (v: string[]) => void; placeholder: string; addLabel: string }) {
  return (
    <div className="space-y-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex gap-1">
          <Input value={v} placeholder={placeholder} onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} className="h-8" />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Remove" disabled={values.length <= 1} onClick={() => onChange(values.filter((_, j) => j !== i))}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => onChange([...values, ""])}>
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

function QuestionEditor({ q }: { q: QuestionItem }) {
  const a = useBuilder((s) => s.assignment);
  const { duplicate, requestDeleteItem } = useBuilder.getState();
  const { numbers, total } = useNumbering();
  const c = q.content;
  return <><div className="flex items-center justify-between gap-2 border-b px-4 py-3"><div className="min-w-0"><div className="truncate text-sm font-semibold">{q.config.isExample ? "Example item" : `Question ${numbers.get(q.id)} / ${total}`}</div><div className="text-xs text-muted-foreground">{ops.TYPE_LABEL[c.type]}</div></div><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => duplicate(q.id)}><Copy className="h-4 w-4"/></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => requestDeleteItem(q.id)}><Trash2 className="h-4 w-4"/></Button></div></div><IssueList id={q.id}/><Group title="Content"><Field label="Prompt" error={!c.prompt.trim() && !c.blankRef ? "Prompt is required" : null}><Textarea rows={3} value={c.prompt} onChange={(e) => updateQ(q.id, (x) => { x.content.prompt = e.target.value; })}/></Field>{(c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") && <Field label="Options" error={c.options.length < 2 ? "At least 2 options" : !c.options.some((o) => o.isCorrect) ? "Mark the correct answer" : null}><div className="space-y-1.5">{c.options.map((o, i) => <div key={o.id} className="flex items-center gap-1.5">{c.type === "SINGLE_CHOICE" ? <input type="radio" name={`correct-${q.id}`} checked={o.isCorrect} onChange={() => updateQ(q.id, (x) => { if ("options" in x.content) x.content.options.forEach((y) => y.isCorrect = y.id === o.id); })}/> : <Checkbox checked={o.isCorrect} onCheckedChange={(v) => updateQ(q.id, (x) => { if ("options" in x.content) x.content.options[i].isCorrect = !!v; })}/>}<span className="w-4 text-xs text-muted-foreground">{ops.letter(i)}</span><Input className="h-8" value={o.text} onChange={(e) => updateQ(q.id, (x) => { if ("options" in x.content) x.content.options[i].text = e.target.value; })}/><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQ(q.id, (x) => { if ("options" in x.content) x.content.options.splice(i, 1); })}><X className="h-3.5 w-3.5"/></Button></div>)}<Button variant="ghost" size="sm" onClick={() => updateQ(q.id, (x) => { if ("options" in x.content) x.content.options.push({ id: ops.uid("o"), text: `Option ${ops.letter(x.content.options.length)}`, isCorrect: false }); })}><Plus className="h-3.5 w-3.5"/> Add option</Button></div></Field>}{c.type === "TRUE_FALSE" && <Field label="Correct answer"><Select value={c.answer ?? "none"} onValueChange={(v) => updateQ(q.id, (x) => { if (x.content.type === "TRUE_FALSE") x.content.answer = v === "none" ? null : v as "TRUE" | "FALSE"; })}><SelectTrigger className="h-8"><SelectValue placeholder="Choose answer"/></SelectTrigger><SelectContent><SelectItem value="none">Not set</SelectItem><SelectItem value="TRUE">True</SelectItem><SelectItem value="FALSE">False</SelectItem></SelectContent></Select></Field>}{c.type === "TEXT_INPUT" && <><Field label="Accepted answers"><ListEditor values={c.acceptedAnswers} placeholder="Accepted answer" addLabel="Add alternative" onChange={(v) => updateQ(q.id, (x) => { if (x.content.type === "TEXT_INPUT") x.content.acceptedAnswers = v; })}/></Field><label className="flex items-center justify-between text-sm">Case sensitive<Switch checked={c.caseSensitive} onCheckedChange={(v) => updateQ(q.id, (x) => { if (x.content.type === "TEXT_INPUT") x.content.caseSensitive = v; })}/></label></>}{c.type === "CLOZE" && <ClozeEditor q={q}/>} {c.type === "MATCHING" && <MatchingEditor q={q}/>}</Group><Group title="Scoring"><div className="grid grid-cols-2 gap-2"><Field label="Points" error={!q.config.isExample && !(q.config.points > 0) ? "Must be > 0" : null}><Input type="number" min={0} step="0.25" className="h-8" value={Number.isFinite(q.config.points) ? q.config.points : ""} onChange={(e) => updateQ(q.id, (x) => { x.config.points = e.target.value === "" ? NaN : Number(e.target.value); })}/></Field></div><label className="flex items-center justify-between text-sm">Required<Switch checked={q.config.required} onCheckedChange={(v) => updateQ(q.id, (x) => { x.config.required = v; })}/></label></Group><Group title="Shared content"><Field label="Belongs to"><Select value={q.config.groupId ?? "none"} onValueChange={(v) => { const d = useBuilder.getState(); d.mutate((draft) => { const loc = ops.locate(draft, q.id); if (!loc) return; if (v === "none") ops.moveTo(draft, q.id, { sectionId: loc.sectionId, groupId: null, index: loc.index + 1 }); else { const b = draft.items[v] as BlockItem; ops.moveTo(draft, q.id, { sectionId: loc.sectionId, groupId: v, index: b.memberIds.length }); } }); }}><SelectTrigger className="h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">Standalone</SelectItem>{ops.docOrder(a).map((e) => a.items[e.id]).filter((x): x is BlockItem => x?.kind === "block").map((b) => <SelectItem key={b.id} value={b.id}>{ops.blockLabel(b)}</SelectItem>)}</SelectContent></Select></Field></Group></>;
}
function BlockEditor({ b }: { b: BlockItem }) {
  const a = useBuilder((s) => s.assignment);
  const { duplicate, requestDeleteItem, select, addTool, ask } = useBuilder.getState();
  const blk = b.block;
  const sectionId = ops.locate(a, b.id)?.sectionId ?? "";
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{ops.blockLabel(b)}</div>
          <div className="text-xs text-muted-foreground">{ops.TYPE_LABEL[blk.type]} · shared by {b.memberIds.length} question(s)</div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Duplicate" onClick={() => duplicate(b.id)}><Copy className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" aria-label="Delete" onClick={() => requestDeleteItem(b.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <IssueList id={b.id} />
      <Group title="Content">
        {blk.type === "INSTRUCTIONS" && (
          <Field label="Text">
            <Textarea rows={4} value={blk.text} onChange={(e) => updateB(b.id, (x) => x.block.type === "INSTRUCTIONS" && (x.block.text = e.target.value))} />
          </Field>
        )}
        {blk.type === "PASSAGE" && (
          <>
            <Field label="Title">
              <Input className="h-8" value={blk.title} onChange={(e) => updateB(b.id, (x) => x.block.type === "PASSAGE" && (x.block.title = e.target.value))} />
            </Field>
            <Field label="Passage" hint={MARKUP_HINT}>
              <Textarea rows={8} value={blk.text} onChange={(e) => updateB(b.id, (x) => x.block.type === "PASSAGE" && (x.block.text = e.target.value))} />
            </Field>
            {ops.blankTokens(blk.text).length > 0 && (
              <Button variant="outline" size="sm" onClick={() => createBlankQuestions(b.id)}>
                <Wand2 className="h-4 w-4" /> Create questions for all blanks
              </Button>
            )}
          </>
        )}
        {blk.type === "MEDIA" && (
          <>
            <Field label="Upload image" hint="Uploaded images are saved as media assets and referenced by asset ID.">
              <Input className="h-8" type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const response = await contentService.uploadMedia(file);
                  if (!response.data) throw new Error("Upload completed without media metadata.");
                  updateB(b.id, (x) => {
                    if (x.block.type === "MEDIA") {
                      x.block.assetId = String(response.data!.id);
                      x.block.url = response.data!.url ?? "";
                    }
                  });
                  toast.success("Image uploaded.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Image upload failed.");
                }
              }} />
              <Input className="mt-1 h-8" value={blk.assetId ?? ""} readOnly aria-label="Media asset ID" placeholder="Media asset ID appears after upload" />
            </Field>
            <Field label="Image URL (preview)">
              <Input className="h-8" placeholder="Filled automatically after upload" value={blk.url} readOnly />
            </Field>
            <Field label="Alt text (for screen readers)" error={!blk.alt.trim() ? "Describe the picture before saving" : null}>
              <Input className="h-8" value={blk.alt} onChange={(e) => updateB(b.id, (x) => x.block.type === "MEDIA" && (x.block.alt = e.target.value))} />
            </Field>
            <Field label="Caption">
              <Input className="h-8" value={blk.caption} onChange={(e) => updateB(b.id, (x) => x.block.type === "MEDIA" && (x.block.caption = e.target.value))} />
            </Field>
          </>
        )}
        {blk.type === "POOL" && (
          <>
            <Field label="Title">
              <Input className="h-8" value={blk.title} onChange={(e) => updateB(b.id, (x) => x.block.type === "POOL" && (x.block.title = e.target.value))} />
            </Field>
            <Field label="Entries (lettered automatically)">
              <div className="space-y-1.5">
                {blk.entries.map((e, i) => {
                  const users = Object.values(a.items).filter((it) => it.kind === "question" && it.content.type === "MATCHING" && it.content.correctEntryId === e.id).length;
                  const remove = () => updateB(b.id, (x) => x.block.type === "POOL" && x.block.entries.splice(i, 1));
                  return (
                    <div key={e.id} className="flex items-center gap-1.5">
                      <span className="w-4 shrink-0 text-xs font-semibold text-primary">{ops.letter(i)}</span>
                      <Input className="h-8" value={e.text} onChange={(ev) => updateB(b.id, (x) => x.block.type === "POOL" && (x.block.entries[i].text = ev.target.value))} />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        aria-label="Remove entry"
                        onClick={() =>
                          users
                            ? ask({ title: `Remove entry ${ops.letter(i)}?`, description: `${users} matching question(s) use "${e.text}" as the correct answer. They will need a new letter, and later letters will shift.`, actions: [{ label: "Remove entry", variant: "destructive", run: remove }] })
                            : remove()
                        }
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => updateB(b.id, (x) => x.block.type === "POOL" && x.block.entries.push({ id: ops.uid("e"), text: "" }))}>
                  <Plus className="h-3.5 w-3.5" /> Add entry
                </Button>
              </div>
            </Field>
          </>
        )}
      </Group>
      <Group title={`Questions in this group (${b.memberIds.length})`}>
        <div className="space-y-1">
          {b.memberIds.map((m) => {
            const q = a.items[m] as QuestionItem | undefined;
            if (!q) return null;
            return (
              <button key={m} onClick={() => select({ kind: "item", id: m })} className="block w-full truncate rounded px-2 py-1 text-left text-sm hover:bg-muted">
                {q.content.blankRef ? `(${q.content.blankRef}) ` : ""}
                {ops.plainText(q.content.prompt) || ("options" in q.content ? q.content.options.map((o) => ops.plainText(o.text)).join(" / ") : "(empty)")}
              </button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" onClick={() => addTool(blk.type === "POOL" ? "MATCHING" : blk.type === "PASSAGE" ? "SINGLE_CHOICE" : "TEXT_INPUT", { sectionId, groupId: b.id, index: b.memberIds.length })}>
          <Plus className="h-4 w-4" /> Add question to this group
        </Button>
      </Group>
    </>
  );
}

function SectionEditor({ s }: { s: Section }) {
  const { mutate, requestDeleteSection, addTool } = useBuilder.getState();
  const update = (p: Partial<Section>) => mutate((d) => Object.assign(d.sections.find((x) => x.id === s.id)!, p));
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{s.title || "Untitled section"}</div>
          <div className="text-xs text-muted-foreground">Section · {s.itemIds.length} item(s)</div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" aria-label="Delete section" onClick={() => requestDeleteSection(s.id)}><Trash2 className="h-4 w-4" /></Button>
      </div>
      <IssueList id={s.id} />
      <Group title="English">
        <Field label="Title" error={!s.title.trim() ? "Section title is required" : null}>
          <Input className="h-8" value={s.title} onChange={(e) => update({ title: e.target.value })} />
        </Field>
        <Field label="Instructions">
          <Textarea rows={3} value={s.instructions} onChange={(e) => update({ instructions: e.target.value })} />
        </Field>
      </Group>
      <Group title="Tiếng Việt">
        <Field label="Tiêu đề" error={!s.titleVi.trim() ? "Missing Vietnamese title" : null}>
          <Input className="h-8" value={s.titleVi} onChange={(e) => update({ titleVi: e.target.value })} />
        </Field>
        <Field label="Hướng dẫn">
          <Textarea rows={3} value={s.instructionsVi} onChange={(e) => update({ instructionsVi: e.target.value })} />
        </Field>
      </Group>
      <Group title="Content">
        <Button variant="outline" size="sm" onClick={() => addTool("SINGLE_CHOICE", { sectionId: s.id, groupId: null, index: s.itemIds.length })}>
          <Plus className="h-4 w-4" /> Add question to section
        </Button>
      </Group>
    </>
  );
}

export function PropertyPanel() {
  const a = useBuilder((s) => s.assignment);
  const sel = useBuilder((s) => s.selection);
  if (sel?.kind === "section") {
    const s = a.sections.find((x) => x.id === sel.id);
    if (s) return <SectionEditor s={s} />;
  }
  if (sel?.kind === "item") {
    const it = a.items[sel.id];
    if (it?.kind === "question") return <QuestionEditor key={it.id} q={it} />;
    if (it?.kind === "block") return <BlockEditor key={it.id} b={it} />;
  }
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold">Nothing selected</h3>
      <p className="mt-1 text-sm text-muted-foreground">Click a question, shared block or section heading on the page to edit its properties here.</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => (useBuilder.getState().set({ settingsOpen: true }), toast.dismiss())}>
        Open assignment settings
      </Button>
    </div>
  );
}
