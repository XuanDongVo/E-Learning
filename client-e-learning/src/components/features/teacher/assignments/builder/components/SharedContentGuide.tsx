"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Assignment,
  BlockType,
  ID,
  ToolKey,
} from "@/types/assignment-builder";
import * as ops from "../ops";
import {
  addPracticeItem,
  createPractice,
  detachPracticeQuestion,
  fillPracticeBlock,
  fillPracticeQuestion,
  firstPracticeBlock,
  generatePracticeBlanks,
  GUIDE_BLOCK,
  GUIDE_SECTION_A,
  GUIDE_SECTION_B,
  removePracticeBlock,
  type GuideScenario,
} from "../shared-guide";
import {
  GUIDE_LESSONS,
  GUIDE_STEPS,
  guideStepChecks,
} from "./shared-guide/guide-content";
import { GuideScenarioTabs, GuideStepBar } from "./shared-guide/GuideStepBar";
import { GuideStudentPreview } from "./shared-guide/GuideStudentPreview";
import { GuideWorkspace } from "./shared-guide/GuideWorkspace";
import type { GuideActions } from "./shared-guide/guide-types";

interface GuideState {
  practice: Assignment;
  selectedId: ID | null;
  managed: boolean;
}

const newGuideState = (): GuideState => ({
  practice: createPractice(),
  selectedId: null,
  managed: false,
});

/** Optional programmatic entry point. Mount <SharedContentGuide /> once in the Builder first. */
export function openSharedGuide(block?: BlockType) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("ab:shared-guide", { detail: block }));
}

function scenarioFor(block?: BlockType): GuideScenario {
  if (block === "POOL") return "pool";
  if (block === "MEDIA") return "media";
  if (block === "INSTRUCTIONS") return "instructions";
  return "cloze";
}

/** Interactive sandbox using the actual Builder types and operations, without its Zustand store. */
export function SharedContentGuide() {
  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState<GuideScenario>("cloze");
  const [step, setStep] = useState(0);
  const [state, setState] = useState<GuideState>(newGuideState);
  const [notice, setNotice] = useState("");
  const { practice, selectedId, managed } = state;
  const block = firstPracticeBlock(practice);
  const checks = guideStepChecks(practice, block, scenario, managed);

  const reset = useCallback((nextScenario: GuideScenario) => {
    setScenario(nextScenario);
    setStep(0);
    setState(newGuideState());
    setNotice("");
  }, []);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      reset(scenarioFor((event as CustomEvent<BlockType | undefined>).detail));
      setOpen(true);
    };
    window.addEventListener("ab:shared-guide", handleOpen);
    return () => window.removeEventListener("ab:shared-guide", handleOpen);
  }, [reset]);

  const edit = (
    fn: (a: Assignment) => void,
    selected?: ID | null,
    markManaged = false,
  ) => {
    setState((previous) => {
      const draft = structuredClone(previous.practice);
      fn(draft);
      return {
        practice: draft,
        selectedId: selected === undefined ? previous.selectedId : selected,
        managed: previous.managed || markManaged,
      };
    });
  };

  const questionTool: ToolKey =
    scenario === "pool"
      ? "MATCHING"
      : scenario === "media"
        ? "SINGLE_CHOICE"
        : "TEXT_INPUT";
  const actions: GuideActions = {
    addToolAt: (tool, sectionId, groupId = null) => {
      if (ops.isBlockTool(tool) && block) return;
      // The new ID is assigned inside the same state update as the document edit.
      setState((previous) => {
        const draft = structuredClone(previous.practice);
        const id = addPracticeItem(draft, tool, sectionId, groupId);
        return {
          ...previous,
          practice: draft,
          selectedId: ops.isQuestionTool(tool) ? id : null,
        };
      });
      setNotice("Đã thêm vào khu thực hành.");
    },
    addBlock: (sectionId) => {
      if (!block) {
        setState((previous) => {
          const draft = structuredClone(previous.practice);
          addPracticeItem(draft, GUIDE_BLOCK[scenario], sectionId);
          return { ...previous, practice: draft, selectedId: null };
        });
      }
    },
    addQuestion: (sectionId, groupId = null) => {
      setState((previous) => {
        const draft = structuredClone(previous.practice);
        const id = addPracticeItem(draft, questionTool, sectionId, groupId);
        return { ...previous, practice: draft, selectedId: id };
      });
    },
    generateBlanks: (blockId) => {
      setState((previous) => {
        const draft = structuredClone(previous.practice);
        const created = generatePracticeBlanks(draft, blockId);
        return {
          ...previous,
          practice: draft,
          selectedId: created[0] ?? previous.selectedId,
        };
      });
      setNotice(
        "Đã thêm các câu còn thiếu; đáp án đã nhập từ trước được giữ nguyên.",
      );
    },
    updateBlock: (id, fn) =>
      edit((a) => {
        const it = a.items[id];
        if (it?.kind === "block") fn(it);
      }),
    updateQuestion: (id, fn) =>
      edit((a) => {
        const it = a.items[id];
        if (it?.kind === "question") fn(it);
      }),
    selectQuestion: (id) =>
      setState((previous) => ({ ...previous, selectedId: id })),
    moveBlock: (id, sectionId) => {
      edit(
        (a) => {
          const location = ops.locate(a, id);
          const s = ops.getSection(a, sectionId);
          if (location && s && location.sectionId !== sectionId)
            ops.moveTo(a, id, {
              sectionId,
              groupId: null,
              index: s.itemIds.length,
            });
        },
        undefined,
        true,
      );
      setNotice("Đã di chuyển toàn bộ khối và các câu con cùng nhau.");
    },
    toggleGroup: (id, blockId) => {
      edit(
        (a) => {
          const loc = ops.locate(a, id),
            gLoc = ops.locate(a, blockId);
          const g = a.items[blockId],
            q = a.items[id];
          if (!loc || !gLoc || g?.kind !== "block" || q?.kind !== "question")
            return;
          if (loc.groupId === blockId) {
            detachPracticeQuestion(a, id);
          } else {
            if (
              q.content.type === "MATCHING" &&
              g.block.type === "POOL" &&
              q.content.poolId !== blockId
            ) {
              q.content.poolId = blockId;
              q.content.correctEntryId = null;
            }
            ops.moveTo(a, id, {
              sectionId: gLoc.sectionId,
              groupId: blockId,
              index: g.memberIds.length,
            });
          }
        },
        id,
        true,
      );
      setNotice(
        "Đã thay đổi nhóm. Nếu câu blank bị tách, blankRef được xóa theo logic Builder.",
      );
    },
    deleteBlock: (id, keepMembers) => {
      setState((previous) => {
        const draft = structuredClone(previous.practice);
        removePracticeBlock(draft, id, keepMembers);
        const selectedId =
          previous.selectedId && draft.items[previous.selectedId]
            ? previous.selectedId
            : null;
        return { ...previous, practice: draft, selectedId, managed: true };
      });
      setNotice(
        keepMembers
          ? "Đã xóa khối, giữ câu hỏi độc lập."
          : "Đã xóa khối và toàn bộ câu con.",
      );
    },
  };

  const demoStep = () => {
    if (step === 0) {
      actions.addBlock(GUIDE_SECTION_A);
      setNotice("Đã thêm khối mẫu.");
    } else if (step === 1 && block) {
      actions.updateBlock(block.id, (b) => fillPracticeBlock(b, scenario));
      setNotice("Đã điền nội dung khối. Bạn có thể sửa trực tiếp.");
    } else if (step === 2 && block) {
      if (scenario === "cloze") actions.generateBlanks(block.id);
      else {
        const count = scenario === "groups" ? 2 : 1;
        setState((previous) => {
          const draft = structuredClone(previous.practice);
          const gLoc = ops.locate(draft, block.id);
          if (!gLoc) return previous;
          let selected = previous.selectedId;
          const current = draft.items[block.id];
          const missing =
            current?.kind === "block"
              ? Math.max(0, count - current.memberIds.length)
              : 0;
          for (let i = 0; i < missing; i++)
            selected = addPracticeItem(
              draft,
              questionTool,
              gLoc.sectionId,
              block.id,
            );
          return { ...previous, practice: draft, selectedId: selected };
        });
        setNotice("Đã thêm các câu mẫu chưa có.");
      }
    } else if (step === 3 && block) {
      edit((a) => {
        const b = a.items[block.id];
        if (b?.kind !== "block") return;
        b.memberIds.forEach((id, i) => {
          const q = a.items[id];
          if (q?.kind === "question") fillPracticeQuestion(q, a, i);
        });
      });
      setNotice("Đã nhập đáp án mẫu theo schema hiện tại.");
    } else if (step === 5 && block) {
      const toSection =
        ops.locate(practice, block.id)?.sectionId === GUIDE_SECTION_B
          ? GUIDE_SECTION_A
          : GUIDE_SECTION_B;
      actions.moveBlock(block.id, toSection);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="w-full justify-start"
        onClick={() => {
          reset("cloze");
          setOpen(true);
        }}
      >
        <BookOpen className="h-4 w-4" /> Hướng dẫn Shared Content
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex max-h-[94vh] w-[min(1120px,calc(100vw-1.5rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1120px]"
          aria-describedby="shared-guide-description"
        >
          <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" /> Hướng dẫn Shared
              Content
            </DialogTitle>
            <DialogDescription id="shared-guide-description">
              Môi trường thực hành độc lập với Assignment đang soạn. Không gọi
              API lưu bài.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <GuideScenarioTabs scenario={scenario} onChange={reset} />
            <GuideStepBar step={step} checks={checks} onStep={setStep} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-primary/5 px-4 py-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-semibold text-primary">
                  Bước {step + 1}/6 · {GUIDE_STEPS[step]}
                </p>
                <p className="text-sm">{GUIDE_LESSONS[scenario][step]}</p>
              </div>
              {step !== 4 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={demoStep}
                  disabled={step > 0 && !block}
                >
                  <WandSparkles className="h-4 w-4" /> Thao tác mẫu
                </Button>
              )}
            </div>
            <div className="p-4">
              {step === 4 ? (
                <GuideStudentPreview key={scenario} assignment={practice} />
              ) : (
                <GuideWorkspace
                  practice={practice}
                  scenario={scenario}
                  step={step}
                  selectedId={selectedId}
                  block={block}
                  actions={actions}
                />
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-card px-4 py-3">
            <p role="status" className="max-w-xl text-xs text-muted-foreground">
              {notice ||
                (checks[step]
                  ? "Đã hoàn thành điều kiện của bước này."
                  : "Thực hiện thao tác hoặc sử dụng ‘Thao tác mẫu’. ")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => reset(scenario)}>
                <RotateCcw className="h-4 w-4" /> Làm lại
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={step === 0}
                onClick={() => {
                  setStep((s) => s - 1);
                  setNotice("");
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Trước
              </Button>
              {step < 5 ? (
                <Button
                  size="sm"
                  disabled={!checks[step]}
                  onClick={() => {
                    setStep((s) => s + 1);
                    setNotice("");
                  }}
                >
                  Tiếp theo <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={!checks[step]}
                  onClick={() => setOpen(false)}
                >
                  <CheckCircle2 className="h-4 w-4" /> Hoàn tất
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
