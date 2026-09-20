import {
  FileQuestion,
  MoreHorizontal,
  Tags,
} from "lucide-react";

import type { ContentView } from "@/types/content";

import { EntityHeader } from "./components/entity-header";
import { ContentTabs } from "./components/content-tabs";
import { TableTitle } from "./components/table-title";
import { Badge } from "./components/badge";
import { IconTile } from "./components/icon-tile";
import { contentQuestionBanks } from "@/mock/content";

export function TopicDetail({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  return (
    <>
      <EntityHeader
        title="Past Simple"
        label="Grammar"
        icon={<Tags size={21} />}
        description="Use past simple to talk about completed actions."
        editLabel="Edit Topic"
      />

      <ContentTabs
        active="Question Banks"
        items={["Question Banks", "Details"]}
      />

      <section className="mb-5 overflow-x-auto rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        <TableTitle
          title="Question Banks"
          count={contentQuestionBanks.length}
          action="Add Question Bank"
          onAction={() => onNavigate("bank")}
        />

        <table className="w-full min-w-[760px] border-collapse text-caption">
          <thead>
            <tr>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">#</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Name</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Type</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Questions</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Difficulty</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Status</th>
              <th className="bg-slate-50 p-2.5 text-left text-micro text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {contentQuestionBanks.map((bank, index) => (
              <tr
                key={bank.name}
                onClick={() => onNavigate("bank")}
              >
                <td className="border-b border-slate-100 p-2.5 text-slate-400">{index + 1}</td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <div className="flex items-center gap-2">
                    <IconTile tone="violet">
                      <FileQuestion size={15} />
                    </IconTile>

                    <b>{bank.name}</b>
                  </div>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">{bank.type}</td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">{bank.questions}</td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <Badge tone={bank.difficulty === "Easy" ? "easy" : bank.difficulty === "Medium" ? "medium" : "hard"}>
                    {bank.difficulty}
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
      </section>
    </>
  );
}