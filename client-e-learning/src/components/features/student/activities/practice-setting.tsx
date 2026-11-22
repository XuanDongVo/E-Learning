"use client";

import { useTranslations } from "next-intl";

import NextImage from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Check,
  Image as LucideImage,
  Keyboard,
  Lightbulb,
  SlidersHorizontal,
  Volume2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import garden from "../../../../../public/assets/practice-garden.jpg";

/* ---------- Shared global color tokens ---------- */
const blueBtn =
  "bg-learning text-primary-foreground shadow-pop-sm hover:bg-learning/90 hover:text-primary-foreground";
const paperBtn =
  "border-2 border-border bg-card-bg text-foreground shadow-pop-sm hover:bg-secondary hover:text-foreground";
const keyRow = "border-border bg-background text-foreground";
const hintRow = "border-learning bg-learning-soft";

export function PracticeSettings({
  open,
  onOpenChange,
  background,
  onBackgroundChange,
  soundEnabled,
  onSoundEnabledChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  background: string;
  onBackgroundChange: (background: string) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
}) {
  const t = useTranslations("student.activities.settings");
  const [tab, setTab] = useState("keys");
  const shortcuts = [
    { label: t("shortcuts.hint"), keys: ["Ctrl", "H"], hint: true },
    { label: t("shortcuts.check"), keys: ["Enter"] },
    { label: t("shortcuts.choice"), keys: ["1", "2", "3", "4"] },
    { label: t("shortcuts.navigate"), keys: ["←", "→"] },
    { label: t("shortcuts.reset"), keys: ["Esc"] },
  ];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-foreground/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-32px)] max-w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-border bg-card-bg p-5 text-foreground shadow-pop-lg max-sm:max-h-[calc(100svh-32px)] max-sm:overflow-y-auto sm:p-6">
          <div className="flex items-start gap-3 pr-8">
            <span
              className={`${blueBtn} grid size-10 shrink-0 place-items-center rounded-xl`}
            >
              <SlidersHorizontal size={20} />
            </span>
            <div>
              <Dialog.Title className="text-lg font-extrabold">
                {t("title")}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {t("description")}
              </Dialog.Description>
            </div>
          </div>
          <Dialog.Close asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${paperBtn} absolute right-5 top-5 size-7 rounded-full`}
              aria-label={t("closeSettings")}
            >
              <X size={14} />
            </Button>
          </Dialog.Close>
          <div
            className={`${keyRow} mt-4 flex rounded-xl border p-1`}
            role="tablist"
            aria-label={t("tablist")}
          >
            {[
              { id: "keys", label: t("tabs.keys"), icon: Keyboard },
              { id: "background", label: t("tabs.background"), icon: LucideImage },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`min-w-0 flex-1 px-1 text-xs sm:text-sm ${tab === id ? blueBtn : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Button>
            ))}
          </div>
          <div className="min-h-[315px] pt-4" role="tabpanel">
            {tab === "keys" && (
              <>
                <label className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-sm font-bold">
                  <span className="flex items-center gap-2"><Volume2 size={17} /> {t("sound")}</span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(event) => onSoundEnabledChange(event.target.checked)}
                    className="size-5 accent-learning"
                  />
                </label>
                <h3 className="text-sm font-extrabold">{t("shortcutTitle")}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t("shortcutHint")}
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
                            className="grid min-w-6 place-items-center rounded-md border border-border bg-card-bg px-1.5 py-1 text-[10px] font-bold text-foreground shadow-pop-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-[10px] text-muted-foreground">
                  {t("mobile")}
                </p>
              </>
            )}
            {tab === "background" && (
              <>
                <h3 className="text-sm font-extrabold">{t("environment")}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["garden", "calm"].map((item) => (
                    <Button
                      key={item}
                      variant="outline"
                      className={`relative h-36 overflow-hidden p-0 ${background === item ? "outline-[3px] outline-offset-2 outline-learning" : ""}`}
                      onClick={() => onBackgroundChange(item)}
                    >
                      <NextImage
                        src={garden}
                        alt={
                          item === "garden"
                            ? t("garden")
                            : t("calm")
                        }
                        className={`absolute inset-0 h-full w-full object-cover ${item === "calm" ? "hue-rotate-[25deg] saturate-[0.65]" : ""}`}
                        width={1920}
                        height={1024}
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-card-bg px-2 py-1 text-xs text-foreground">
                        {item === "garden"
                          ? "Vườn mộng mơ"
                          : "Bầu trời yên bình"}
                      </span>
                      {background === item && (
                        <Check
                          className="absolute right-2 top-2 rounded-full bg-card-bg p-1 text-foreground"
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
              {t("close")}
            </Button>
            <Button className={blueBtn} onClick={() => onOpenChange(false)}>
              {t("done")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
