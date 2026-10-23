import {
  AlertCircle,
  AlertTriangle,
  Copy,
  Plus,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { toast } from "sonner";
import { contentService } from "@/services/content.service";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import * as ops from "@/components/features/teacher/assignments/builder/ops";
import { useBuilder } from "@/components/features/teacher/assignments/builder/store";
import type {
  BlockContent,
  BlockItem,
  ID,
  QuestionItem,
  Section,
} from "@/types/assignment-builder";
import { createBlankQuestions, useIssues, useNumbering } from "./Canvas";

function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 border-b px-4 py-4 last:border-0">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

const MARKUP_HINT =
  "[[ea]] underlines text · {{1}} or {{answer|alt}} inserts a blank";

function IssueList({ id }: { id: ID }) {
  const issues = useIssues().filter((i) => i.target.id === id);
  if (!issues.length) return null;
  return (
    <div className="space-y-1 border-b px-4 py-3">
      {issues.map((i) => (
        <div
          key={i.key}
          className={cn(
            "flex items-start gap-2 text-xs",
            i.level === "error"
              ? "text-destructive"
              : "text-warning-foreground",
          )}
        >
          {i.level === "error" ? (
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-warning" />
          )}
          {i.message}
        </div>
      ))}
    </div>
  );
}

const updateQ = (id: ID, fn: (q: QuestionItem) => void) =>
  useBuilder.getState().mutate((d) => fn(d.items[id] as QuestionItem));
const updateB = (id: ID, fn: (b: BlockItem) => void) =>
  useBuilder.getState().mutate((d) => fn(d.items[id] as BlockItem));

function ListEditor({
  values,
  onChange,
  placeholder,
  addLabel,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex gap-1">
          <Input
            value={v}
            placeholder={placeholder}
            onChange={(e) =>
              onChange(values.map((x, j) => (j === i ? e.target.value : x)))
            }
            className="h-8"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            aria-label="Remove"
            disabled={values.length <= 1}
            onClick={() => onChange(values.filter((_, j) => j !== i))}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-primary"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

function ClozeEditor({ q }: { q: QuestionItem }) {
  if (q.content.type !== "CLOZE") return null;

  const c = q.content;
  const blankCount = ops.blankTokens(c.prompt).length;
  const needsSync = blankCount !== c.blanks.length;

  const setPrompt = (prompt: string) =>
    updateQ(q.id, (x) => {
      if (x.content.type !== "CLOZE") return;
      x.content.prompt = prompt;
    });

  const syncBlanks = () =>
    updateQ(q.id, (x) => {
      if (x.content.type !== "CLOZE") return;

      const count = ops.blankTokens(x.content.prompt).length;
      const current = x.content.blanks;

      while (current.length < count) {
        const index = current.length + 1;

        current.push({
          id: ops.uid("bl"),
          key: `blank-${index}`,
          acceptedAnswers: [""],
        });
      }

      if (current.length > count) {
        current.length = count;
      }

      current.forEach((blank, index) => {
        blank.key = `blank-${index + 1}`;
      });

      // Keep segments synchronized with blanks.
      while (x.content.segments.length < count + 1) {
        x.content.segments.push({
          id: ops.uid("seg"),
          text: "",
        });
      }

      if (x.content.segments.length > count + 1) {
        x.content.segments.length = count + 1;
      }
    });

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/20 p-3 space-y-3">
        <div className="flex items-center justify-center">
          {needsSync && (
            <Button variant="outline" size="sm" onClick={syncBlanks}>
              Sync answer sets ({blankCount} blanks)
            </Button>
          )}
        </div>
        {c.blanks.map((b, i) => (
          <div
            key={b.id}
            className="space-y-1.5 rounded-md border bg-background p-2"
          >
            <div className="text-xs font-medium">
              Blank {i + 1} — accepted answers
            </div>

            <ListEditor
              values={b.acceptedAnswers}
              placeholder="Answer"
              addLabel="Add alternative"
              onChange={(values) =>
                updateQ(q.id, (x) => {
                  if (x.content.type !== "CLOZE") return;

                  const blank = x.content.blanks[i];
                  if (!blank) return;

                  blank.acceptedAnswers = values;
                })
              }
            />
          </div>
        ))}
      </div>

      <label className="flex items-center justify-between text-sm">
        Case sensitive
        <Switch
          checked={c.caseSensitive}
          onCheckedChange={(value) =>
            updateQ(q.id, (x) => {
              if (x.content.type !== "CLOZE") return;
              x.content.caseSensitive = value;
            })
          }
        />
      </label>
    </div>
  );
}

function MatchingEditor({ q }: { q: QuestionItem }) {
  const a = useBuilder((s) => s.assignment);
  if (q.content.type !== "MATCHING") return null;

  const c = q.content;

  // Chỉ cho phép chọn Answer Pool thuộc cùng Section.
  const questionLocation = ops.locate(a, q.id);

  const pools = Object.values(a.items).filter(
    (
      item,
    ): item is BlockItem & {
      block: Extract<BlockContent, { type: "POOL" }>;
    } => {
      if (item.kind !== "block" || item.block.type !== "POOL") {
        return false;
      }

      const location = ops.locate(a, item.id);

      return (
        !!questionLocation && location?.sectionId === questionLocation.sectionId
      );
    },
  );

  // const selectedItem = c.poolId ? a.items[c.poolId] : undefined;

  const pool = pools.find((item) => item.id === c.poolId);

  return (
    <Group title="Matching">
      <Field
        label="Answer pool"
        hint="Choose a shared answer pool from this section."
        error={!pool ? "Please select an answer pool." : null}
      >
        <Select
          value={pool ? c.poolId! : "none"}
          onValueChange={(value) =>
            updateQ(q.id, (x) => {
              if (x.content.type !== "MATCHING") return;

              x.content.poolId = value === "none" ? null : value;

              // Đổi Pool phải chọn lại đáp án.
              x.content.correctEntryId = null;
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Choose answer pool" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="none">Choose an answer pool…</SelectItem>

            {pools.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.block.title || "Untitled answer pool"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {pools.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add an Answer Pool block to this section first.
          </p>
        )}
      </Field>

      {pool && (
        <Field
          label="Correct answer"
          hint="Select the letter that matches this question."
          error={
            !c.correctEntryId ||
            !pool.block.entries.some((entry) => entry.id === c.correctEntryId)
              ? "Please select the correct answer."
              : null
          }
        >
          <div className="flex flex-wrap gap-2">
            {pool.block.entries.map((entry, index) => {
              const selected = c.correctEntryId === entry.id;
              const letter = ops.letter(index);

              return (
                <button
                  key={entry.id}
                  type="button"
                  title={entry.text || `Option ${letter}`}
                  aria-label={`Correct answer ${letter}: ${
                    entry.text || "empty entry"
                  }`}
                  aria-pressed={selected}
                  onClick={() =>
                    updateQ(q.id, (x) => {
                      if (x.content.type !== "MATCHING") return;

                      x.content.correctEntryId = entry.id;
                    })
                  }
                  className={cn(
                    "flex min-h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-semibold transition",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted",
                  )}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {c.correctEntryId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Selected answer:{" "}
              {pool.block.entries.find((entry) => entry.id === c.correctEntryId)
                ?.text || "Empty entry"}
            </p>
          )}

          {pool.block.entries.length === 0 && (
            <p className="text-xs text-destructive">
              This pool has no entries. Add an entry in the Answer Pool editor.
            </p>
          )}
        </Field>
      )}
    </Group>
  );
}

// function QuestionEditor({ q }: { q: QuestionItem }) {
//   const a = useBuilder((s) => s.assignment);
//   const { duplicate, requestDeleteItem } = useBuilder.getState();
//   const { numbers, total } = useNumbering();
//   const c = q.content;
//   return (
//     <>
//       <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
//         <div className="min-w-0">
//           <div className="truncate text-sm font-semibold">
//             {q.config.isExample
//               ? "Example item"
//               : `Question ${numbers.get(q.id)} / ${total}`}
//           </div>
//           <div className="text-xs text-muted-foreground">
//             {ops.TYPE_LABEL[c.type]}
//           </div>
//         </div>
//         <div className="flex gap-1">
//           <Button
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8"
//             onClick={() => duplicate(q.id)}
//           >
//             <Copy className="h-4 w-4" />
//           </Button>
//           <Button
//             size="icon"
//             variant="ghost"
//             className="h-8 w-8 text-destructive"
//             onClick={() => requestDeleteItem(q.id)}
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//       <IssueList id={q.id} />
//       <Group title="Content">
//         <Field
//           label="Prompt"
//           error={!c.prompt.trim() && !c.blankRef ? "Content is required" : null}
//         >
//           <Textarea
//             rows={3}
//             value={c.prompt}
//             onChange={(e) =>
//               updateQ(q.id, (x) => {
//                 x.content.prompt = e.target.value;
//               })
//             }
//           />
//         </Field>
//         {(c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") && (
//           <Field
//             label="Options"
//             error={
//               c.options.length < 2
//                 ? "At least 2 options"
//                 : !c.options.some((o) => o.isCorrect)
//                   ? "Mark the correct answer"
//                   : null
//             }
//           >
//             <div className="space-y-1.5">
//               {c.options.map((o, i) => (
//                 <div key={o.id} className="flex items-center gap-1.5">
//                   {c.type === "SINGLE_CHOICE" ? (
//                     <input
//                       type="radio"
//                       name={`correct-${q.id}`}
//                       checked={o.isCorrect}
//                       onChange={() =>
//                         updateQ(q.id, (x) => {
//                           if ("options" in x.content)
//                             x.content.options.forEach(
//                               (y) => (y.isCorrect = y.id === o.id),
//                             );
//                         })
//                       }
//                     />
//                   ) : (
//                     <Checkbox
//                       checked={o.isCorrect}
//                       onCheckedChange={(v) =>
//                         updateQ(q.id, (x) => {
//                           if ("options" in x.content)
//                             x.content.options[i].isCorrect = !!v;
//                         })
//                       }
//                     />
//                   )}
//                   <span className="w-4 text-xs text-muted-foreground">
//                     {ops.letter(i)}
//                   </span>
//                   <Input
//                     className="h-8"
//                     value={o.text}
//                     onChange={(e) =>
//                       updateQ(q.id, (x) => {
//                         if ("options" in x.content)
//                           x.content.options[i].text = e.target.value;
//                       })
//                     }
//                   />
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8"
//                     onClick={() =>
//                       updateQ(q.id, (x) => {
//                         if ("options" in x.content)
//                           x.content.options.splice(i, 1);
//                       })
//                     }
//                   >
//                     <X className="h-3.5 w-3.5" />
//                   </Button>
//                 </div>
//               ))}
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() =>
//                   updateQ(q.id, (x) => {
//                     if ("options" in x.content)
//                       x.content.options.push({
//                         id: ops.uid("o"),
//                         text: `Option ${ops.letter(x.content.options.length)}`,
//                         isCorrect: false,
//                       });
//                   })
//                 }
//               >
//                 <Plus className="h-3.5 w-3.5" /> Add option
//               </Button>
//             </div>
//           </Field>
//         )}
//         {c.type === "TRUE_FALSE" && (
//           <Field label="Correct answer">
//             <Select
//               value={c.answer ?? "none"}
//               onValueChange={(v) =>
//                 updateQ(q.id, (x) => {
//                   if (x.content.type === "TRUE_FALSE")
//                     x.content.answer =
//                       v === "none" ? null : (v as "TRUE" | "FALSE");
//                 })
//               }
//             >
//               <SelectTrigger className="h-8">
//                 <SelectValue placeholder="Choose answer" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="none">Not set</SelectItem>
//                 <SelectItem value="TRUE">True</SelectItem>
//                 <SelectItem value="FALSE">False</SelectItem>
//               </SelectContent>
//             </Select>
//           </Field>
//         )}
//         {c.type === "TEXT_INPUT" && (
//           <>
//             <Field label="Accepted answers">
//               <ListEditor
//                 values={c.acceptedAnswers}
//                 placeholder="Accepted answer"
//                 addLabel="Add alternative"
//                 onChange={(v) =>
//                   updateQ(q.id, (x) => {
//                     if (x.content.type === "TEXT_INPUT")
//                       x.content.acceptedAnswers = v;
//                   })
//                 }
//               />
//             </Field>
//             <label className="flex items-center justify-between text-sm">
//               Case sensitive
//               <Switch
//                 checked={c.caseSensitive}
//                 onCheckedChange={(v) =>
//                   updateQ(q.id, (x) => {
//                     if (x.content.type === "TEXT_INPUT")
//                       x.content.caseSensitive = v;
//                   })
//                 }
//               />
//             </label>
//           </>
//         )}
//         {c.type === "CLOZE" && <ClozeEditor q={q} />}{" "}
//         {c.type === "MATCHING" && <MatchingEditor q={q} />}
//       </Group>
//       <Group title="Scoring">
//         <div className="grid grid-cols-2 gap-2">
//           <Field
//             label="Points"
//             error={
//               !q.config.isExample && !(q.config.points > 0)
//                 ? "Must be > 0"
//                 : null
//             }
//           >
//             <Input
//               type="number"
//               min={0}
//               step="0.25"
//               className="h-8"
//               value={Number.isFinite(q.config.points) ? q.config.points : ""}
//               onChange={(e) =>
//                 updateQ(q.id, (x) => {
//                   x.config.points =
//                     e.target.value === "" ? NaN : Number(e.target.value);
//                 })
//               }
//             />
//           </Field>
//         </div>
//         <label className="flex items-center justify-between text-sm">
//           Required
//           <Switch
//             checked={q.config.required}
//             onCheckedChange={(v) =>
//               updateQ(q.id, (x) => {
//                 x.config.required = v;
//               })
//             }
//           />
//         </label>
//       </Group>
//       <Group title="Shared content">
//         <Field label="Belongs to">
//           <Select
//             value={q.config.groupId ?? "none"}
//             onValueChange={(v) => {
//               const d = useBuilder.getState();
//               d.mutate((draft) => {
//                 const loc = ops.locate(draft, q.id);
//                 if (!loc) return;
//                 if (v === "none")
//                   ops.moveTo(draft, q.id, {
//                     sectionId: loc.sectionId,
//                     groupId: null,
//                     index: loc.index + 1,
//                   });
//                 else {
//                   const b = draft.items[v] as BlockItem;
//                   ops.moveTo(draft, q.id, {
//                     sectionId: loc.sectionId,
//                     groupId: v,
//                     index: b.memberIds.length,
//                   });
//                 }
//               });
//             }}
//           >
//             <SelectTrigger className="h-8">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="none">Standalone</SelectItem>
//               {ops
//                 .docOrder(a)
//                 .map((e) => a.items[e.id])
//                 .filter((x): x is BlockItem => x?.kind === "block")
//                 .map((b) => (
//                   <SelectItem key={b.id} value={b.id}>
//                     {ops.blockLabel(b)}
//                   </SelectItem>
//                 ))}
//             </SelectContent>
//           </Select>
//         </Field>
//       </Group>

//       <Group title="Feedback (hidden from students)">
//         <Field label="Explanation">
//           <Textarea
//             rows={2}
//             value={c.explanation ?? ""}
//             onChange={(e) =>
//               updateQ(q.id, (x) => (x.content.explanation = e.target.value))
//             }
//           />
//         </Field>
//         <Field label="Hint">
//           <Input
//             className="h-8"
//             value={c.hint ?? ""}
//             onChange={(e) =>
//               updateQ(q.id, (x) => (x.content.hint = e.target.value))
//             }
//           />
//         </Field>
//       </Group>
//     </>
//   );
// }

function QuestionEditor({ q }: { q: QuestionItem }) {
  const a = useBuilder((s) => s.assignment);
  const { duplicate, requestDeleteItem, mutate, select } =
    useBuilder.getState();
  const { numbers, total } = useNumbering();
  const c = q.content;
  const needsClozeSync =
    (c.type === "CLOZE" || c.type === "MULTI_TEXT_INPUT") &&
    (ops.blankTokens(c.prompt).length !== c.blanks.length ||
      (c.type === "CLOZE" &&
        (c.segments.length !== ops.clozeSegmentsFromPrompt(c.prompt).length ||
          c.segments.some(
            (segment, index) =>
              segment.text !== ops.clozeSegmentsFromPrompt(c.prompt)[index],
          ))));
  const group = q.config.groupId
    ? (a.items[q.config.groupId] as BlockItem | undefined)
    : undefined;
  const blocks = ops
    .docOrder(a)
    .map((e) => a.items[e.id])
    .filter((x): x is BlockItem => x?.kind === "block");
  const questionSectionId = ops.locate(a, q.id)?.sectionId;
  const pools = blocks.filter(
    (b) =>
      b.block.type === "POOL" &&
      ops.locate(a, b.id)?.sectionId === questionSectionId,
  );

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {q.config.isExample
              ? "Example item"
              : `Câu ${numbers.get(q.id)} / ${total}`}
          </div>
          <div className="text-xs text-muted-foreground">
            {ops.TYPE_LABEL[c.type]}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Duplicate"
            onClick={() => duplicate(q.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            aria-label="Delete"
            onClick={() => requestDeleteItem(q.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <IssueList id={q.id} />
      <Group title="Content">
        <Field
          label="Prompt"
          hint={MARKUP_HINT}
          error={
            !c.prompt.trim() && !c.blankRef && !("options" in c)
              ? "Prompt is required"
              : null
          }
        >
          <Textarea
            rows={3}
            value={c.prompt}
            onChange={(e) =>
              updateQ(q.id, (x) => (x.content.prompt = e.target.value))
            }
            placeholder={
              c.blankRef
                ? "Optional — the blank is in the passage"
                : "Type the question…"
            }
          />
        </Field>

        {(c.type === "SINGLE_CHOICE" || c.type === "MULTIPLE_CHOICE") && (
          <Field
            label={
              c.type === "SINGLE_CHOICE"
                ? "Options (select the correct one)"
                : "Options (tick all correct)"
            }
            error={
              c.options.length < 2
                ? "At least 2 options"
                : !c.options.some((o) => o.isCorrect)
                  ? "Mark the correct answer"
                  : null
            }
          >
            <div className="space-y-1.5">
              {c.options.map((o, i) => (
                <div key={o.id} className="flex items-center gap-1.5">
                  {c.type === "SINGLE_CHOICE" ? (
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      aria-label={`Mark ${ops.letter(i)} correct`}
                      checked={o.isCorrect}
                      className="h-4 w-4 shrink-0 accent-success"
                      onChange={() =>
                        updateQ(
                          q.id,
                          (x) =>
                            "options" in x.content &&
                            x.content.options.forEach(
                              (y) => (y.isCorrect = y.id === o.id),
                            ),
                        )
                      }
                    />
                  ) : (
                    <Checkbox
                      aria-label={`Mark ${ops.letter(i)} correct`}
                      checked={o.isCorrect}
                      onCheckedChange={(v) =>
                        updateQ(
                          q.id,
                          (x) =>
                            "options" in x.content &&
                            (x.content.options[i].isCorrect = !!v),
                        )
                      }
                    />
                  )}
                  <span className="w-4 shrink-0 text-xs text-muted-foreground">
                    {ops.letter(i)}
                  </span>
                  <Input
                    className={cn(
                      "h-8",
                      !o.text.trim() && "border-destructive",
                    )}
                    value={o.text}
                    onChange={(e) =>
                      updateQ(
                        q.id,
                        (x) =>
                          "options" in x.content &&
                          (x.content.options[i].text = e.target.value),
                      )
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    aria-label="Remove option"
                    onClick={() =>
                      updateQ(
                        q.id,
                        (x) =>
                          "options" in x.content &&
                          x.content.options.splice(i, 1),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() =>
                  updateQ(
                    q.id,
                    (x) =>
                      "options" in x.content &&
                      x.content.options.push({
                        id: ops.uid("o"),
                        text: `Option ${ops.letter(x.content.options.length)}`,
                        isCorrect: false,
                      }),
                  )
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add option
              </Button>
            </div>
          </Field>
        )}
        {c.type === "SINGLE_CHOICE" && (
          <Field label="Student control">
            <Select
              value={c.display}
              onValueChange={(v) =>
                updateQ(
                  q.id,
                  (x) =>
                    x.content.type === "SINGLE_CHOICE" &&
                    (x.content.display = v as "list" | "dropdown"),
                )
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">Radio buttons</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}

        {c.type === "TEXT_INPUT" && (
          <>
            <Field
              label="Accepted answers"
              error={
                q.config.gradingMode === "AUTO" &&
                !c.acceptedAnswers.some((x) => x.trim())
                  ? "Add at least one accepted answer"
                  : null
              }
            >
              <ListEditor
                values={c.acceptedAnswers}
                placeholder="Accepted answer"
                addLabel="Add alternative"
                onChange={(v) =>
                  updateQ(
                    q.id,
                    (x) =>
                      x.content.type === "TEXT_INPUT" &&
                      (x.content.acceptedAnswers = v),
                  )
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Prefix (optional)">
                <Input
                  className="h-8"
                  placeholder="→ What subject"
                  value={c.prefix ?? ""}
                  onChange={(e) =>
                    updateQ(
                      q.id,
                      (x) =>
                        x.content.type === "TEXT_INPUT" &&
                        (x.content.prefix = e.target.value),
                    )
                  }
                />
              </Field>
              <Field label="Visible cue (optional)">
                <Input
                  className="h-8"
                  placeholder="(not listen)"
                  value={c.cue ?? ""}
                  onChange={(e) =>
                    updateQ(
                      q.id,
                      (x) =>
                        x.content.type === "TEXT_INPUT" &&
                        (x.content.cue = e.target.value),
                    )
                  }
                />
              </Field>
            </div>
            <label className="flex items-center justify-between text-sm">
              Case sensitive
              <Switch
                checked={c.caseSensitive}
                onCheckedChange={(v) =>
                  updateQ(
                    q.id,
                    (x) =>
                      x.content.type === "TEXT_INPUT" &&
                      (x.content.caseSensitive = v),
                  )
                }
              />
            </label>
          </>
        )}

        {(c.type === "MULTI_TEXT_INPUT" || c.type === "CLOZE") && (
          <>
            {needsClozeSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateQ(q.id, (x) => {
                    if (x.content.type === "CLOZE") {
                      const synced = ops.syncClozeContent(x.content);
                      x.content.segments = synced.segments;
                      x.content.blanks = synced.blanks;
                    } else if (x.content.type === "MULTI_TEXT_INPUT") {
                      const count = ops.blankTokens(x.content.prompt).length;
                      while (x.content.blanks.length < count)
                        x.content.blanks.push({
                          id: ops.uid("bl"),
                          acceptedAnswers: [""],
                        });
                      x.content.blanks.length = count;
                    }
                  })
                }
              >
                Sync answer sets with {ops.blankTokens(c.prompt).length} blanks
              </Button>
            )}

            {c.blanks.map((b, i) => (
              <Field key={b.id} label={`Blank ${i + 1} — accepted answers`}>
                <ListEditor
                  values={b.acceptedAnswers}
                  placeholder="Answer"
                  addLabel="Add alternative"
                  onChange={(values) =>
                    updateQ(q.id, (x) => {
                      if (x.content.type === "CLOZE") {
                        if (x.content.blanks[i])
                          x.content.blanks[i].acceptedAnswers = values;
                      } else if (
                        x.content.type === "MULTI_TEXT_INPUT" &&
                        x.content.blanks[i]
                      ) {
                        x.content.blanks[i].acceptedAnswers = values;
                      }
                    })
                  }
                />
              </Field>
            ))}

            <label className="flex items-center justify-between text-sm">
              Case sensitive
              <Switch
                checked={c.caseSensitive}
                onCheckedChange={(value) =>
                  updateQ(q.id, (x) => {
                    if (
                      x.content.type === "CLOZE" ||
                      x.content.type === "MULTI_TEXT_INPUT"
                    )
                      x.content.caseSensitive = value;
                  })
                }
              />
            </label>
          </>
        )}

        {c.type === "MATCHING" && (
          <>
            <Field
              label="Answer pool"
              error={
                !c.poolId || !pools.some((pool) => pool.id === c.poolId)
                  ? "Choose an answer pool in this section"
                  : null
              }
            >
              <Select
                value={
                  c.poolId && pools.some((pool) => pool.id === c.poolId)
                    ? c.poolId
                    : ""
                }
                onValueChange={(v) =>
                  updateQ(
                    q.id,
                    (x) =>
                      x.content.type === "MATCHING" &&
                      ((x.content.poolId = v),
                      (x.content.correctEntryId = null)),
                  )
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue
                    placeholder={
                      pools.length ? "Select pool" : "No pools — add one first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {pools.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {ops.blockLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {c.poolId &&
              pools.some((pool) => pool.id === c.poolId) &&
              a.items[c.poolId]?.kind === "block" &&
              (a.items[c.poolId] as BlockItem).block.type === "POOL" && (
                <Field
                  label="Correct letter"
                  error={!c.correctEntryId ? "Pick the correct letter" : null}
                >
                  <div className="flex flex-wrap gap-1">
                    {(
                      (a.items[c.poolId] as BlockItem).block as {
                        entries: { id: string; text: string }[];
                      }
                    ).entries.map((e, i) => (
                      <button
                        key={e.id}
                        title={e.text}
                        onClick={() =>
                          updateQ(
                            q.id,
                            (x) =>
                              x.content.type === "MATCHING" &&
                              (x.content.correctEntryId = e.id),
                          )
                        }
                        className={cn(
                          "h-8 w-8 rounded border text-sm font-semibold",
                          c.correctEntryId === e.id
                            ? "border-success bg-success text-success-foreground"
                            : "hover:bg-muted",
                        )}
                      >
                        {ops.letter(i)}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
          </>
        )}
      </Group>

      <Group title="Scoring">
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Points"
            error={
              !q.config.isExample && !(q.config.points > 0)
                ? "Must be > 0"
                : null
            }
          >
            <Input
              type="number"
              step="0.25"
              min={0}
              className="h-8"
              disabled={q.config.isExample}
              value={Number.isFinite(q.config.points) ? q.config.points : ""}
              onChange={(e) =>
                updateQ(
                  q.id,
                  (x) =>
                    (x.config.points =
                      e.target.value === "" ? NaN : Number(e.target.value)),
                )
              }
            />
          </Field>
        </div>

        <label className="flex items-center justify-between text-sm">
          <span>
            Example item
            <span className="block text-xs text-muted-foreground">
              Shown with its answer, not numbered or scored
            </span>
          </span>
          <Switch
            checked={q.config.isExample}
            onCheckedChange={(v) =>
              updateQ(q.id, (x) => (x.config.isExample = v))
            }
          />
        </label>
      </Group>

      <Group title="Shared content">
        <Field
          label="Belongs to"
          hint="Attach this question to a passage, pool, image or instructions block."
        >
          <Select
            value={group ? group.id : "none"}
            onValueChange={(v) =>
              mutate((d) => {
                if (v === "none") {
                  const loc = ops.locate(d, q.id)!;
                  const s = ops.getSection(d, loc.sectionId)!;
                  const gi = loc.groupId
                    ? s.itemIds.indexOf(loc.groupId) + 1
                    : s.itemIds.length;
                  ops.moveTo(d, q.id, {
                    sectionId: s.id,
                    groupId: null,
                    index: gi,
                  });
                } else {
                  const b = d.items[v] as BlockItem;
                  ops.moveTo(d, q.id, {
                    sectionId: ops.locate(d, v)!.sectionId,
                    groupId: v,
                    index: b.memberIds.length,
                  });
                }
              })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Standalone (no group)</SelectItem>
              {blocks.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {ops.TYPE_LABEL[b.block.type]}: {ops.blockLabel(b)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {group?.block.type === "PASSAGE" && (
          <Field label="Answers passage blank">
            <Select
              value={c.blankRef ? String(c.blankRef) : "none"}
              onValueChange={(v) =>
                updateQ(
                  q.id,
                  (x) => (x.content.blankRef = v === "none" ? null : Number(v)),
                )
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not linked to a blank</SelectItem>
                {ops.blankNumbers(group.block.text).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Blank ({n})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
        {group && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs border-none bg-transparent text-muted-foreground hover:bg-white hover:text-primary hover:underline underline-offset-2"
            onClick={() => select({ kind: "item", id: group.id })}
          >
            Edit the shared block →
          </Button>
        )}
      </Group>

      <Group title="Feedback (hidden from students)">
        <Field label="Explanation">
          <Textarea
            rows={2}
            value={c.explanation ?? ""}
            onChange={(e) =>
              updateQ(q.id, (x) => (x.content.explanation = e.target.value))
            }
          />
        </Field>
        <Field label="Hint">
          <Input
            className="h-8"
            value={c.hint ?? ""}
            onChange={(e) =>
              updateQ(q.id, (x) => (x.content.hint = e.target.value))
            }
          />
        </Field>
      </Group>
    </>
  );
}

function BlockEditor({ b }: { b: BlockItem }) {
  const tErrors = useTranslations("errors");
  const a = useBuilder((s) => s.assignment);
  const { duplicate, requestDeleteItem, select, addTool, ask } =
    useBuilder.getState();
  const blk = b.block;
  const sectionId = ops.locate(a, b.id)?.sectionId ?? "";
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {ops.blockLabel(b)}
          </div>
          <div className="text-xs text-muted-foreground">
            {ops.TYPE_LABEL[blk.type]} · shared by {b.memberIds.length}{" "}
            question(s)
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Duplicate"
            onClick={() => duplicate(b.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            aria-label="Delete"
            onClick={() => requestDeleteItem(b.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <IssueList id={b.id} />
      <Group title="Content">
        {blk.type === "INSTRUCTIONS" && (
          <Field label="Text">
            <Textarea
              rows={4}
              value={blk.text}
              onChange={(e) =>
                updateB(
                  b.id,
                  (x) =>
                    x.block.type === "INSTRUCTIONS" &&
                    (x.block.text = e.target.value),
                )
              }
            />
          </Field>
        )}
        {blk.type === "PASSAGE" && (
          <>
            <Field label="Title">
              <Input
                className="h-8"
                value={blk.title}
                onChange={(e) =>
                  updateB(
                    b.id,
                    (x) =>
                      x.block.type === "PASSAGE" &&
                      (x.block.title = e.target.value),
                  )
                }
              />
            </Field>
            <Field label="Passage" hint={MARKUP_HINT}>
              <Textarea
                rows={8}
                value={blk.text}
                onChange={(e) =>
                  updateB(
                    b.id,
                    (x) =>
                      x.block.type === "PASSAGE" &&
                      (x.block.text = e.target.value),
                  )
                }
              />
            </Field>
            {ops.blankTokens(blk.text).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => createBlankQuestions(b.id)}
              >
                <Wand2 className="h-4 w-4" /> Create questions for all blanks
              </Button>
            )}
          </>
        )}
        {blk.type === "MEDIA" && (
          <>
            <Field
              label="Upload image"
              hint="Uploaded images are saved as media assets and referenced by asset ID."
            >
              <Input
                className="h-8"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const response = await contentService.uploadMedia(file);
                    if (!response.data)
                      throw new Error(
                        "Upload completed without media metadata.",
                      );
                    updateB(b.id, (x) => {
                      if (x.block.type === "MEDIA") {
                        x.block.assetId = String(response.data!.id);
                        x.block.url = response.data!.url ?? "";
                      }
                    });
                    toast.success("Image uploaded.");
                  } catch (error) {
                    toast.error(
                      getAppErrorMessage(error, tErrors as (key: string) => string),
                    );
                  }
                }}
              />
              <Input
                className="mt-1 h-8"
                value={blk.assetId ?? ""}
                readOnly
                aria-label="Media asset ID"
                placeholder="Media asset ID appears after upload"
              />
            </Field>
            <Field label="Image URL (preview)">
              <Input
                className="h-8"
                placeholder="Filled automatically after upload"
                value={blk.url}
                readOnly
              />
            </Field>
            <Field
              label="Alt text (for screen readers)"
              error={
                !blk.alt.trim() ? "Describe the picture before saving" : null
              }
            >
              <Input
                className="h-8"
                value={blk.alt}
                onChange={(e) =>
                  updateB(
                    b.id,
                    (x) =>
                      x.block.type === "MEDIA" &&
                      (x.block.alt = e.target.value),
                  )
                }
              />
            </Field>
            <Field label="Caption">
              <Input
                className="h-8"
                value={blk.caption}
                onChange={(e) =>
                  updateB(
                    b.id,
                    (x) =>
                      x.block.type === "MEDIA" &&
                      (x.block.caption = e.target.value),
                  )
                }
              />
            </Field>
          </>
        )}
        {blk.type === "POOL" && (
          <>
            <Field label="Title">
              <Input
                className="h-8"
                value={blk.title}
                onChange={(e) =>
                  updateB(
                    b.id,
                    (x) =>
                      x.block.type === "POOL" &&
                      (x.block.title = e.target.value),
                  )
                }
              />
            </Field>
            <Field label="Entries (lettered automatically)">
              <div className="space-y-1.5">
                {blk.entries.map((e, i) => {
                  const users = Object.values(a.items).filter(
                    (it) =>
                      it.kind === "question" &&
                      it.content.type === "MATCHING" &&
                      it.content.poolId === b.id &&
                      it.content.correctEntryId === e.id,
                  ).length;
                  const remove = () =>
                    updateB(
                      b.id,
                      (x) =>
                        x.block.type === "POOL" && x.block.entries.splice(i, 1),
                    );
                  return (
                    <div key={e.id} className="flex items-center gap-1.5">
                      <span className="w-4 shrink-0 text-xs font-semibold text-primary">
                        {ops.letter(i)}
                      </span>
                      <Input
                        className="h-8"
                        value={e.text}
                        onChange={(ev) =>
                          updateB(
                            b.id,
                            (x) =>
                              x.block.type === "POOL" &&
                              (x.block.entries[i].text = ev.target.value),
                          )
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        aria-label={
                          users > 0
                            ? `Entry used by ${users} matching question(s)`
                            : "Remove entry"
                        }
                        title={
                          users > 0
                            ? `Resolve ${users} matching question reference(s) before removing this entry.`
                            : "Remove entry"
                        }
                        disabled={users > 0}
                        onClick={remove}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={() =>
                    updateB(
                      b.id,
                      (x) =>
                        x.block.type === "POOL" &&
                        x.block.entries.push({ id: ops.uid("e"), text: "" }),
                    )
                  }
                >
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
              <button
                key={m}
                onClick={() => select({ kind: "item", id: m })}
                className="block w-full truncate rounded px-2 py-1 text-left text-sm hover:bg-muted"
              >
                {q.content.blankRef ? `(${q.content.blankRef}) ` : ""}
                {ops.plainText(q.content.prompt) ||
                  ("options" in q.content
                    ? q.content.options
                        .map((o) => ops.plainText(o.text))
                        .join(" / ")
                    : "(empty)")}
              </button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            addTool(
              blk.type === "POOL"
                ? "MATCHING"
                : blk.type === "PASSAGE"
                  ? "SINGLE_CHOICE"
                  : "TEXT_INPUT",
              { sectionId, groupId: b.id, index: b.memberIds.length },
            )
          }
        >
          <Plus className="h-4 w-4" /> Add question to this group
        </Button>
      </Group>
    </>
  );
}

function SectionEditor({ s }: { s: Section }) {
  const { mutate, requestDeleteSection, addTool } = useBuilder.getState();
  const update = (p: Partial<Section>) =>
    mutate((d) => Object.assign(d.sections.find((x) => x.id === s.id)!, p));
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {s.title || "Untitled section"}
          </div>
          <div className="text-xs text-muted-foreground">
            Section · {s.itemIds.length} item(s)
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive"
          aria-label="Delete section"
          onClick={() => requestDeleteSection(s.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <IssueList id={s.id} />
      <Group title="English">
        <Field
          label="Title"
          error={!s.title.trim() ? "Section title is required" : null}
        >
          <Input
            className="h-8"
            value={s.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </Field>
        <Field label="Instructions">
          <Textarea
            rows={3}
            value={s.instructions}
            onChange={(e) => update({ instructions: e.target.value })}
          />
        </Field>
      </Group>
      <Group title="Tiếng Việt">
        <Field
          label="Tiêu đề"
          error={!s.titleVi.trim() ? "Missing Vietnamese title" : null}
        >
          <Input
            className="h-8"
            value={s.titleVi}
            onChange={(e) => update({ titleVi: e.target.value })}
          />
        </Field>
        <Field label="Hướng dẫn">
          <Textarea
            rows={3}
            value={s.instructionsVi}
            onChange={(e) => update({ instructionsVi: e.target.value })}
          />
        </Field>
      </Group>
      <Group title="Content">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            addTool("SINGLE_CHOICE", {
              sectionId: s.id,
              groupId: null,
              index: s.itemIds.length,
            })
          }
        >
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
      <p className="mt-1 text-sm text-muted-foreground">
        Click a question, shared block or section heading on the page to edit
        its properties here.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => (
          useBuilder.getState().set({ settingsOpen: true }),
          toast.dismiss()
        )}
      >
        Open assignment settings
      </Button>
    </div>
  );
}
