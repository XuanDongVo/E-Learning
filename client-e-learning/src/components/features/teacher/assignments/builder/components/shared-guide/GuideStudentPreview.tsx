import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment } from "@/types/assignment-builder";
import * as ops from "../../ops";
import { buildStudentView, type SBlock, type SQuestion } from "../../student-view";
import { BlankChip, RichText } from "../RichText";

type Answer = string | string[];

function StudentBlock({ block }: { block: SBlock }) {
  if (block.type === "INSTRUCTIONS") return <p className="text-sm italic text-muted-foreground">{block.text}</p>;
  if (block.type === "MEDIA") return <div className="space-y-1">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {block.url ? <img src={block.url} alt={block.alt ?? ""} className="max-h-52 max-w-full rounded border object-contain" /> : <div className="rounded border border-dashed bg-muted p-6 text-xs">Ảnh chưa được cấu hình</div>}
    {block.caption && <p className="text-xs text-muted-foreground">{block.caption}</p>}
  </div>;
  if (block.type === "POOL") return <div className="rounded-md border bg-muted/30 p-3">
    {block.title && <p className="mb-2 text-sm font-medium">{block.title}</p>}
    <div className="grid gap-1 sm:grid-cols-2">{block.entries?.map((e) => <p key={e.id} className="text-sm"><strong>{e.letter}.</strong> {e.text}</p>)}</div>
  </div>;
  return <div className="rounded-md border bg-muted/20 p-3">
    {block.title && <h4 className="mb-1 font-semibold">{block.title}</h4>}
    <p className="text-sm leading-7"><RichText text={block.text ?? ""} renderBlank={(n) => <BlankChip n={n} />} /></p>
  </div>;
}

function StudentQuestion({ q, value, onChange }: { q: SQuestion; value: Answer | undefined; onChange: (answer: Answer) => void }) {
  return <div className="space-y-2 border-b py-3 last:border-b-0">
    <p className="text-sm"><strong className="mr-2">Câu {q.number ?? "—"}{q.blankRef != null ? ` (${q.blankRef})` : ""}.</strong><RichText text={q.prompt} /></p>
    {q.type === "TEXT_INPUT" && <input className="h-9 w-full rounded border bg-background px-3 text-sm" aria-label={`Trả lời câu ${q.number}`} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} placeholder="Nhập câu trả lời" />}
    {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && <div className="grid gap-1.5 sm:grid-cols-2">
      {q.options?.map((opt, i) => {
        const multi = q.type === "MULTIPLE_CHOICE";
        const selected = multi ? Array.isArray(value) && value.includes(opt.id) : value === opt.id;
        return <label key={opt.id} className="flex cursor-pointer items-start gap-2 text-sm">
          <input type={multi ? "checkbox" : "radio"} name={`guide-answer-${q.id}`} checked={!!selected} onChange={() => onChange(multi ? selected ? (value as string[]).filter((id) => id !== opt.id) : [...(Array.isArray(value) ? value : []), opt.id] : opt.id)} />
          <span>{ops.letter(i)}. <RichText text={opt.text} /></span>
        </label>;
      })}
    </div>}
    {q.type === "MATCHING" && <select className="h-9 rounded border bg-background px-3 text-sm" aria-label={`Chọn đáp án câu ${q.number}`} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Chọn đáp án —</option>
      {q.poolEntries?.map((entry) => <option key={entry.id} value={entry.id}>{entry.letter}. {entry.text}</option>)}
    </select>}
  </div>;
}

/** The same sanitized student-view model as Builder; no answer keys or Builder store access. */
export function GuideStudentPreview({ assignment }: { assignment: Assignment }) {
  const view = buildStudentView(assignment);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  return <div className="mx-auto max-w-3xl space-y-4 rounded-lg border bg-card p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
      <div><h3 className="text-lg font-semibold">{view.title}</h3><p className="text-xs text-muted-foreground">Grade {view.grade} · {view.totalQuestions} câu · {view.totalPoints} điểm</p></div>
      <Button size="sm" variant="outline" onClick={() => setAnswers({})}><RotateCcw className="h-4 w-4" /> Làm lại preview</Button>
    </div>
    <p className="text-xs text-muted-foreground">Preview thực hành được dựng từ student-view của Builder. Không lưu đáp án và không nộp bài.</p>
    {view.sections.map((section) => <section key={section.id} className="space-y-3">
      <h4 className="font-semibold">{section.title}</h4>
      {section.units.map((unit) => unit.kind === "group"
        ? <div key={unit.block.id} className="space-y-2"><StudentBlock block={unit.block} />
          <div className="pl-2">{unit.members.map((q) => <StudentQuestion key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswers((old) => ({ ...old, [q.id]: v }))} />)}</div>
        </div>
        : <StudentQuestion key={unit.q.id} q={unit.q} value={answers[unit.q.id]} onChange={(v) => setAnswers((old) => ({ ...old, [unit.q.id]: v }))} />)}
    </section>)}
  </div>;
}
