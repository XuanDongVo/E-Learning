"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Check,
  Gamepad2,
  Image,
  Keyboard,
  Lightbulb,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import garden from "../../../../../public/assets/practice-garden.jpg";

/* ---------- Tailwind class tokens (thay cho các class .practice-* trong CSS) ---------- */
const blueBtn =
  "text-practice-light bg-practice-blue shadow-[0_2px_0_var(--color-practice-blue-dark)] hover:text-practice-light hover:bg-practice-blue-dark";
const paperBtn =
  "text-practice-ink bg-practice-paper border-2 border-practice-border shadow-[0_2px_0_var(--color-practice-border)] hover:bg-practice-light hover:text-practice-ink";
const keyRow = "border-practice-border bg-practice-light text-practice-ink";
const hintRow = "bg-practice-hint border-practice-blue";

export function PracticeSettings({
  open,
  onOpenChange,
  background,
  onBackgroundChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  background: string;
  onBackgroundChange: (background: string) => void;
}) {
  const [tab, setTab] = useState("keys");
  const shortcuts = [
    { label: "Gợi ý tiếp theo", keys: ["Ctrl", "H"], hint: true },
    { label: "Kiểm tra / nộp đáp án", keys: ["Enter"] },
    { label: "Chọn phương án 1–4", keys: ["1", "2", "3", "4"] },
    { label: "Chuyển câu trước / sau", keys: ["←", "→"] },
    { label: "Làm lại câu hiện tại", keys: ["Esc"] },
  ];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-practice-overlay backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-32px)] max-w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-practice-border bg-practice-paper p-5 text-practice-ink shadow-[0_18px_60px_var(--color-practice-overlay)] max-sm:max-h-[calc(100svh-32px)] max-sm:overflow-y-auto sm:p-6">
          <div className="flex items-start gap-3 pr-8">
            <span
              className={`${blueBtn} grid size-10 shrink-0 place-items-center rounded-xl`}
            >
              <SlidersHorizontal size={20} />
            </span>
            <div>
              <Dialog.Title className="text-lg font-extrabold">
                Cài đặt trò chơi
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-practice-subtle">
                Loại game, ảnh nền và phím tắt.
              </Dialog.Description>
            </div>
          </div>
          <Dialog.Close asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${paperBtn} absolute right-5 top-5 size-7 rounded-full`}
              aria-label="Đóng cài đặt"
            >
              <X size={14} />
            </Button>
          </Dialog.Close>
          <div
            className={`${keyRow} mt-4 flex rounded-xl border p-1`}
            role="tablist"
            aria-label="Cài đặt trò chơi"
          >
            {[
              { id: "keys", label: "Phím tắt", icon: Keyboard },
              { id: "background", label: "Đổi ảnh nền", icon: Image },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`min-w-0 flex-1 px-1 text-xs sm:text-sm ${tab === id ? blueBtn : "text-practice-subtle hover:text-practice-subtle"}`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Button>
            ))}
          </div>
          <div className="min-h-[315px] pt-4" role="tabpanel">
            {tab === "keys" && (
              <>
                <h3 className="text-sm font-extrabold">Phím tắt khi chơi</h3>
                <p className="mt-1 text-[11px] text-practice-subtle">
                  Dùng trên laptop; Ctrl + H vẫn hoạt động khi đang nhập đáp án.
                </p>
                <div className="mt-3 space-y-2">
                  {shortcuts.map((row) => (
                    <div
                      key={row.label}
                      className={`flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 py-2 ${row.hint ? hintRow : keyRow}`}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold">
                        {row.hint && <Lightbulb size={16} />}
                        {row.label}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {row.keys.map((key) => (
                          <kbd
                            key={key}
                            className="grid min-w-6 place-items-center rounded-md border border-practice-border bg-practice-paper px-1.5 py-1 text-[10px] font-bold text-practice-ink shadow-[0_2px_0_var(--color-practice-border)]"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-[10px] text-practice-subtle">
                  Trên mobile, dùng trực tiếp các nút ở thanh trên và thanh
                  dưới.
                </p>
              </>
            )}
            {tab === "background" && (
              <>
                <h3 className="text-sm font-extrabold">Không gian luyện tập</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["garden", "calm"].map((item) => (
                    <Button
                      key={item}
                      variant="outline"
                      className={`relative h-36 overflow-hidden p-0 ${background === item ? "outline-[3px] outline-offset-2 outline-practice-blue" : ""}`}
                      onClick={() => onBackgroundChange(item)}
                    >
                      <img
                        src={garden.src}
                        alt={
                          item === "garden"
                            ? "Vườn mộng mơ"
                            : "Bầu trời yên bình"
                        }
                        className={`absolute inset-0 h-full w-full object-cover ${item === "calm" ? "hue-rotate-[25deg] saturate-[0.65]" : ""}`}
                        width={1920}
                        height={1024}
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-practice-paper px-2 py-1 text-xs text-practice-ink">
                        {item === "garden"
                          ? "Vườn mộng mơ"
                          : "Bầu trời yên bình"}
                      </span>
                      {background === item && (
                        <Check
                          className="absolute right-2 top-2 rounded-full bg-practice-paper p-1 text-practice-ink"
                          size={24}
                        />
                      )}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              className={paperBtn}
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
            <Button className={blueBtn} onClick={() => onOpenChange(false)}>
              Xong
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
