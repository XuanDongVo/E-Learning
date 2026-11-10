import type { Assignment, BlockItem, QuestionItem } from "@/types/assignment-builder";
import * as ops from "../../ops";
import { validate } from "../../validation";
import { practiceBlanksLinked, type GuideScenario } from "../../shared-guide";

export const GUIDE_SCENARIOS: { id: GuideScenario; label: string }[] = [
  { id: "cloze", label: "Passage + blanks" },
  { id: "pool", label: "Answer pool + Matching" },
  { id: "media", label: "Image + questions" },
  { id: "instructions", label: "Instructions + questions" },
  { id: "groups", label: "Move / detach / delete" },
];

export const GUIDE_STEPS = [
  "Thêm khối", "Soạn nội dung", "Thêm câu hỏi", "Cài đáp án", "Xem trước", "Quản lý nhóm",
] as const;

export const GUIDE_LESSONS: Record<GuideScenario, readonly string[]> = {
  cloze: [
    "Thêm Reading passage vào Section I từ danh sách công cụ.",
    "Viết đoạn đọc với ký hiệu {{1}}, {{2}} để đánh dấu chỗ trống.",
    "Bấm ‘Tạo câu cho blanks’; thao tác này chỉ bổ sung chỗ trống chưa có câu hỏi.",
    "Chọn từng câu con và nhập đáp án chấp nhận. Các blank liên kết bằng blankRef.",
    "Xem bài từ phía học sinh; nội dung đáp án đúng không được đưa vào preview.",
    "Di chuyển cả khối hoặc tách câu hỏi. Khi xóa khối có thành viên, chọn cách xử lý các câu con.",
  ],
  pool: [
    "Thêm Answer pool vào Section I.",
    "Nhập tên Pool và các đáp án. Mỗi lựa chọn có ID ổn định, chữ A/B/C là nhãn hiển thị.",
    "Thêm câu Matching vào Pool (hoặc tạo câu ngoài rồi gắn với Pool cùng Section).",
    "Chọn từng câu, nhập đề bài và chọn Correct entry. Liên kết dùng poolId + correctEntryId.",
    "Kiểm tra danh sách đáp án A/B/C và lựa chọn của học sinh.",
    "Có thể di chuyển nguyên Pool kèm câu sang Section II. Matching phải dùng Pool cùng Section.",
  ],
  media: [
    "Thêm khối Image vào Section I.",
    "Điền URL, alt text và caption. Ảnh cần URL có thể truy cập từ trình duyệt.",
    "Thêm Single choice vào nhóm Image.",
    "Nhập câu hỏi, nội dung phương án và chọn đúng một phương án.",
    "Xem ảnh ở đầu nhóm và các câu hỏi nằm phía dưới.",
    "Thử chuyển cả nhóm sang Section II, hoặc tách câu hỏi để dùng độc lập.",
  ],
  instructions: [
    "Thêm Instructions vào Section I.",
    "Viết chỉ dẫn chung cho nhóm câu hỏi.",
    "Thêm Text input vào nhóm Instructions.",
    "Cấu hình đề bài và đáp án được chấp nhận.",
    "Kiểm tra chỉ dẫn chỉ xuất hiện một lần trước các câu hỏi thuộc nhóm.",
    "Thử gắn / tách câu hỏi, di chuyển hoặc xóa nhóm có xác nhận.",
  ],
  groups: [
    "Thêm Reading passage làm khối mẹ.",
    "Nhập một đoạn đọc thông thường, không cần dấu blank.",
    "Thêm ít nhất hai câu trong khối. Có thể thêm câu độc lập ở Section I.",
    "Cấu hình nội dung và đáp án từng câu con.",
    "Xem sự khác biệt giữa câu trong nhóm và câu độc lập.",
    "Dùng tay cầm hoặc nút chuyển để di chuyển cả nhóm; thử detach/attach và lựa chọn xóa an toàn.",
  ],
};

export function guideStepChecks(a: Assignment, block: BlockItem | null, scenario: GuideScenario, managed: boolean): boolean[] {
  const members = block?.memberIds.map((id) => a.items[id]).filter((x): x is QuestionItem => x?.kind === "question") ?? [];
  const filled = block ? block.block.type === "PASSAGE"
    ? scenario === "cloze" ? ops.blankNumbers(block.block.text).length >= 2 : !!block.block.text.trim()
    : block.block.type === "POOL" ? block.block.entries.length >= 2 && block.block.entries.every((e) => e.text.trim())
    : block.block.type === "MEDIA" ? !!block.block.url.trim() && !!block.block.alt.trim()
    : !!block.block.text.trim() : false;
  const linked = scenario === "cloze" ? !!block && practiceBlanksLinked(a, block)
    : scenario === "pool" ? members.some((q) => q.content.type === "MATCHING" && q.content.poolId === block?.id)
    : members.length >= (scenario === "groups" ? 2 : 1);
  const questionErrors = new Set(validate(a).filter((v) => v.level === "error").map((v) => v.target.id));
  const configured = members.length > 0 && members.every((q) => !questionErrors.has(q.id));
  return [!!block, filled, linked, configured, configured, managed];
}
