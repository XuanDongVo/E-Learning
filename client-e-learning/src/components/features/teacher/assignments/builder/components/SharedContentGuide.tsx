import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GripVertical,
  MousePointer2,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Unlink,
  Wand2,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as ops from "../ops";
import {
  addPracticeItem,
  createPractice,
  generatePracticeBlanks,
  GUIDE_BLOCK,
  fillPracticeBlock,
  fillPracticeQuestion,
  practiceQuestionReady,
  practiceBlanksLinked,
  type GuideScenario,
} from "../shared-guide";
import type { Assignment, BlockItem, BlockType, ToolKey } from "../types";
import { buildStudentView } from "../student-view";
import { StudentPaper, type PaperAnswers } from "./StudentPaper";

const SCENARIOS: { id: GuideScenario; label: string }[] = [
  { id: "cloze", label: "Cloze Passage" },
  { id: "pool", label: "Pool + Matching" },
  { id: "media", label: "Ảnh · Image / Media" },
  { id: "instructions", label: "Chỉ dẫn · Instructions" },
  { id: "groups", label: "Quản lý nhóm" },
];

const STEP_TITLES = [
  "Thêm khối",
  "Soạn nội dung",
  "Tạo câu con",
  "Cài đáp án",
  "Xem thử học sinh",
  "Quản lý nhóm",
];

const LESSONS: Record<GuideScenario, string[]> = {
  cloze: [
    "Kéo Reading passage vào Section hoặc bấm trực tiếp nút bên trái để thêm.",
    "Gõ bài đọc chứa {{1}} và {{2}} để tạo các vị trí điền khuyết.",
    "Bấm 'Tạo câu con tự động' để hệ thống tự tạo các câu tương ứng với chỗ trống.",
    "Chọn từng câu ở danh sách bên dưới rồi đặt đáp án đúng ở cột thuộc tính phải.",
    "Trải nghiệm điền từ như học sinh thực tế trên giao diện làm bài.",
    "Thực hành di chuyển cả cụm bài đọc, tách một câu ra ngoài và thử xóa an toàn.",
  ],
  pool: [
    "Kéo Answer pool vào Section để tạo ngân hàng lựa chọn dùng chung.",
    "Nhập các phương án A–H trong danh sách lựa chọn.",
    "Thêm câu hỏi Matching vào nhóm Answer pool.",
    "Chọn từng câu Matching và gắn ký tự đáp án tương ứng từ Pool.",
    "Xem cách học sinh tra cứu pool từ gợi ý trực tiếp trong câu.",
    "Thử di chuyển hoặc rã nhóm các câu Matching mà không làm mất câu hỏi.",
  ],
  media: [
    "Kéo khối Image/Media vào Section.",
    "Dán đường dẫn ảnh hoặc bấm 'Dùng ảnh mẫu' để nạp nhanh tư liệu.",
    "Thêm các câu hỏi liên quan vào nhóm dưới ảnh.",
    "Cài đặt phương án đúng cho từng câu hỏi dựa theo nội dung bức ảnh.",
    "Kiểm tra giao diện học sinh: ảnh chỉ tải 1 lần trên đầu nhóm câu hỏi.",
    "Thực hành chuyển đổi hoặc tái cấu trúc nhóm câu hỏi kèm ảnh.",
  ],
  instructions: [
    "Kéo khối Instructions vào Section để tạo phần hướng dẫn chung.",
    "Nhập lời dẫn (ví dụ: 'Đọc kỹ đoạn hội thoại và chọn đáp án đúng').",
    "Thêm các câu hỏi chịu sự chi phối của chỉ dẫn này vào nhóm.",
    "Thiết lập câu trả lời và điểm số cho từng câu hỏi.",
    "Xem thử: Học sinh đọc chỉ dẫn một lần cho toàn bộ chùm câu hỏi.",
    "Thực hành gắn thêm hoặc tách câu hỏi ra khỏi phạm vi chỉ dẫn.",
  ],
  groups: [
    "Thêm một khối dùng chung làm khối mẹ cho nhóm.",
    "Soạn nội dung chính cho khối dùng chung.",
    "Tạo các câu hỏi bên trong nhóm và một câu độc lập bên ngoài để so sánh.",
    "Kiểm tra cài đặt đáp án cho các thành viên trong nhóm.",
    "Xem trước giao diện hiển thị tổng hợp.",
    "Dùng tay cầm để kéo cả nhóm sang Section II, thử Detach và Xóa an toàn.",
  ],
};

export const openSharedGuide = (block?: BlockType) =>
  window.dispatchEvent(new CustomEvent("ab:shared-guide", { detail: block }));

function DragTool({ tool, label, onAdd }: { tool: ToolKey; label: string; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `guide-tool:${tool}`,
  });
  return (
    <Button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      variant="outline"
      className={cn(
        "h-auto w-full touch-none justify-start whitespace-normal border-2 border-ink py-2.5 text-left font-medium shadow-pop-sm transition-all hover:-translate-y-0.5",
        isDragging && "opacity-40",
      )}
      onClick={onAdd}
    >
      <GripVertical className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
      {label}
    </Button>
  );
}

function DropZone({ id, children, active }: { id: string; children: ReactNode; active?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      data-guide-zone={id}
      className={cn(
        "min-h-28 rounded-lg border-2 border-dashed border-border bg-card/60 p-3 transition-colors",
        (active || isOver) && "border-primary bg-primary-soft ring-2 ring-primary/20",
      )}
    >
      {children}
    </div>
  );
}

function GroupHandle({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `guide-group:${id}` });
  return (
    <Button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="cursor-grab active:cursor-grabbing"
      aria-label="Kéo cả nhóm"
      title="Kéo cả nhóm sang Section II"
    >
      <GripVertical className="h-4 w-4" />
    </Button>
  );
}

const inputClass =
  "w-full rounded-md border-2 border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function SharedContentGuide() {
  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState<GuideScenario>("cloze");
  const [step, setStep] = useState(0);
  const [practice, setPractice] = useState<Assignment>(createPractice);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [animation, setAnimation] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<PaperAnswers>({});
  const [managed, setManaged] = useState<string[]>([]);

  const markManaged = (action: string) => setManaged((old) => [...new Set([...old, action])]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const reset = (id: GuideScenario) => {
    setScenario(id);
    setPractice(createPractice());
    setStep(0);
    setSelected(null);
    setNotice("");
    setAnimation(false);
    setPreviewAnswers({});
    setManaged([]);
  };

  useEffect(() => {
    const start = (e: Event) => {
      const type = (e as CustomEvent<BlockType>).detail;
      reset(
        type === "POOL"
          ? "pool"
          : type === "MEDIA"
          ? "media"
          : type === "INSTRUCTIONS"
          ? "instructions"
          : "cloze",
      );
      setOpen(true);
    };
    window.addEventListener("ab:shared-guide", start);
    return () => window.removeEventListener("ab:shared-guide", start);
  }, []);

  const edit = (fn: (a: Assignment) => void) =>
    setPractice((a) => {
      const next = structuredClone(a);
      fn(next);
      return next;
    });

  const block = Object.values(practice.items).find((i): i is BlockItem => i.kind === "block");
  const q = selected ? practice.items[selected] : null;
  const questionTool: ToolKey =
    scenario === "pool" ? "MATCHING" : scenario === "media" ? "SINGLE_CHOICE" : "TEXT_INPUT";

  const add = (tool: ToolKey, groupId: string | null = null) => {
    edit((a) => {
      const id = addPracticeItem(a, tool, groupId);
      setSelected(id);
    });
    setNotice("Đã thêm thành công vào khu thực hành.");
  };

  const questions = Object.values(practice.items).filter((i) => i.kind === "question");

  const checks = [
    // 0: Thêm khối
    !!block,
    // 1: Soạn nội dung
    !!block &&
      (block.block.type === "PASSAGE"
        ? scenario === "cloze"
          ? ops.blankNumbers(block.block.text).includes(1) &&
            ops.blankNumbers(block.block.text).includes(2)
          : !!block.block.text.trim()
        : block.block.type === "POOL"
        ? block.block.entries.length >= 2 && block.block.entries.every((e) => e.text.trim())
        : block.block.type === "MEDIA"
        ? !!block.block.url && !!block.block.alt
        : !!block.block.text.trim()),
    // 2: Tạo câu con
    (block?.memberIds.length ?? 0) >= (scenario === "cloze" || scenario === "groups" ? 2 : 1) &&
      (scenario !== "cloze" || (!!block && practiceBlanksLinked(practice, block))),
    // 3: Cài đáp án
    questions.length > 0 && questions.every((item) => practiceQuestionReady(item, practice)),
    // 4: Xem thử
    true,
    // 5: Quản lý nhóm
    ["move", "detach", "attach"].some((a) => managed.includes(a)),
  ];

  const ready = checks[step] ?? false;

  const demoStep = () => {
    setAnimation(false);
    requestAnimationFrame(() => setAnimation(true));

    if (step === 0) {
      if (!block) {
        add(GUIDE_BLOCK[scenario]);
      }
      return;
    }

    if (!block) return;

    if (step === 1) {
      edit((a) => {
        const b = a.items[block.id];
        if (b?.kind === "block") fillPracticeBlock(b, scenario);
      });
      setNotice("Đã nạp nội dung mẫu. Bạn có thể sang bước tiếp theo.");
      return;
    }

    if (step === 2) {
      edit((a) => {
        const b = a.items[block.id];
        if (!b || b.kind !== "block") return;
        if (scenario === "cloze") {
          generatePracticeBlanks(a, b.id);
        } else {
          addPracticeItem(a, questionTool, b.id);
          if (scenario === "groups") addPracticeItem(a, questionTool, b.id);
        }
        setSelected(b.memberIds[0] ?? null);
      });
      setNotice("Đã tạo câu con tự động.");
      return;
    }

    if (step === 3) {
      edit((a) => {
        const b = a.items[block.id];
        if (!b || b.kind !== "block") return;
        Object.values(a.items).forEach((item, idx) => {
          if (item.kind === "question") fillPracticeQuestion(item, b, idx);
        });
      });
      setNotice("Đã điền đề bài và đáp án chuẩn.");
      return;
    }

    if (step === 4) {
      const view = buildStudentView(practice);
      const first = view.sections.flatMap((s) =>
        s.units.flatMap((u) => (u.kind === "group" ? u.members : [u.q])),
      )[0];
      if (first) {
        setPreviewAnswers((old) => ({
          ...old,
          [first.id]: first.type === "MATCHING" ? "e1" : "students",
        }));
      }
      setNotice("Đã điền câu trả lời mẫu ở chế độ học sinh.");
      return;
    }

    if (step === 5) {
      edit((a) => {
        ops.moveTo(a, block.id, { sectionId: "practice-section-2", groupId: null, index: 0 });
      });
      markManaged("move");
      setNotice("Đã chuyển toàn bộ nhóm sang Section II mẫu.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden border-2 border-ink bg-card p-0 text-card-foreground shadow-pop sm:rounded-xl">
        {/* Header */}
        <DialogHeader className="border-b-2 border-ink bg-background-app px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <BookOpen className="h-5 w-5 text-primary" />
                Hướng dẫn thực hành: Khối dùng chung (Shared Content)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Thực hành tương tác trực tiếp trên môi trường giả lập · Không ảnh hưởng đến đề đang soạn.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scenarios Tab */}
        <div className="flex flex-wrap gap-2 border-b-2 border-border bg-muted/40 px-5 py-2.5">
          {SCENARIOS.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={scenario === s.id ? "default" : "outline"}
              className={cn(
                "h-8 rounded-md border-2 border-ink text-xs font-semibold shadow-pop-sm",
                scenario === s.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
              )}
              onClick={() => reset(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>

        {/* Stepper Bar */}
        <nav
          aria-label="Các bước thực hành"
          className="grid grid-cols-2 gap-2 border-b-2 border-border bg-background p-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {STEP_TITLES.map((title, i) => (
            <Button
              key={title}
              variant="ghost"
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "h-auto justify-start border border-border px-2.5 py-2 text-left text-xs font-medium transition-all",
                i === step && "border-2 border-ink bg-primary-soft font-bold text-primary shadow-pop-sm",
              )}
              onClick={() => {
                setStep(i);
                setAnimation(false);
              }}
            >
              {checks[i] ? (
                <CheckCircle2 className="mr-1.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <span className="mr-1.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border text-[10px]">
                  {i + 1}
                </span>
              )}
              <span className="truncate">{title}</span>
            </Button>
          ))}
        </nav>

        {/* Action Cue Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-primary-soft/50 px-5 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-primary">
              Bước {step + 1}/6 · {STEP_TITLES[step]}
            </p>
            <p className="text-sm font-medium text-foreground">{LESSONS[scenario][step]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-ink bg-card text-xs font-semibold shadow-pop-sm hover:-translate-y-0.5"
              onClick={demoStep}
            >
              <Wand2 className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Thao tác mẫu
            </Button>
            {step === 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-semibold"
                onClick={() => {
                  setAnimation(false);
                  requestAnimationFrame(() => setAnimation(true));
                }}
              >
                <Play className="mr-1 h-3 w-3" /> Xem mẫu kéo
              </Button>
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="max-h-[50vh] min-h-[360px] overflow-y-auto p-5">
          {step === 4 ? (
            /* BƯỚC 5: XEM THỬ HỌC SINH */
            <div className="rounded-lg border-2 border-ink bg-background p-4 shadow-pop">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                Giao diện bài thi hiển thị trực tiếp cho học sinh
              </div>
              <StudentPaper
                view={buildStudentView(practice)}
                answers={previewAnswers}
                setAnswer={(id, v) => setPreviewAnswers((old) => ({ ...old, [id]: v }))}
                showPoints
              />
            </div>
          ) : (
            /* BƯỚC 1 - 4 & BƯỚC 6: KHU THỰC HÀNH TƯƠNG TÁC */
            <DndContext
              sensors={sensors}
              onDragEnd={(e) => {
                if (!e.over) return;
                const id = String(e.active.id);
                const target = String(e.over.id);

                if (id.startsWith("guide-tool:")) {
                  const tool = id.slice(11) as ToolKey;
                  if (ops.isBlockTool(tool) && block) return;
                  add(
                    tool,
                    target === "guide-drop-group" && block && ops.isQuestionTool(tool)
                      ? block.id
                      : null,
                  );
                }

                if (id.startsWith("guide-group:") && target === "guide-drop-second") {
                  edit((a) =>
                    ops.moveTo(a, id.slice(12), {
                      sectionId: "practice-section-2",
                      groupId: null,
                      index: 0,
                    }),
                  );
                  markManaged("move");
                  setNotice("Đã di chuyển cả nhóm và các câu con sang Section II!");
                }
              }}
            >
              <div className="relative grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)_16rem]">
                {/* Visual cursor demo animation */}
                {animation && (step === 0 || step === 2) && (
                  <div className="guide-drag-demo pointer-events-none absolute left-4 top-4 z-30 flex items-center gap-2 rounded-md border-2 border-ink bg-card px-3 py-2 text-xs font-bold text-primary shadow-pop">
                    <MousePointer2 className="h-4 w-4" />
                    Kéo vào khu thực hành...
                  </div>
                )}

                {/* Cột trái: Công cụ kéo thả */}
                <aside className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Kéo hoặc bấm để thêm
                  </h3>
                  <DragTool
                    tool={GUIDE_BLOCK[scenario]}
                    label={ops.TYPE_LABEL[GUIDE_BLOCK[scenario]] ?? "Khối dùng chung"}
                    onAdd={() => !block && add(GUIDE_BLOCK[scenario])}
                  />
                  <DragTool
                    tool={questionTool}
                    label={ops.TYPE_LABEL[questionTool] ?? "Câu hỏi"}
                    onAdd={() => add(questionTool, block?.id ?? null)}
                  />
                  {scenario === "groups" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-2 border-border text-xs font-medium"
                      onClick={() => add("TEXT_INPUT")}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm câu độc lập
                    </Button>
                  )}
                </aside>

                {/* Cột giữa: Canvas DropZone */}
                <main className="min-w-0 space-y-4">
                  <div>
                    <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Section I · Khu thực hành
                    </h3>
                    <DropZone id="guide-drop-section" active={step === 0}>
                      {!block && (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
                          <ArrowDown className="mb-2 h-5 w-5 text-primary" />
                          Thả {ops.TYPE_LABEL[GUIDE_BLOCK[scenario]]} vào đây hoặc bấm nút ở cột trái
                        </div>
                      )}

                      {block && (
                        <div className="space-y-3 rounded-lg border-2 border-ink bg-card p-3 shadow-pop-sm">
                          <div className="flex items-center gap-2 border-b pb-2">
                            <GroupHandle id={block.id} />
                            <span className="flex-1 text-xs font-bold">
                              {ops.TYPE_LABEL[block.block.type]} · {block.memberIds.length} câu con
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:bg-destructive-soft"
                              onClick={() => {
                                edit((a) => {
                                  delete a.items[block.id];
                                  a.sections[0]?.itemIds = a.sections[0]?.itemIds.filter((id) => id !== block.id) ?? [];
                                });
                                setNotice("Đã xóa khối thực hành.");
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Nội dung khối */}
                          {block.block.type === "PASSAGE" && (
                            <div className="space-y-2">
                              <label className="text-xs font-medium">Nội dung bài đọc (dùng {'{{1}}'}, {'{{2}}'} làm chỗ trống):</label>
                              <textarea
                                className={cn(inputClass, "h-20 text-xs")}
                                value={block.block.text}
                                placeholder="Ví dụ: There are many {{1}} in our {{2}}..."
                                onChange={(e) =>
                                  edit((a) => {
                                    const b = a.items[block.id];
                                    if (b?.kind === "block" && b.block.type === "PASSAGE") {
                                      b.block.text = e.target.value;
                                    }
                                  })
                                }
                              />
                              {scenario === "cloze" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 border border-border text-xs font-medium"
                                  onClick={() => edit((a) => generatePracticeBlanks(a, block.id))}
                                >
                                  Tạo câu con tự động cho tất cả chỗ trống
                                </Button>
                              )}
                            </div>
                          )}

                          {block.block.type === "POOL" && (
                            <div className="space-y-2">
                              <span className="text-xs font-medium">Danh sách các lựa chọn trong Pool:</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {block.block.entries.map((entry, idx) => (
                                  <div key={entry.id} className="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs">
                                    <span className="font-bold text-primary">{String.fromCharCode(65 + idx)}.</span>
                                    <span>{entry.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {block.block.type === "MEDIA" && (
                            <div className="space-y-2">
                              <input
                                className={cn(inputClass, "text-xs")}
                                placeholder="Đường dẫn ảnh (URL)..."
                                value={block.block.url}
                                onChange={(e) =>
                                  edit((a) => {
                                    const b = a.items[block.id];
                                    if (b?.kind === "block" && b.block.type === "MEDIA") b.block.url = e.target.value;
                                  })
                                }
                              />
                              {block.block.url && (
                                <img
                                  src={block.block.url}
                                  alt={block.block.alt || "Ảnh mẫu"}
                                  className="h-32 w-full rounded border-2 border-ink object-cover shadow-pop-sm"
                                />
                              )}
                            </div>
                          )}

                          {/* Vùng chứa câu con trong nhóm */}
                          <div className="mt-3 border-t pt-2">
                            <span className="mb-2 block text-xs font-semibold text-muted-foreground">
                              Các câu hỏi trong nhóm:
                            </span>
                            <div className="space-y-1.5">
                              {block.memberIds.map((mId) => {
                                const item = practice.items[mId];
                                if (!item || item.kind !== "question") return null;
                                return (
                                  <Button
                                    key={mId}
                                    variant="outline"
                                    className={cn(
                                      "h-auto w-full justify-start border-2 border-border py-2 text-left text-xs",
                                      selected === mId && "border-primary bg-primary-soft/50 font-bold",
                                    )}
                                    onClick={() => setSelected(mId)}
                                  >
                                    <BookOpen className="mr-2 h-3.5 w-3.5 text-primary" />
                                    {item.content.prompt || "Chưa nhập đề bài"}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </DropZone>
                  </div>

                  {/* Section II: Phục vụ bước 6 Quản lý nhóm */}
                  {(scenario === "groups" || step === 5) && (
                    <div>
                      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Section II · Đích di chuyển nhóm
                      </h3>
                      <DropZone id="guide-drop-second" active={step === 5}>
                        <div className="flex flex-col items-center justify-center py-4 text-center text-xs text-muted-foreground">
                          Kéo biểu tượng tay cầm của cả nhóm thả vào đây để chuyển Section
                        </div>
                      </DropZone>
                    </div>
                  )}
                </main>

                {/* Cột phải: Thuộc tính câu hỏi */}
                <aside className="space-y-3 rounded-lg border-2 border-ink bg-card p-3 shadow-pop-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cài đặt câu hỏi
                  </h3>
                  {q?.kind === "question" ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-medium">Đề bài:</label>
                        <textarea
                          className={cn(inputClass, "mt-1 h-16 text-xs")}
                          value={q.content.prompt}
                          onChange={(e) =>
                            edit((a) => {
                              const it = a.items[q.id];
                              if (it?.kind === "question") it.content.prompt = e.target.value;
                            })
                          }
                        />
                      </div>

                      {q.content.type === "TEXT_INPUT" && (
                        <div>
                          <label className="font-medium">Đáp án chấp nhận:</label>
                          <input
                            className={cn(inputClass, "mt-1 text-xs")}
                            value={q.content.acceptedAnswers?.[0] ?? ""}
                            placeholder="Nhập từ chính xác..."
                            onChange={(e) =>
                              edit((a) => {
                                const it = a.items[q.id];
                                if (it?.kind === "question" && it.content.type === "TEXT_INPUT") {
                                  it.content.acceptedAnswers = [e.target.value];
                                }
                              })
                            }
                          />
                        </div>
                      )}

                      {q.content.type === "MATCHING" && block?.block.type === "POOL" && (
                        <div>
                          <label className="font-medium">Chọn từ khóa tương ứng trong Pool:</label>
                          <select
                            className={cn(inputClass, "mt-1 text-xs")}
                            value={q.content.poolEntryId ?? ""}
                            onChange={(e) =>
                              edit((a) => {
                                const it = a.items[q.id];
                                if (it?.kind === "question" && it.content.type === "MATCHING") {
                                  it.content.poolEntryId = e.target.value;
                                }
                              })
                            }
                          >
                            <option value="">-- Chọn một đáp án --</option>
                            {block.block.entries.map((ent, idx) => (
                              <option key={ent.id} value={ent.id}>
                                {String.fromCharCode(65 + idx)}. {ent.text}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-2 border-border text-xs"
                          onClick={() => {
                            if (!block) return;
                            edit((a) => {
                              const it = a.items[q.id];
                              if (!it || it.kind !== "question") return;
                              if (it.config.groupId) {
                                ops.moveTo(a, q.id, { sectionId: "practice-section-1", groupId: null, index: 0 });
                                markManaged("detach");
                              } else {
                                ops.moveTo(a, q.id, { sectionId: "practice-section-1", groupId: block.id, index: 0 });
                                markManaged("attach");
                              }
                            });
                          }}
                        >
                          <Unlink className="mr-1.5 h-3.5 w-3.5" />
                          {q.config.groupId ? "Tách khỏi nhóm (Detach)" : "Gắn vào nhóm (Attach)"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                      Bấm chọn một câu hỏi ở danh sách bên cạnh để xem và chỉnh sửa thuộc tính.
                    </p>
                  )}
                </aside>
              </div>
            </DndContext>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink bg-card px-5 py-3">
          <p className="text-xs font-semibold text-primary">
            {notice ||
              (ready
                ? "Nhiệm vụ đã sẵn sàng! Bấm 'Tiếp theo' để tiếp tục."
                : "Hoàn thành thao tác hiện tại hoặc bấm 'Thao tác mẫu'.")}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs font-medium"
              onClick={() => reset(scenario)}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Làm lại
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={step === 0}
              className="border-2 border-ink text-xs font-bold shadow-pop-sm"
              onClick={() => {
                setStep((s) => Math.max(0, s - 1));
                setAnimation(false);
              }}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Trước
            </Button>
            {step < 5 ? (
              <Button
                size="sm"
                disabled={!ready}
                className="border-2 border-ink bg-primary text-xs font-bold text-primary-foreground shadow-pop hover:-translate-y-0.5 active:translate-y-0"
                onClick={() => {
                  setStep((s) => Math.min(5, s + 1));
                  setAnimation(false);
                  setNotice("");
                }}
              >
                Tiếp theo <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="border-2 border-ink bg-success text-xs font-bold text-primary-foreground shadow-pop hover:-translate-y-0.5"
                onClick={() => setOpen(false)}
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Hoàn tất hướng dẫn
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
