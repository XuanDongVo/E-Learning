import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { GripVertical, Link2, MoveRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { BlockItem, ID, QuestionItem, ToolKey } from "@/types/assignment-builder";
import * as ops from "../../ops";
import { GUIDE_BLOCK, GUIDE_SECTION_A } from "../../shared-guide";
import { GuideBlockEditor } from "./GuideBlockEditor";
import { GuideQuestionEditor } from "./GuideQuestionEditor";
import type { GuideWorkspaceProps } from "./guide-types";

function DraggableTool({ tool, label, onClick, disabled }: { tool: ToolKey; label: string; onClick: () => void; disabled?: boolean }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `guide-tool:${tool}`, disabled });
  return <div ref={setNodeRef} className={cn("flex items-center rounded-md border", isDragging && "opacity-40")}>
    <button type="button" {...attributes} {...listeners} disabled={disabled} aria-label={`Kéo ${label}`} className="touch-none rounded-l-md p-2 text-muted-foreground hover:bg-muted">
      <GripVertical className="h-4 w-4" />
    </button>
    <Button size="sm" variant="ghost" disabled={disabled} className="h-auto min-w-0 flex-1 justify-start whitespace-normal text-left" onClick={onClick}>{label}</Button>
  </div>;
}

function DropArea({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef} className={cn("min-h-28 space-y-3 rounded-lg border border-dashed bg-background p-3", isOver && "border-primary bg-primary/5 ring-2 ring-primary/20")}>
    {children}
  </div>;
}

function BlockMoveHandle({ id }: { id: ID }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `guide-block:${id}` });
  return <button type="button" ref={setNodeRef} {...attributes} {...listeners} className={cn("rounded p-1 text-muted-foreground hover:bg-muted", isDragging && "opacity-40")} aria-label="Kéo cả khối sang Section khác" title="Kéo cả khối">
    <GripVertical className="h-4 w-4" />
  </button>;
}

function BlockCard({ block, sectionId, selectedId, practice, scenario, actions }: GuideWorkspaceProps & { block: BlockItem; sectionId: ID }) {
  const otherSection = practice.sections.find((s) => s.id !== sectionId);
  return <div className="space-y-3 rounded-lg border bg-card p-3 shadow-sm">
    <div className="flex flex-wrap items-center gap-2">
      <BlockMoveHandle id={block.id} />
      <span className="flex-1 text-sm font-semibold">{ops.TYPE_LABEL[block.block.type]} · {block.memberIds.length} câu con</span>
      {otherSection && <Button size="sm" variant="ghost" onClick={() => actions.moveBlock(block.id, otherSection.id)}>
        <MoveRight className="h-4 w-4" /> Chuyển sang {otherSection.id === GUIDE_SECTION_A ? "Section I" : "Section II"}
      </Button>}
      <AlertDialog>
        <AlertDialogTrigger asChild><Button size="icon-sm" variant="ghost" aria-label="Xóa khối thực hành"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khối dùng chung?</AlertDialogTitle>
            <AlertDialogDescription>
              Khối hiện có {block.memberIds.length} câu con. Chọn giữ các câu thành độc lập hoặc xóa cả khối và câu con.
              {block.block.type === "POOL" && " Matching giữ lại sẽ phải chọn một Pool mới vì Pool cũ bị xóa."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-secondary text-secondary-foreground" onClick={() => actions.deleteBlock(block.id, true)}>Giữ câu hỏi</AlertDialogAction>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => actions.deleteBlock(block.id, false)}>Xóa cả nhóm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    <GuideBlockEditor block={block} scenario={scenario} actions={actions} />
    <DropArea id={`guide-members:${block.id}`}>
      <p className="text-xs font-semibold text-muted-foreground">Câu hỏi trong nhóm</p>
      {block.memberIds.map((id) => {
        const q = practice.items[id];
        if (q?.kind !== "question") return null;
        return <button type="button" key={id} onClick={() => actions.selectQuestion(id)} className={cn("block w-full rounded border p-2 text-left text-xs hover:border-primary", selectedId === id && "border-primary bg-primary/5")}>
          {q.content.blankRef != null ? `Blank (${q.content.blankRef})` : q.content.prompt || "Câu chưa có nội dung"}
        </button>;
      })}
      {!block.memberIds.length && <p className="text-xs text-muted-foreground">Chưa có câu con. Kéo hoặc bấm công cụ Thêm câu vào nhóm.</p>}
      <Button variant="outline" size="sm" onClick={() => actions.addQuestion(sectionId, block.id)}>
        <Plus className="h-4 w-4" /> Thêm câu vào nhóm
      </Button>
    </DropArea>
  </div>;
}

export function GuideWorkspace({ practice, scenario, step, selectedId, block, actions }: GuideWorkspaceProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const blockSection = block ? ops.locate(practice, block.id)?.sectionId ?? GUIDE_SECTION_A : GUIDE_SECTION_A;
  const questionTool: ToolKey = scenario === "pool" ? "MATCHING" : scenario === "media" ? "SINGLE_CHOICE" : "TEXT_INPUT";
  const selected = selectedId ? practice.items[selectedId] : null;

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const source = String(active.id), target = String(over.id);
    const sectionId = target.startsWith("guide-section:") ? target.slice("guide-section:".length) : null;
    const groupId = target.startsWith("guide-members:") ? target.slice("guide-members:".length) : null;
    if (source.startsWith("guide-block:") && sectionId) {
      actions.moveBlock(source.slice("guide-block:".length), sectionId);
      return;
    }
    if (source.startsWith("guide-tool:")) {
      const tool = source.slice("guide-tool:".length) as ToolKey;
      if (ops.isBlockTool(tool) && block) return;
      if (groupId && ops.isQuestionTool(tool)) {
        const location = ops.locate(practice, groupId);
        if (location) actions.addToolAt(tool, location.sectionId, groupId);
      } else if (sectionId) actions.addToolAt(tool, sectionId);
    }
  };

  return <DndContext sensors={sensors} onDragEnd={onDragEnd}>
    <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)_17rem]">
      <aside className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Công cụ · kéo hoặc bấm</h3>
        <DraggableTool tool={GUIDE_BLOCK[scenario]} label={ops.TYPE_LABEL[GUIDE_BLOCK[scenario]]} disabled={!!block} onClick={() => actions.addBlock(GUIDE_SECTION_A)} />
        <DraggableTool tool={questionTool} label={ops.TYPE_LABEL[questionTool]} onClick={() => actions.addQuestion(blockSection, block?.id)} />
        <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => actions.addQuestion(GUIDE_SECTION_A, null)}>
          <Plus className="h-4 w-4" /> Thêm câu độc lập
        </Button>
        <p className="text-xs text-muted-foreground">Trong Builder thật: dùng Toolbox, Canvas và Property panel. Ở đây dữ liệu chỉ tồn tại trong dialog.</p>
      </aside>
      <div className="min-w-0 space-y-4">
        {practice.sections.filter((s, i) => i === 0 || step === 5 || scenario === "groups" || s.itemIds.length > 0).map((s) => (
          <section key={s.id} className="space-y-2">
            <h3 className="text-sm font-semibold">{s.title}</h3>
            <DropArea id={`guide-section:${s.id}`}>
              {s.itemIds.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">Thả khối / câu hỏi vào đây hoặc dùng nút ở cột trái.</p>}
              {s.itemIds.map((id) => {
                const item = practice.items[id];
                if (!item) return null;
                if (item.kind === "block") return <BlockCard key={id} block={item} sectionId={s.id} practice={practice} scenario={scenario} step={step} selectedId={selectedId} actions={actions} />;
                return <button key={id} type="button" onClick={() => actions.selectQuestion(id)} className={cn("flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left text-xs", selectedId === id && "border-primary bg-primary/5")}>
                  <Link2 className="h-4 w-4 text-muted-foreground" /> Câu độc lập: {item.content.prompt || "Chưa có nội dung"}
                </button>;
              })}
            </DropArea>
          </section>
        ))}
      </div>
      <GuideQuestionEditor question={selected?.kind === "question" ? selected as QuestionItem : null} block={block} practice={practice} actions={actions} />
    </div>
  </DndContext>;
}
