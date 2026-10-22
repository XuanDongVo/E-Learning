import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, Check, Copy, GripVertical, ImageIcon, MoreHorizontal, Plus, Trash2, Wand2 } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import * as ops from "@/components/features/teacher/assignments/builder/ops";
import { useBuilder } from "@/components/features/teacher/assignments/builder/store";
import type { BlockItem, ID, QuestionContent, QuestionItem, Section, ToolKey } from "@/types/assignment-builder";
import { validate } from "@/components/features/teacher/assignments/builder/validation";
import { BlankChip, RichText } from "./RichText";
import { TOOLS } from "./Toolbox";

const QUESTION_TOOL_DEFS = TOOLS.filter((t) => ops.isQuestionTool(t.key));

export function useNumbering() {
  const a = useBuilder((s) => s.assignment);
  return useMemo(() => ops.computeNumbering(a), [a]);
}
export function useIssues() {
  const a = useBuilder((s) => s.assignment);
  return useMemo(() => validate(a), [a]);
}

// export function createBlankQuestions(blockId: ID) {
//   const state = useBuilder.getState();
//   const assignment = state.assignment;
//   const block = assignment.items[blockId];
//   if (!block || block.kind !== "block" || block.block.type !== "PASSAGE") return;
//   const taken = new Set(block.memberIds.map((memberId) => {
//     const item = assignment.items[memberId];
//     return item?.kind === "question" ? item.content.blankRef : null;
//   }));
//   const location = ops.locate(assignment, blockId);
//   if (!location) {
//     toast.error("Could not find the passage in Composition.");
//     return;
//   }
//   const tokens = ops.blankTokens(block.block.text);
//   const created: ID[] = [];
//   ops.blankNumbers(block.block.text).forEach((number, index) => {
//     if (taken.has(number)) return;
//     const raw = tokens[index] ?? "";
//     const answers = /^\d+$/.test(raw.trim()) ? [""] : raw.split("|").map((value) => value.trim()).filter(Boolean);
//     const question = ops.createItem("TEXT_INPUT");
//     if (question.kind !== "question" || question.content.type !== "TEXT_INPUT") return;
//     question.content.prompt = `Answer blank (${number}) in the passage`;
//     question.content.acceptedAnswers = answers.length ? answers : [""];
//     question.content.blankRef = number;
//     created.push(question.id);
//     state.mutate((draft) => {
//       draft.items[question.id] = question;
//       ops.place(draft, question.id, { sectionId: location.sectionId, groupId: blockId, index: block.memberIds.length + index });
//     });
//   });
//   if (!created.length) {
//     toast("Every blank already has a question");
//     return;
//   }
//   state.select({ kind: "item", id: created[0] });
// }

export function createBlankQuestions(blockId: ID) {
  const st = useBuilder.getState();
  let created = 0;
  st.mutate((d) => {
    const b = d.items[blockId] as BlockItem;
    if (b.block.type !== "PASSAGE") return;
    const taken = new Set(b.memberIds.map((m) => (d.items[m] as QuestionItem).content.blankRef));
    const tokens = ops.blankTokens(b.block.text);
    ops.blankNumbers(b.block.text).forEach((n, i) => {
      if (taken.has(n)) return;
      const raw = tokens[i];
      const answers = /^\d+$/.test(raw.trim()) ? [""] : raw.split("|").map((x) => x.trim());
      const q = ops.createItem("TEXT_INPUT") as QuestionItem;
      if (q.content.type === "TEXT_INPUT") q.content.acceptedAnswers = answers;
      q.content.blankRef = n;
      d.items[q.id] = q;
      ops.place(d, q.id, { sectionId: ops.locate(d, blockId)!.sectionId, groupId: blockId, index: b.memberIds.length });
      created++;
    });
    // keep members ordered by blank number
    b.memberIds.sort((x, y) => ((d.items[x] as QuestionItem).content.blankRef ?? 999) - ((d.items[y] as QuestionItem).content.blankRef ?? 999));
  });
  toast(created ? `Created ${created} question(s) for blanks` : "Every blank already has a question");
}


function AddMenuItems({ onPick }: { onPick: (t: ToolKey) => void }) {
  return (
    <>
      {QUESTION_TOOL_DEFS.map((t) => (
        <DropdownMenuItem key={t.key} onClick={() => onPick(t.key)}>
          <t.icon className="h-4 w-4" /> {t.label}
        </DropdownMenuItem>
      ))}
    </>
  );
}

function ItemShell({ id, children, label }: { id: ID; children: ReactNode; label: string }) {
  const selected = useBuilder((s) => s.selection?.kind === "item" && s.selection.id === id);
  const item = useBuilder((s) => s.assignment.items[id]);
  const { select, mutate, duplicate, requestDeleteItem, addTool } = useBuilder.getState();
  const issues = useIssues().filter((i) => i.target.id === id);
  const errs = issues.filter((i) => i.level === "error").length;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: `c:${id}` });
  const addAt = (t: ToolKey, offset: 0 | 1) => {
    const loc = ops.locate(useBuilder.getState().assignment, id);
    if (loc) addTool(t, { ...loc, index: loc.index + offset });
  };
  return (
    <div
      ref={setNodeRef}
      id={`item-${id}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      onClick={(e) => {
        e.stopPropagation();
        select({ kind: "item", id });
      }}
      className={cn(
        "group/item relative rounded-md border bg-white transition-shadow",
        selected ? "border-slate-500 ring-2 ring-slate-200" : "border-slate-200 hover:border-slate-400",
        isDragging && "z-10 opacity-60 shadow-lg",
      )}
    >
      <div className={cn("absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-0.5 shadow-sm", selected ? "flex" : "hidden group-hover/item:flex")}>
        <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Move up" onClick={(e) => (e.stopPropagation(), mutate((d) => ops.moveBy(d, id, -1)))}>
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Move down" onClick={(e) => (e.stopPropagation(), mutate((d) => ops.moveBy(d, id, 1)))}>
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6" aria-label={`Actions for ${label}`} onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              disabled={(item?.kind === "question" && !!item.serverQuestionId) || (item?.kind === "block" && item.memberIds.length > 0)}
              onClick={() => duplicate(id)}
            >
              <Copy className="h-4 w-4" /> Duplicate
              {(item?.kind === "question" && !!item.serverQuestionId) || (item?.kind === "block" && item.memberIds.length > 0) ? " (not available for persisted questions/groups)" : ""}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Add before</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <AddMenuItems onPick={(t) => addAt(t, 0)} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Add after</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <AddMenuItems onPick={(t) => addAt(t, 1)} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => requestDeleteItem(id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-1 p-3 pl-1">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag ${label}`}
          className="mt-0.5 h-6 w-5 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
        {errs > 0 && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" title={`${errs} error(s)`} />}
      </div>
    </div>
  );
}

function InlineEditor({ q }: { q: QuestionItem }) {
  const mutate = useBuilder((s) => s.mutate);
  const c = q.content;
  const edit = (fn: (c: QuestionContent) => void) => mutate((d) => fn((d.items[q.id] as QuestionItem).content));
  const input = "w-full rounded border bg-background px-2 py-1 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const updateCommon = (field: "explanation" | "hint", value: string) =>
    edit((x) => {
      x[field] = value;
    });
  return (
    <div className="space-y-2 font-sans" onClick={(e) => e.stopPropagation()}>
      <span className="text-xs font-semibold text-primary">Sửa trực tiếp · {ops.TYPE_LABEL[c.type]}</span>
      {!c.blankRef && (
        <textarea autoFocus rows={2} className={input} placeholder="Nhập đề bài… ([[ea]] = gạch chân, {{1}} = chỗ trống)" value={c.prompt} onChange={(e) => edit((x) => (x.prompt = e.target.value))} />
      )}
      {(c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") && (
        <div className="space-y-1">
          {c.options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <input
                type={c.type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                checked={o.isCorrect}
                aria-label={`Đáp án đúng ${ops.letter(i)}`}
                onChange={() =>
                  edit((x) => {
                    if (!("options" in x)) return;
                    x.options.forEach((p, j) => {
                      if (c.type === "SINGLE_CHOICE") p.isCorrect = j === i;
                      else if (j === i) p.isCorrect = !p.isCorrect;
                    });
                  })
                }
              />
              <span className="w-4 text-xs text-muted-foreground">{ops.letter(i)}.</span>
              <input className={input} value={o.text} placeholder="Lựa chọn…" onChange={(e) => edit((x) => { if ("options" in x) x.options[i].text = e.target.value; })} />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label="Xóa lựa chọn" onClick={() => edit((x) => { if ("options" in x) x.options.splice(i, 1); })}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => edit((x) => { if ("options" in x) x.options.push({ id: ops.uid("o"), text: "", isCorrect: false }); })}><Plus className="h-3.5 w-3.5" /> Thêm lựa chọn</Button>
        </div>
      )}
      {c.type === "TRUE_FALSE" && (
        <div className="flex gap-4 text-sm">
          {(["TRUE", "FALSE"] as const).map((answer) => (
            <label key={answer} className="flex items-center gap-2">
              <input
                type="radio"
                name={`true-false-${q.id}`}
                checked={c.answer === answer}
                onChange={() => edit((x) => { if (x.type === "TRUE_FALSE") x.answer = answer; })}
              />
              {answer === "TRUE" ? "True" : "False"}
            </label>
          ))}
        </div>
      )}
      {c.type === "TEXT_INPUT" && (
        <input className={input} placeholder="Đáp án chấp nhận, cách nhau bằng dấu /" value={c.acceptedAnswers.join(" / ")} onChange={(e) => edit((x) => { if (x.type === "TEXT_INPUT") x.acceptedAnswers = e.target.value.split("/").map((s) => s.trim()); })} />
      )}
      {c.type === "CLOZE" && (
        <div className="space-y-2 rounded border bg-muted/20 p-2">
          <Textarea className={input} rows={2} value={c.prompt} onChange={(e) => edit((x) => { if (x.type === "CLOZE") x.prompt = e.target.value; })} placeholder="Use {{1}}, {{2}} for blanks" />
          {c.blanks.map((blank, index) => (
            <div key={blank.id} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">Blank {index + 1}</span>
              <Input className={input} value={blank.acceptedAnswers.join(" / ")} onChange={(e) => edit((x) => { if (x.type === "CLOZE") x.blanks[index].acceptedAnswers = e.target.value.split("/").map((value) => value.trim()); })} />
            </div>
          ))}
          <label className="flex items-center justify-between text-xs">
            Case sensitive
            <Switch checked={c.caseSensitive} onCheckedChange={(value) => edit((x) => { if (x.type === "CLOZE") x.caseSensitive = value; })} />
          </label>
        </div>
      )}
      {c.type === "MATCHING" && (
        <div className="space-y-1 rounded border bg-muted/20 p-2 text-xs">
          <p>{c.prompt || "Matching instructions"}</p>
          <p>
            Answer pool: {pool?.block.type === "POOL" ? pool.block.title || "Answer Pool" : "Not selected"}
          </p>
          <p>
            Correct entry: {pool?.block.type === "POOL" && entryIdx >= 0
              ? `${ops.letter(entryIdx)}. ${pool.block.entries[entryIdx].text}`
              : "Not selected"}
          </p>
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <Textarea rows={2} maxLength={500} value={c.hint ?? ""} placeholder="Hint (optional)" onChange={(e) => updateCommon("hint", e.target.value)} />
        <Textarea rows={2} maxLength={2000} value={c.explanation ?? ""} placeholder="Explanation (optional)" onChange={(e) => updateCommon("explanation", e.target.value)} />
      </div>
      <p className="text-[11px] text-muted-foreground">Điểm, chế độ chấm, nhóm… ở cột cài đặt nâng cao bên phải.</p>
    </div>
  );
}


function QuestionBody({ q }: { q: QuestionItem }) {
  const selected = useBuilder(
    (s) =>
      s.selection?.kind === "item" &&
      s.selection.id === q.id,
  );

  // if (
  //   selected &&
  //   [
  //     "SINGLE_CHOICE",
  //     "MULTIPLE_CHOICE",
  //     "TRUE_FALSE",
  //     "TEXT_INPUT",
  //     "CLOZE",
  //   ].includes(q.content.type)
  // ) {
  //   return <InlineEditor q={q} />;
  // }

  return <QuestionView q={q} />;
}



// function QuestionView({ q }: { q: QuestionItem }) {
//   const { numbers, total } = useNumbering();
//   const a = useBuilder((s) => s.assignment);
//   const c = q.content;
//   const num = numbers.get(q.id);
//   const answerBlank = (n: number, _raw: string, i: number) => {
//     if (c.type === "MULTI_TEXT_INPUT")
//       return <span className="mx-0.5 rounded bg-success/10 px-1.5 font-sans text-sm text-success">{c.blanks[i]?.acceptedAnswers[0] || `(${n})`}</span>;
//     if (c.type === "TEXT_INPUT")
//       return <span className="mx-0.5 rounded bg-success/10 px-1.5 font-sans text-sm text-success">{c.acceptedAnswers[0] || "____"}</span>;
//     return <span className="mx-0.5 inline-block w-16 border-b border-foreground/60" />;
//   };
//   const pool = c.type === "MATCHING" && c.poolId ? (a.items[c.poolId] as BlockItem | undefined) : undefined;
//   const entryIdx = pool?.block.type === "POOL" ? pool.block.entries.findIndex((e) => e.id === (c as { correctEntryId: string | null }).correctEntryId) : -1;
//   return (
//     <div className="space-y-2">
//       <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
//         <span className="shrink-0 font-sans text-xs font-semibold text-primary">
//           {q.config.isExample ? "Example" : `Câu ${num} / ${total}`}
//           {c.blankRef ? ` · Blank (${c.blankRef})` : ""}
//         </span>
//         <span className="font-sans text-[11px] text-muted-foreground">
//           {ops.TYPE_LABEL[c.type]} · {q.config.isExample ? "unscored" : `${q.config.points} pt`}
//           {/* {q.config.gradingMode} */}
//         </span>
//       </div>
//       {c.prompt ? (
//         <div className="text-[15px] leading-relaxed">
//           <RichText text={c.prompt} renderBlank={answerBlank} />
//         </div>
//       ) : !c.blankRef && !("options" in c) ? (
//         <div className="text-sm italic text-destructive">Empty prompt</div>
//       ) : null}
//       {(c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") && (
//         <div className={cn("grid gap-x-6 gap-y-1", c.options.length > 2 && "sm:grid-cols-4")}>
//           {c.options.map((o, i) => (
//             <div key={o.id} className={cn("flex items-center gap-1.5 text-[15px]", o.isCorrect && "font-medium text-success")}>
//               <span className="font-sans text-xs text-muted-foreground">{ops.letter(i)}.</span>
//               <RichText text={o.text || "—"} />
//               {o.isCorrect && <Check className="h-3.5 w-3.5" />}
//             </div>
//           ))}
//         </div>
//       )}
//       {c.type === "TEXT_INPUT" && (
//         <div className="flex flex-wrap items-center gap-2 font-sans text-sm">
//           {c.prefix && <span className="text-foreground">{c.prefix}</span>}
//           {!c.prompt.includes("{{") && <span className="min-w-40 flex-1 border-b border-dashed border-muted-foreground/50 pb-0.5 text-success">{c.acceptedAnswers.filter(Boolean).join(" / ") || <span className="text-destructive">no accepted answer</span>}</span>}
//           {c.cue && <span className="text-muted-foreground">{c.cue}</span>}
//         </div>
//       )}
//       {c.type === "MATCHING" && (
//         <div className="font-sans text-sm">
//           {entryIdx >= 0 ? (
//             <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">→ {ops.letter(entryIdx)}</span>
//           ) : (
//             <span className="text-destructive">No letter selected</span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

function QuestionView({ q }: { q: QuestionItem }) {
  const { numbers, total } = useNumbering();
  const a = useBuilder((s) => s.assignment);
  const c = q.content;
  const num = numbers.get(q.id);
  const answerBlank = (n: number, _raw: string, i: number) => {
    if (c.type === "MULTI_TEXT_INPUT")
      return <span className="mx-0.5 rounded bg-success/10 px-1.5 font-sans text-sm text-success">{c.blanks[i]?.acceptedAnswers[0] || `(${n})`}</span>;
    if (c.type === "TEXT_INPUT")
      return <span className="mx-0.5 rounded bg-success/10 px-1.5 font-sans text-sm text-success">{c.acceptedAnswers[0] || "____"}</span>;
    return <span className="mx-0.5 inline-block w-16 border-b border-foreground/60" />;
  };
  const pool = c.type === "MATCHING" && c.poolId ? (a.items[c.poolId] as BlockItem | undefined) : undefined;
  const entryIdx = pool?.block.type === "POOL" ? pool.block.entries.findIndex((e) => e.id === (c as { correctEntryId: string | null }).correctEntryId) : -1;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="shrink-0 font-sans text-xs font-semibold text-primary">
          {q.config.isExample ? "Example" : `Câu ${num} / ${total}`}
          {c.blankRef ? ` · Blank (${c.blankRef})` : ""}
        </span>
      </div>
      {c.prompt ? (
        <div className="text-[15px] leading-relaxed">
          <RichText text={c.prompt} renderBlank={answerBlank} />
        </div>
      ) : !c.blankRef && !("options" in c) ? (
        <div className="text-sm italic text-destructive">Empty prompt</div>
      ) : null}
      {(c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") && (
        <div className={cn("grid gap-x-6 gap-y-1", c.options.length > 2 && "sm:grid-cols-4")}>
          {c.options.map((o, i) => (
            <div key={o.id} className={cn("flex items-center gap-1.5 text-[15px]", o.isCorrect && "font-medium text-success")}>
              <span className="font-sans text-xs text-muted-foreground">{ops.letter(i)}.</span>
              <RichText text={o.text || "—"} />
              {o.isCorrect && <Check className="h-3.5 w-3.5" />}
            </div>
          ))}
        </div>
      )}
      {c.type === "TEXT_INPUT" && (
        <div className="flex flex-wrap items-center gap-2 font-sans text-sm">
          {c.prefix && <span className="text-foreground">{c.prefix}</span>}
          {!c.prompt.includes("{{") && <span className="min-w-40 flex-1 border-b border-dashed border-muted-foreground/50 pb-0.5 text-success">{c.acceptedAnswers.filter(Boolean).join(" / ") || <span className="text-destructive">no accepted answer</span>}</span>}
          {c.cue && <span className="text-muted-foreground">{c.cue}</span>}
        </div>
      )}
      {c.type === "MATCHING" && (
        <div className="font-sans text-sm">
          {entryIdx >= 0 ? (
            <span className="rounded bg-success/10 px-2 py-0.5 font-medium text-success">→ {ops.letter(entryIdx)}</span>
          ) : (
            <span className="text-destructive">No letter selected</span>
          )}
        </div>
      )}
    </div>
  );
}

function BlockBody({ b }: { b: BlockItem }) {
  const a = useBuilder((s) => s.assignment);
  const selection = useBuilder((s) => s.selection);
  const select = useBuilder((s) => s.select);
  const block = b.block;
  if (block.type === "INSTRUCTIONS") return <p className="text-[15px] italic text-muted-foreground">{block.text || "Empty instructions"}</p>;
  if (block.type === "MEDIA")
    return (
      <figure className="space-y-1">
        {block.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={block.url} alt={block.alt} className="max-h-56 rounded border object-contain" />
        ) : (
          <div className="grid h-28 w-44 place-items-center rounded border border-dashed bg-muted/50 text-muted-foreground">
            <div className="text-center font-sans text-xs">
              <ImageIcon className="mx-auto mb-1 h-5 w-5" />
              {block.alt || "No alt text"}
            </div>
          </div>
        )}
        {block.caption && <figcaption className="font-sans text-xs text-muted-foreground">{block.caption}</figcaption>}
      </figure>
    );
  if (block.type === "POOL")
    return (
      <div className="grid gap-x-6 gap-y-1 rounded border bg-muted/30 p-3 sm:grid-cols-2">
        {block.entries.map((e, i) => (
          <div key={e.id} className="text-[15px]">
            <span className="mr-1.5 font-sans font-semibold text-primary">{ops.letter(i)}.</span>
            {e.text}
          </div>
        ))}
      </div>
    );
  const byBlank = new Map(b.memberIds.map((m) => [(a.items[m] as QuestionItem)?.content.blankRef, m]));
  return (
    <div>
      <h4 className="mb-1 text-center text-base font-semibold">{block.title}</h4>
      <p className="text-[15px] leading-8">
        <RichText
          text={block.text}
          renderBlank={(n) => {
            const qid = byBlank.get(n);
            return (
              <BlankChip
                n={n}
                active={!!qid && selection?.id === qid}
                onClick={() => (qid ? select({ kind: "item", id: qid }) : toast(`Blank (${n}) has no question yet`, { action: { label: "Create", onClick: () => createBlankQuestions(b.id) } }))}
              />
            );
          }}
        />
      </p>
    </div>
  );
}

function GroupCard({ b }: { b: BlockItem }) {
  const a = useBuilder((s) => s.assignment);
  const addTool = useBuilder((s) => s.addTool);
  const { setNodeRef, isOver } = useDroppable({ id: `cg:${b.id}` });
  const sectionId = ops.locate(a, b.id)?.sectionId ?? "";
  const label = ops.blockLabel(b);
  return (
    <ItemShell id={b.id} label={label}>
      <div className="mb-2 flex items-center gap-2 font-sans text-xs text-muted-foreground">
        <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{ops.TYPE_LABEL[b.block.type]}</span>
        <span className="truncate">
          {label} · {b.memberIds.length} question{b.memberIds.length === 1 ? "" : "s"}
        </span>
      </div>
      <BlockBody b={b} />
      <div ref={setNodeRef} className={cn("mt-3 space-y-2 border-l-2 pl-3", isOver ? "border-slate-500" : "border-slate-300")}>
        <SortableContext items={b.memberIds.map((m) => `c:${m}`)} strategy={verticalListSortingStrategy}>
          {b.memberIds.map((m) => {
            const q = a.items[m];
            return q?.kind === "question" ? (
              <ItemShell key={m} id={m} label="question">
                <QuestionBody q={q} />
              </ItemShell>
            ) : null;
          })}
        </SortableContext>
        <div className="flex flex-wrap gap-2 py-1 font-sans" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                <Plus className="h-3.5 w-3.5" /> Add question to this group
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <AddMenuItems onPick={(t) => addTool(t, { sectionId, groupId: b.id, index: b.memberIds.length })} />
            </DropdownMenuContent>
          </DropdownMenu>
          {b.block.type === "PASSAGE" && ops.blankTokens(b.block.text).length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => createBlankQuestions(b.id)}>
              <Wand2 className="h-3.5 w-3.5" /> Create questions for all blanks
            </Button>
          )}
        </div>
      </div>
    </ItemShell>
  );
}

function SectionView({ s, index }: { s: Section; index: number }) {
  const a = useBuilder((st) => st.assignment);
  const selected = useBuilder((st) => st.selection?.kind === "section" && st.selection.id === s.id);
  const select = useBuilder((st) => st.select);
  const addTool = useBuilder((st) => st.addTool);
  const { setNodeRef, isOver } = useDroppable({ id: `cs:${s.id}` });
  return (
    <section id={`section-${s.id}`} className="space-y-3">
      <div
        onClick={(e) => (e.stopPropagation(), select({ kind: "section", id: s.id }))}
        className={cn("cursor-pointer rounded-md border px-3 py-2", selected ? "border-slate-500 ring-2 ring-slate-200" : "border-slate-200 hover:border-slate-400")}
      >
        <h3 className={cn("text-lg font-bold", !s.title.trim() && "italic text-destructive")}>{s.title || `Section ${index + 1} (untitled)`}</h3>
        {s.titleVi && <div className="font-sans text-xs text-muted-foreground">{s.titleVi}</div>}
        {s.instructions && <p className="mt-1 text-[15px] italic">{s.instructions}</p>}
        {s.instructionsVi && <p className="font-sans text-xs italic text-muted-foreground">{s.instructionsVi}</p>}
      </div>
      <div ref={setNodeRef} className={cn("min-h-12 space-y-3 rounded-md", isOver && "bg-slate-50")}>
        <SortableContext items={s.itemIds.map((id) => `c:${id}`)} strategy={verticalListSortingStrategy}>
          {s.itemIds.map((id) => {
            const it = a.items[id];
            if (!it) return null;
            return it.kind === "block" ? (
              <GroupCard key={id} b={it} />
            ) : (
              <ItemShell key={id} id={id} label="question">
                <QuestionBody q={it} />
              </ItemShell>
            );
          })}
        </SortableContext>
        {s.itemIds.length === 0 && (
          <div className="rounded-md border border-dashed p-4 text-center font-sans text-sm text-muted-foreground">
            Empty section — drop content here or{" "}
            <button className="font-medium text-primary hover:underline" onClick={() => addTool("SINGLE_CHOICE", { sectionId: s.id, groupId: null, index: 0 })}>
              add a question
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function Canvas() {
  const a = useBuilder((s) => s.assignment);
  const select = useBuilder((s) => s.select);
  const addTool = useBuilder((s) => s.addTool);
  const { total, points } = useNumbering();
  const empty = Object.keys(a.items).length === 0;
  return (
    <div className="px-4 py-6 sm:px-8" onClick={() => select(null)}>
      <article className="mx-auto max-w-[820px] rounded-lg border border-slate-200 bg-white font-serif shadow-sm">
        <header className="border-b px-8 py-6 sm:px-12">
          <div className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">English · Grade {a.grade}</div>
          <h2 className="mt-1 text-2xl font-bold">{a.title || "Untitled assignment"}</h2>
          {a.instructions && <p className="mt-2 text-[15px] italic text-muted-foreground">{a.instructions}</p>}
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-sans text-xs text-muted-foreground">
            <div><dt className="inline">Questions: </dt><dd className="inline font-semibold text-foreground">{total}</dd></div>
            <div><dt className="inline">Total points: </dt><dd className="inline font-semibold text-foreground">{Math.round(points * 100) / 100}</dd></div>
            <div><dt className="inline">Sections: </dt><dd className="inline font-semibold text-foreground">{a.sections.length}</dd></div>
            {a.settings.timeLimitMin ? <div><dt className="inline">Time: </dt><dd className="inline font-semibold text-foreground">{a.settings.timeLimitMin} min</dd></div> : null}
          </dl>
        </header>
        <div className="space-y-8 px-6 py-6 sm:px-10">
          {empty && (
            <div className="py-10 text-center font-sans">
              <p className="text-sm text-muted-foreground">This assignment has no questions yet.</p>
              <Button className="mt-3" onClick={(e) => (e.stopPropagation(), addTool("SINGLE_CHOICE"))}>
                <Plus className="h-4 w-4" /> Add your first question
              </Button>
            </div>
          )}
          {a.sections.map((s, i) => (
            <SectionView key={s.id} s={s} index={i} />
          ))}
          <div className="flex justify-center font-sans">
            <Button variant="outline" size="sm" onClick={(e) => (e.stopPropagation(), addTool("SECTION"))}>
              <Plus className="h-4 w-4" /> Add section
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
