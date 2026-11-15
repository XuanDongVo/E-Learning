"use client";

import Image from "next/image";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { PracticeStart } from "../../practice-start";
import garden from "../../../../../../../public/assets/practice-garden.jpg";
import type { PracticeController } from "../controller/use-practice-controller";
import { PracticeDialogs } from "./practice-dialogs";
import { PracticeFooter } from "./practice-footer";
import { PracticeHeader } from "./practice-header";
import { PracticeWorkspace } from "./practice-workspace";

export function PracticeShell({
  unitId,
  controller,
}: {
  unitId: number;
  controller: PracticeController;
}) {
  const {
    background,
    effectiveMode,
    effectiveStrategy,
    options,
    question,
    session,
    sessionOptions,
    setMode,
    setStrategy,
    start,
    startSlow,
    tErrors,
  } = controller;

  if (!session || !question) {
    return (
      <PracticeStart
        unitId={unitId}
        options={sessionOptions}
        loading={options.isLoading}
        loadError={
          options.isError
            ? getAppErrorMessage(
                options.error,
                tErrors as (key: string) => string,
              )
            : undefined
        }
        onReload={() => options.refetch()}
        mode={effectiveMode}
        onModeChange={setMode}
        strategy={effectiveStrategy}
        onStrategyChange={setStrategy}
        starting={start.isPending}
        slow={startSlow}
        startError={
          start.isError
            ? getAppErrorMessage(
                start.error,
                tErrors as (key: string) => string,
              )
            : undefined
        }
        onStart={() => start.mutate()}
      />
    );
  }

  return (
    <section
      className="student-practice-runtime fixed inset-0 z-[45] overflow-y-auto bg-learning text-foreground"
      aria-label="Luyện tập tiếng Anh"
    >
      <Image
        src={garden}
        alt=""
        width={1920}
        height={1024}
        priority
        className={`fixed inset-0 h-full w-full object-cover ${background === "calm" ? "hue-rotate-[25deg] saturate-[0.65]" : ""}`}
      />
      <div className="relative mx-auto flex min-h-svh max-w-[880px] flex-col px-4 pb-5 pt-7 max-sm:pt-[18px] lg:max-w-[1140px]">
        <PracticeHeader controller={controller} />
        <PracticeWorkspace unitId={unitId} controller={controller} />
        <PracticeFooter controller={controller} />
      </div>
      <PracticeDialogs controller={controller} />
    </section>
  );
}
