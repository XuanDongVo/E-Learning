import type { Assignment, BlockItem, Item, ToolKey } from "@/types/assignment-builder";
import * as ops from "./ops";

export type GuideScenario = "cloze" | "pool" | "media" | "instructions" | "groups";

export const GUIDE_BLOCK: Record<GuideScenario, ToolKey> = {
  cloze: "READING_PASSAGE",
  pool: "ANSWER_POOL",
  media: "IMAGE_MEDIA",
  instructions: "INSTRUCTIONS",
  groups: "READING_PASSAGE",
};

/** Tạo một bài tập mẫu cô lập hoàn toàn cho khu thực hành */
export function createPractice(): Assignment {
  return {
    id: "practice-assignment",
    title: "Thực hành Shared Content",
    subject: "Tiếng Anh",
    grade: "6",
    status: "draft",
    settings: {
      timeLimitMinutes: null,
      shuffleQuestions: false,
      shuffleOptions: false,
      passingScore: 50,
      maxAttempts: 1,
    },
    sections: [
      { id: "practice-section-1", title: "Section I · Khu thực hành", itemIds: [] },
      { id: "practice-section-2", title: "Section II · Đích di chuyển", itemIds: [] },
    ],
    items: {},
  };
}

/** Thêm một phần tử vào khu thực hành */
export function addPracticeItem(a: Assignment, tool: ToolKey, groupId: string | null = null): string {
  const id = `practice-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const sec = a.sections[0];
  if (!sec) return id;

  if (ops.isBlockTool(tool)) {
    const blockType =
      tool === "ANSWER_POOL"
        ? "POOL"
        : tool === "IMAGE_MEDIA"
        ? "MEDIA"
        : tool === "INSTRUCTIONS"
        ? "INSTRUCTIONS"
        : "PASSAGE";

    const blockItem: BlockItem = {
      id,
      kind: "block",
      sectionId: sec.id,
      memberIds: [],
      block:
        blockType === "POOL"
          ? {
              type: "POOL",
              instruction: "Chọn từ trong khung để hoàn thành các câu sau:",
              entries: [
                { id: "e1", text: "apple" },
                { id: "e2", text: "banana" },
                { id: "e3", text: "cherry" },
                { id: "e4", text: "date" },
                { id: "e5", text: "elderberry" },
                { id: "e6", text: "fig" },
                { id: "e7", text: "grape" },
                { id: "e8", text: "honeydew" },
              ],
            }
          : blockType === "MEDIA"
          ? {
              type: "MEDIA",
              url: "",
              alt: "",
              caption: "",
            }
          : blockType === "INSTRUCTIONS"
          ? {
              type: "INSTRUCTIONS",
              text: "",
            }
          : {
              type: "PASSAGE",
              text: "",
              title: "Bài đọc mẫu",
            },
    };
    a.items[id] = blockItem;
    sec.itemIds.push(id);
    return id;
  }

  // Thêm câu hỏi
  const qItem: Item = {
    id,
    kind: "question",
    sectionId: sec.id,
    config: { groupId, points: 1, required: true },
    content:
      tool === "MATCHING"
        ? {
            type: "MATCHING",
            prompt: "1. A red fruit typically grown in cool climates",
            poolEntryId: "",
          }
        : tool === "SINGLE_CHOICE"
        ? {
            type: "SINGLE_CHOICE",
            prompt: "What does the passage say about...",
            options: [
              { id: "o1", text: "Option A" },
              { id: "o2", text: "Option B" },
            ],
            correctOptionId: "o1",
          }
        : {
            type: "TEXT_INPUT",
            prompt: "Điền từ thích hợp vào chỗ trống",
            acceptedAnswers: ["classroom"],
            caseSensitive: false,
          },
  };

  a.items[id] = qItem;
  if (groupId && a.items[groupId]?.kind === "block") {
    (a.items[groupId] as BlockItem).memberIds.push(id);
  } else {
    sec.itemIds.push(id);
  }
  return id;
}

/** Tự động sinh câu con từ các chỗ trống {{1}}, {{2}} */
export function generatePracticeBlanks(a: Assignment, blockId: string) {
  const b = a.items[blockId];
  if (!b || b.kind !== "block" || b.block.type !== "PASSAGE") return;

  const numbers = ops.blankNumbers(b.block.text);
  b.memberIds = [];

  numbers.forEach((num) => {
    const qId = `practice-blank-${num}-${Date.now()}`;
    a.items[qId] = {
      id: qId,
      kind: "question",
      sectionId: b.sectionId,
      config: { groupId: b.id, points: 1, required: true },
      content: {
        type: "TEXT_INPUT",
        prompt: `Chỗ trống (${num})`,
        blankRef: num,
        acceptedAnswers: [num === 1 ? "students" : "teacher"],
        caseSensitive: false,
      },
    };
    b.memberIds.push(qId);
  });
}

/** Kiểm tra câu hỏi con đã được cấu hình đáp án chưa */
export function practiceQuestionReady(item: Item, a: Assignment): boolean {
  if (item.kind !== "question") return false;
  const c = item.content;
  if (c.type === "MATCHING") return !!c.poolEntryId;
  if (c.type === "SINGLE_CHOICE") return !!c.correctOptionId;
  if (c.type === "TEXT_INPUT") return (c.acceptedAnswers?.length ?? 0) > 0 && !!c.acceptedAnswers[0]?.trim();
  return true;
}

/** Kiểm tra các blanks trong Cloze đã được nối đầy đủ chưa */
export function practiceBlanksLinked(a: Assignment, block: BlockItem): boolean {
  if (block.block.type !== "PASSAGE") return true;
  const numbers = ops.blankNumbers(block.block.text);
  if (numbers.length === 0) return false;
  const memberBlanks = block.memberIds
    .map((id) => a.items[id])
    .filter((it): it is Item => it?.kind === "question")
    .map((it) => it.content.blankRef)
    .filter(Boolean);
  return numbers.every((n) => memberBlanks.includes(n));
}

/** Thao tác mẫu: Tự động điền nội dung cho khối chung */
export function fillPracticeBlock(b: BlockItem, scenario: GuideScenario) {
  if (scenario === "cloze" && b.block.type === "PASSAGE") {
    b.block.text = "There are many {{1}} in our school. The {{2}} is very kind and helpful.";
  } else if (scenario === "media" && b.block.type === "MEDIA") {
    b.block.url = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80";
    b.block.alt = "Phòng học hiện đại";
    b.block.caption = "Hình 1: Một góc lớp học tiếng Anh";
  } else if (scenario === "instructions" && b.block.type === "INSTRUCTIONS") {
    b.block.text = "Đọc kỹ đoạn trích và chọn phương án trả lời chính xác nhất bên dưới:";
  } else if (b.block.type === "PASSAGE") {
    b.block.text = "English is one of the most widely spoken languages across the globe.";
  }
}

/** Thao tác mẫu: Tự động điền đề bài và đáp án cho câu hỏi con */
export function fillPracticeQuestion(item: Item, block: BlockItem, index: number) {
  if (item.kind !== "question") return;
  if (item.content.type === "MATCHING" && block.block.type === "POOL") {
    const entry = block.block.entries[index % block.block.entries.length];
    if (entry) {
      item.content.prompt = `Vật thể số ${index + 1} cần nối`;
      item.content.poolEntryId = entry.id;
    }
  } else if (item.content.type === "TEXT_INPUT") {
    item.content.acceptedAnswers = [index === 0 ? "students" : "teacher"];
  } else if (item.content.type === "SINGLE_CHOICE") {
    item.content.options = [
      { id: "opt-1", text: "Phổ biến toàn cầu" },
      { id: "opt-2", text: "Chỉ nói ở châu Âu" },
    ];
    item.content.correctOptionId = "opt-1";
  }
}
