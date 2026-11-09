import { Link2Off, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Assignment, BlockItem, QuestionItem } from "@/types/assignment-builder";
import * as ops from "../../ops";
import type { GuideActions } from "./guide-types";

export function GuideQuestionEditor({ question, block, practice, actions }: {
  question: QuestionItem | null; block: BlockItem | null; practice: Assignment; actions: GuideActions;
}) {
  if (!question) return (
    <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
      Chọn một câu hỏi trong Section hoặc trong nhóm để chỉnh sửa đề và đáp án.
    </div>
  );
  const c = question.content;
  const loc = ops.locate(practice, question.id);
  const pool = (loc ? practice.sections.find((s) => s.id === loc.sectionId)?.itemIds : [])
    ?.map((id) => practice.items[id]).find((it): it is BlockItem => it?.kind === "block" && it.block.type === "POOL");
  const edit = (fn: (q: QuestionItem) => void) => actions.updateQuestion(question.id, fn);
  const canGroup = !!block && !!loc;

  return (
    <aside className="min-w-0 space-y-3 rounded-md border bg-card p-3" aria-label="Cài đặt câu hỏi">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Câu hỏi đang chọn · {ops.TYPE_LABEL[c.type]}</h4>
      {c.blankRef != null && <p className="rounded bg-primary/10 p-2 text-xs text-primary">Câu này gắn với blank ({c.blankRef}) trong Passage.</p>}
      {c.blankRef == null && <label className="block space-y-1 text-xs font-medium">
        <span>Đề bài</span>
        <Textarea rows={3} value={c.prompt} onChange={(e) => edit((q) => { q.content.prompt = e.target.value; })} />
      </label>}
      {c.type === "TEXT_INPUT" && <label className="block space-y-1 text-xs font-medium">
        <span>Đáp án chấp nhận</span>
        <Input value={c.acceptedAnswers[0] ?? ""} onChange={(e) => edit((q) => {
          if (q.content.type === "TEXT_INPUT") q.content.acceptedAnswers = [e.target.value];
        })} />
      </label>}
      {c.type === "MATCHING" && <>
        <p className="text-xs text-muted-foreground">Matching chỉ tham chiếu Pool trong cùng Section (poolId), và chọn đáp án bằng entry ID.</p>
        <label className="block space-y-1 text-xs font-medium">
          <span>Answer pool</span>
          <select className="h-9 w-full rounded-md border bg-background px-2" value={c.poolId ?? ""} onChange={(e) => edit((q) => {
            if (q.content.type === "MATCHING") {
              q.content.poolId = e.target.value || null;
              q.content.correctEntryId = null;
            }
          })}>
            <option value="">Chọn Pool</option>
            {pool && <option value={pool.id}>{pool.block.type === "POOL" ? pool.block.title || "Answer pool" : "Answer pool"}</option>}
          </select>
        </label>
        {pool?.block.type === "POOL" && c.poolId === pool.id && <label className="block space-y-1 text-xs font-medium">
          <span>Correct entry</span>
          <select className="h-9 w-full rounded-md border bg-background px-2" value={c.correctEntryId ?? ""} onChange={(e) => edit((q) => {
            if (q.content.type === "MATCHING") q.content.correctEntryId = e.target.value || null;
          })}>
            <option value="">Chọn đáp án</option>
            {pool.block.entries.map((e, i) => <option key={e.id} value={e.id}>{ops.letter(i)}. {e.text || "(trống)"}</option>)}
          </select>
        </label>}
        {!pool && <p className="text-xs text-destructive">Chưa có Pool trong Section này. Thêm Pool hoặc chuyển câu về cùng Section với Pool.</p>}
      </>}
      {c.type === "SINGLE_CHOICE" && <div className="space-y-2">
        <p className="text-xs font-medium">Phương án · chọn đúng một đáp án</p>
        {c.options.map((o, i) => <div key={o.id} className="flex items-center gap-2">
          <input type="radio" aria-label={`Đáp án ${ops.letter(i)} đúng`} name={`guide-correct-${question.id}`} checked={o.isCorrect} onChange={() => edit((q) => {
            if (q.content.type === "SINGLE_CHOICE") q.content.options.forEach((opt) => { opt.isCorrect = opt.id === o.id; });
          })} />
          <span className="w-5 text-xs">{ops.letter(i)}.</span>
          <Input value={o.text} aria-label={`Phương án ${ops.letter(i)}`} onChange={(e) => edit((q) => {
            if (q.content.type === "SINGLE_CHOICE") {
              const target = q.content.options.find((opt) => opt.id === o.id);
              if (target) target.text = e.target.value;
            }
          })} />
        </div>)}
      </div>}
      {block && canGroup && <div className="border-t pt-3">
        <Button size="sm" variant="outline" onClick={() => actions.toggleGroup(question.id, block.id)}>
          {loc?.groupId === block.id ? <Link2Off className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {loc?.groupId === block.id ? "Tách câu khỏi nhóm" : "Gắn câu vào nhóm"}
        </Button>
        {c.blankRef != null && <p className="mt-1 text-xs text-muted-foreground">Tách câu blank sẽ bỏ liên kết blankRef, giống thao tác trong Builder.</p>}
        {loc?.groupId !== block.id && ops.locate(practice, block.id)?.sectionId !== loc?.sectionId && <p className="mt-1 text-xs text-muted-foreground">Gắn câu sẽ chuyển câu đến cùng Section với khối.</p>}
      </div>}
    </aside>
  );
}
