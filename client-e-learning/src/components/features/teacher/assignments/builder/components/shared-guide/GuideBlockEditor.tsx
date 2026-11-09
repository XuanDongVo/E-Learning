import { Plus, Trash2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BlockItem } from "@/types/assignment-builder";
import * as ops from "../../ops";
import type { GuideScenario } from "../../shared-guide";
import type { GuideActions } from "./guide-types";

export function GuideBlockEditor({ block, scenario, actions }: {
  block: BlockItem; scenario: GuideScenario; actions: GuideActions;
}) {
  const content = block.block;
  const edit = (fn: (item: BlockItem) => void) => actions.updateBlock(block.id, fn);
  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nội dung khối · {ops.TYPE_LABEL[content.type]}</h4>
      {content.type === "PASSAGE" && <>
        <label className="block space-y-1 text-xs font-medium">
          <span>Tiêu đề Passage</span>
          <Input value={content.title} onChange={(e) => edit((b) => { if (b.block.type === "PASSAGE") b.block.title = e.target.value; })} />
        </label>
        <label className="block space-y-1 text-xs font-medium">
          <span>Đoạn đọc {scenario === "cloze" ? "(dùng {{1}}, {{2}} cho blanks)" : ""}</span>
          <Textarea rows={4} value={content.text} onChange={(e) => edit((b) => { if (b.block.type === "PASSAGE") b.block.text = e.target.value; })} />
        </label>
        {scenario === "cloze" && (
          <Button size="sm" variant="outline" onClick={() => actions.generateBlanks(block.id)} disabled={ops.blankNumbers(content.text).length === 0}>
            <WandSparkles className="h-4 w-4" /> Tạo câu cho blanks còn thiếu
          </Button>
        )}
      </>}
      {content.type === "POOL" && <>
        <label className="block space-y-1 text-xs font-medium">
          <span>Tên Answer pool</span>
          <Input value={content.title} onChange={(e) => edit((b) => { if (b.block.type === "POOL") b.block.title = e.target.value; })} />
        </label>
        <div className="space-y-2">
          <p className="text-xs font-medium">Các lựa chọn (giữ ID khi chỉnh sửa nội dung)</p>
          {content.entries.map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-2">
              <span className="w-5 text-xs font-semibold">{ops.letter(i)}.</span>
              <Input aria-label={`Nội dung đáp án ${ops.letter(i)}`} value={entry.text} onChange={(e) => edit((b) => {
                if (b.block.type === "POOL") {
                  const target = b.block.entries.find((x) => x.id === entry.id);
                  if (target) target.text = e.target.value;
                }
              })} />
              <Button size="icon-sm" variant="ghost" aria-label={`Xóa lựa chọn ${ops.letter(i)}`} disabled={content.entries.length <= 2} onClick={() => edit((b) => {
                if (b.block.type === "POOL") b.block.entries = b.block.entries.filter((x) => x.id !== entry.id);
              })}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => edit((b) => {
            if (b.block.type === "POOL") b.block.entries.push({ id: ops.uid("e"), text: "" });
          })}><Plus className="h-4 w-4" /> Thêm lựa chọn</Button>
          <p className="text-xs text-muted-foreground">Sau khi xóa một lựa chọn đã dùng, hãy chọn lại đáp án đúng ở câu Matching.</p>
        </div>
      </>}
      {content.type === "MEDIA" && <>
        <label className="block space-y-1 text-xs font-medium">
          <span>Image URL</span>
          <Input value={content.url} placeholder="https://..." onChange={(e) => edit((b) => { if (b.block.type === "MEDIA") b.block.url = e.target.value; })} />
        </label>
        <label className="block space-y-1 text-xs font-medium">
          <span>Alt text (nội dung mô tả ảnh)</span>
          <Input value={content.alt} onChange={(e) => edit((b) => { if (b.block.type === "MEDIA") b.block.alt = e.target.value; })} />
        </label>
        <label className="block space-y-1 text-xs font-medium">
          <span>Caption</span>
          <Input value={content.caption} onChange={(e) => edit((b) => { if (b.block.type === "MEDIA") b.block.caption = e.target.value; })} />
        </label>
        {content.url && <p className="text-xs text-muted-foreground">URL mẫu là ảnh từ dịch vụ ngoài, có thể không tải được nếu mạng chặn.</p>}
      </>}
      {content.type === "INSTRUCTIONS" && <label className="block space-y-1 text-xs font-medium">
        <span>Chỉ dẫn chung</span>
        <Textarea rows={4} value={content.text} onChange={(e) => edit((b) => { if (b.block.type === "INSTRUCTIONS") b.block.text = e.target.value; })} />
      </label>}
    </div>
  );
}
