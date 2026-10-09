import { useEffect, useState } from "react";
import type { ActivitySessionQuestion } from "@/types/activity-session";

export const TYPE_LABEL: Record<ActivitySessionQuestion["type"], string> = {
  SINGLE_CHOICE: "Chọn một đáp án",
  MULTIPLE_CHOICE: "Chọn nhiều đáp án",
  TRUE_FALSE: "Đúng / Sai",
  FILL_IN_BLANK: "Điền vào chỗ trống",
  TYPE_ANSWER: "Nhập đáp án",
};

export const isChoice = (q: Pick<ActivitySessionQuestion, "type">) =>
  q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE";

/** Server trả đáp án đúng của câu chọn là chuỗi key "A,C"; câu nhập là chuỗi giá trị. */
export const splitKeys = (value?: string) =>
  value ? value.split(",").map((k) => k.trim().toUpperCase()).filter(Boolean) : [];

/** Hiển thị đáp án (key → "A. nội dung") để đọc được, không đoán dữ liệu server không gửi. */
export function formatAnswer(q: ActivitySessionQuestion, answer: string[]) {
  if (answer.length === 0) return "";
  if (q.type === "TRUE_FALSE") return answer[0].toUpperCase() === "TRUE" ? "Đúng" : "Sai";
  if (!isChoice(q)) return answer.join(", ");
  return answer
    .map((key) => {
      const o = q.options.find((x) => x.key.toUpperCase() === key.toUpperCase());
      return o ? `${o.key}. ${o.content}` : key;
    })
    .join("; ");
}

/** true khi một request vẫn đang chờ sau `ms` mili-giây → hiện thông báo "phản hồi chậm" thay vì im lặng. */
export function useSlow(pending: boolean, ms = 2000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setSlow(true), ms);
    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [pending, ms]);
  return pending && slow;
}
