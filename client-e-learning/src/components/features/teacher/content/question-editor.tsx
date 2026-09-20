"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Plus,
  Zap,
} from "lucide-react";

import type { ContentView } from "@/types/content";

import { Badge } from "./components/badge";

export function QuestionEditor({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  const [type, setType] = useState("MULTIPLE_CHOICE");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3.5">
        <div>
          <div className="mb-1.5 text-caption text-slate-400">
            Question Editor
            <Badge tone="blue">Multiple Choice</Badge>
          </div>

          <h1>Edit Question</h1>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-caption text-primary">
          <Zap size={14} />
          Preview
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,.7fr)]">
        <section className="rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
          <h2 className="mb-4 border-b border-slate-100 pb-3 text-card-title font-bold text-slate-900">Question Details</h2>

          <label className="mb-3.5 flex flex-col gap-1.5 text-caption font-bold text-blue-900">
            Question Type

            <select className="rounded-md border border-slate-200 bg-white p-2 text-caption font-normal text-blue-900 outline-none"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="MULTIPLE_CHOICE">
                Multiple Choice
              </option>

              <option value="TRUE_FALSE">
                True / False
              </option>

              <option value="FILL_IN_BLANK">
                Fill in the Blank
              </option>

              <option value="TYPE_ANSWER">
                Type Answer
              </option>
            </select>
          </label>

          <label className="mb-3.5 flex flex-col gap-1.5 text-caption font-bold text-blue-900">
            Difficulty

            <select className="rounded-md border border-slate-200 bg-white p-2 text-caption font-normal text-blue-900 outline-none">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </label>

          <label className="mb-3.5 flex flex-col gap-1.5 text-caption font-bold text-blue-900">
            Question Text

            <textarea className="min-h-[72px] resize-y rounded-md border border-slate-200 bg-white p-2 text-caption font-normal text-blue-900 outline-none" defaultValue="She ____ to school yesterday." />
          </label>

          <div className="my-[18px]">
            <div className="mb-4 flex items-center justify-between">
              <b>Options</b>

              <button className="flex items-center gap-1 border-0 bg-transparent text-caption text-primary">
                <Plus size={13} />
                Add option
              </button>
            </div>

            {["go", "went", "goes", "going"].map(
              (option, index) => (
                <div className="mb-1.5 flex items-center gap-1.5" key={option}>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-micro text-slate-500">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <input className="min-w-0 flex-1 rounded-md border border-slate-200 p-2 text-caption text-blue-900 outline-none" defaultValue={option} />

                  <button
                    className={`flex min-w-[55px] items-center gap-1 border-0 bg-transparent text-micro ${index === 1 ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {index === 1 && (
                      <CheckCircle2 size={15} />
                    )}

                    {index === 1 ? "Correct" : ""}
                  </button>
                </div>
              ),
            )}
          </div>

          <label className="mb-3.5 flex flex-col gap-1.5 text-caption font-bold text-blue-900">
            Explanation

            <textarea className="min-h-[72px] resize-y rounded-md border border-slate-200 bg-white p-2 text-caption font-normal text-blue-900 outline-none" defaultValue="The past simple is used for completed actions in the past." />
          </label>
        </section>

        <aside className="flex flex-col gap-3.5">
          <div className="rounded-[9px] border border-slate-200 bg-white p-[15px]">
            <b>
              Media <span>(optional)</span>
            </b>

            <div className="flex min-h-[130px] flex-col items-center justify-center rounded-md border border-dashed border-blue-200 text-center text-slate-400">
              <Plus size={18} />
              <p>Upload image / audio / video</p>
            </div>
          </div>

          <div className="rounded-[9px] border border-slate-200 bg-white p-[15px]">
            <b>Tags</b>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="blue">Past Simple</Badge>
              <Badge tone="violet">Grammar</Badge>

              <button className="flex items-center gap-1 rounded-full border-0 bg-slate-100 px-2 py-1 text-micro text-slate-500">
                <Plus size={12} />
                Add tag
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-caption text-primary"
          onClick={() => onNavigate("bank")}
        >
          Cancel
        </button>

        <button
          className="rounded-md bg-primary px-3 py-2 text-caption font-bold text-white hover:bg-primary-hover"
          onClick={() => onNavigate("bank")}
        >
          Save question
        </button>
      </div>
    </>
  );
}