import {
  MoreHorizontal,
  Tags,
} from "lucide-react";

import type { ContentView } from "@/types/content";

import { EntityHeader } from "./components/entity-header";
import { ContentTabs } from "./components/content-tabs";
import { TableTitle } from "./components/table-title";
import { Badge } from "./components/badge";
import { IconTile } from "./components/icon-tile";
import { contentTopics } from "@/mock/content";

export function SectionDetail({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  return (
    <>
      <EntityHeader
        title="Grammar"
        label="Section"
        icon={<Tags size={21} />}
        description="Learn and practice key grammar structures."
        editLabel="Edit Section"
      />

      <ContentTabs
        active="Topics"
        items={["Topics", "Settings"]}
      />

      <section className="mb-5 overflow-x-auto rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        <TableTitle
          title="Topics"
          count={contentTopics.length}
          action="Add Topic"
          onAction={() => {}}
        />

        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">#</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Topic name</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Question Banks</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Total questions</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Status</th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {contentTopics.map((topic, index) => (
              <tr
                key={topic.name}
                onClick={() => onNavigate("topic")}
              >
                <td className="border-b border-slate-100 p-2.5 text-slate-400 text-sm">{index + 1}</td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">
                  <div className="flex items-center gap-2">
                    <IconTile tone={topic.tone}>
                      <Tags size={15} />
                    </IconTile>

                    <b>{topic.name}</b>
                  </div>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">
                  {topic.banks}{" "}
                  {topic.banks === 1 ? "bank" : "banks"}
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">{topic.questions}</td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">
                  <Badge>Active</Badge>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">
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