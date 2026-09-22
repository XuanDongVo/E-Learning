import {
  Archive,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  Edit3,
  MoreHorizontal,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type { ContentSection, ContentView } from "@/types/content";

import { EntityHeader } from "./components/entity-header";
import { ContentTabs } from "./components/content-tabs";
import { TableTitle } from "./components/table-title";
import { Badge } from "./components/badge";
import { IconTile } from "./components/icon-tile";
import { contentSections } from "@/mock/content";

export function UnitDetail({
  onNavigate,
}: {
  onNavigate: (view: ContentView) => void;
}) {
  const [sectionItems, setSectionItems] =
    useState<ContentSection[]>(contentSections);
  const [archivedSections, setArchivedSections] = useState<string[]>([]);
  const [newSection, setNewSection] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const addSection = () => {
    const name = newSection.trim();
    if (!name) return;
    setSectionItems((current) => [
      ...current,
      { name, topics: 0, tone: "blue" },
    ]);
    setNewSection("");
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sectionItems.length) return;
    setSectionItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const saveSectionName = (name: string) => {
    const nextName = editingName.trim();
    if (!nextName) return;
    setSectionItems((current) =>
      current.map((section) =>
        section.name === name ? { ...section, name: nextName } : section,
      ),
    );
    setEditingSection(null);
  };

  const toggleArchive = (name: string) => {
    setArchivedSections((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  return (
    <>
      <EntityHeader
        title="Unit 2 – Travel & Holiday"
        label="Grade 6"
        icon={<Zap size={21} />}
        tone="violet"
        description="Explore places, activities and experiences around the world."
        editLabel="Edit Unit"
      />

      <ContentTabs
        active="Sections"
        items={["Overview", "Sections", "Question Banks", "Settings"]}
      />

      <section className="mb-5 overflow-x-auto rounded-[9px] border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(94,134,173,0.04)] sm:p-[18px]">
        <TableTitle
          title="Sections"
          count={sectionItems.length}
          action="Add Section"
          onAction={() => setNewSection((current) => current || "New section")}
        />

        {newSection && (
          <div className="mb-4 flex gap-2 rounded-md bg-primary-light p-2">
            <input
              autoFocus
              className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1.5  text-sm outline-none"
              value={newSection}
              onChange={(event) => setNewSection(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addSection()}
            />
            <button
              className="rounded bg-primary px-2 text-white"
              onClick={addSection}
              aria-label="Save section"
            >
              <Check size={13} />
            </button>
            <button
              className="rounded border border-slate-200 bg-white px-2 text-slate-500"
              onClick={() => setNewSection("")}
              aria-label="Cancel"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <table className="w-full min-w-[620px] border-collapse  text-sm">
          <thead>
            <tr>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                #
              </th>
              <th className="bg-slate-50 p-2.5 text-left text-sm  text-slate-500">
                Section name
              </th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Topics
              </th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Status
              </th>
              <th className="bg-slate-50 p-2.5 text-left text-sm text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sectionItems.map((section, index) => (
              <tr
                key={section.name}
                onClick={() => onNavigate("section")}
                className={`
                  group cursor-pointer
                  transition-colors duration-150
                  hover:bg-primary-light
                  ${archivedSections.includes(section.name) ? "opacity-50" : ""}
                `}
              >
                <td className="relative border-b border-slate-100 p-2.5 text-slate-400">
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-transparent transition-colors duration-150 group-hover:bg-primary" />
                  {index + 1}
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500">
                  <div className="flex items-center gap-2">
                    <IconTile tone={section.tone}>
                      <BookOpen size={15} />
                    </IconTile>

                    {editingSection === section.name ? (
                      <input
                        autoFocus
                        className="rounded border border-slate-200 px-1.5 py-1 text-sm"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={(event) =>
                          event.key === "Enter" && saveSectionName(section.name)
                        }
                      />
                    ) : (
                      <b className="transition-colors duration-150 group-hover:text-primary">
                        {section.name}
                      </b>
                    )}
                  </div>
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">
                  {section.topics} topics
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">
                  ...
                </td>

                <td className="border-b border-slate-100 p-2.5 text-slate-500 text-sm">
                  ...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
