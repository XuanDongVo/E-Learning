import {
  FileQuestion,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

import type { ContentView } from "@/types/content";

import { EntityHeader } from "./components/entity-header";
import { ContentTabs } from "./components/content-tabs";
import { Badge } from "./components/badge";
import { contentQuestions } from "@/mock/content";

export function QuestionBankDetail({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  return (
    <>
      <EntityHeader
        title="Past Simple - Basic"
        label="100 questions"
        icon={<FileQuestion size={21} />}
        description="Choose the correct option to complete the sentence."
        editLabel="Edit Question Bank"
      />

      <ContentTabs
        active="Questions"
        items={["Questions", "Details", "Statistics"]}
      />

      <section className="mb-5 overflow-x-auto rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        <div className="mb-3 flex min-w-[640px] gap-2">
          <div className="mr-auto flex h-8 w-[200px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-slate-400">
            <Search size={14} />
            <input className="w-full border-0 text-caption text-slate-700 outline-none" placeholder="Search questions..." />
          </div>

          <select className="h-8 rounded-md border border-slate-200 bg-white px-2 text-caption text-slate-500 outline-none">
            <option>All types</option>
          </select>

          <select className="h-8 rounded-md border border-slate-200 bg-white px-2 text-caption text-slate-500 outline-none">
            <option>All difficulty</option>
          </select>

          <select className="h-8 rounded-md border border-slate-200 bg-white px-2 text-caption text-slate-500 outline-none">
            <option>All status</option>
          </select>

          <button
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-caption font-bold text-white hover:bg-primary-hover"
            onClick={() => onNavigate("question")}
          >
            <Plus size={14} />
            Add Question
          </button>
        </div>

        <table className="w-full min-w-[680px] border-collapse text-caption">
          <thead>
            <tr>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">#</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Question</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Type</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Difficulty</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Status</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {contentQuestions.map((question, index) => (
              <tr
                key={index}
                onClick={() => onNavigate("question")}
              >
                <td className="border-b border-slate-100 p-2.5 text-slate-400">{index + 1}</td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <b className="font-semibold text-blue-900">
                    {question.text}
                  </b>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <Badge tone="blue">
                    {question.type}
                  </Badge>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <Badge
                    tone={question.difficulty === "Easy" ? "easy" : question.difficulty === "Medium" ? "medium" : "hard"}
                  >
                    {question.difficulty}
                  </Badge>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <Badge>Active</Badge>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <MoreHorizontal size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex min-w-[640px] items-center justify-between pt-4 text-caption text-slate-500">
          <b>Total: 100 questions</b>

          <div className="flex gap-1">
            <button className="h-6 w-6 rounded border border-slate-200 bg-white text-caption text-slate-500">‹</button>
            <button className="h-6 w-6 rounded border border-primary bg-primary text-caption text-white">1</button>
            {[2, 3, 4, 5].map((page) => <button className="h-6 w-6 rounded border border-slate-200 bg-white text-caption text-slate-500" key={page}>{page}</button>)}
            <button className="h-6 w-6 rounded border border-slate-200 bg-white text-caption text-slate-500">›</button>
          </div>
        </div>
      </section>
    </>
  );
}