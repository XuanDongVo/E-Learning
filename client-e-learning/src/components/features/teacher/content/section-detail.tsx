"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Tags } from "lucide-react";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { ContentView, CreateTopicRequest } from "@/types/content";
import { EntityHeader } from "./components/entity-header";
import { TableTitle } from "./components/table-title";
import { Badge } from "./components/badge";

export function SectionDetail({ sectionId, onNavigate }: { sectionId: number; onNavigate: (view: ContentView, id?: number) => void }) {
  const client = useQueryClient(); const [formOpen, setFormOpen] = useState(false); const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const section = useQuery({ queryKey: QUERY_KEYS.contentSection(sectionId), queryFn: async () => (await contentService.getSection(sectionId)).data });
  const topics = useQuery({ queryKey: QUERY_KEYS.contentTopics(sectionId), queryFn: async () => (await contentService.listTopics(sectionId)).data });
  const create = useMutation({ mutationFn: contentService.createTopic, onSuccess: () => { client.invalidateQueries({ queryKey: QUERY_KEYS.contentTopics(sectionId) }); setFormOpen(false); setName(""); setDescription(""); } });
  const archive = useMutation({ mutationFn: contentService.archiveTopic, onSuccess: () => client.invalidateQueries({ queryKey: QUERY_KEYS.contentTopics(sectionId) }) });
  if (section.isLoading) return <p className="text-sm text-slate-400">Loading section...</p>;
  if (section.isError || !section.data) return <p className="rounded bg-rose-50 p-4 text-sm text-rose-600">Could not load section.</p>;
  return <><EntityHeader title={section.data.name} label="Section" description={section.data.description ?? "Organize topics in this section."} icon={<Tags size={21} />} editLabel="Edit Section" /><section className="rounded-lg border border-slate-200 bg-white p-4"><TableTitle title="Topics" count={topics.data?.length ?? 0} action="Add Topic" onAction={() => setFormOpen(true)} />{formOpen && <form className="mb-4 flex flex-wrap gap-2 rounded bg-primary-light p-3" onSubmit={(event) => { event.preventDefault(); const payload: CreateTopicRequest = { sectionId, name, description }; create.mutate(payload); }}><input required autoFocus placeholder="Topic name" value={name} onChange={(event) => setName(event.target.value)} className="min-w-[180px] flex-1 rounded border px-2 py-2 text-sm" /><input placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-w-[220px] flex-1 rounded border px-2 py-2 text-sm" /><button disabled={create.isPending} className="rounded bg-primary px-3 py-2 text-sm text-white">{create.isPending ? "Saving..." : "Save"}</button><button type="button" onClick={() => setFormOpen(false)} className="rounded border bg-white px-3 py-2 text-sm">Cancel</button></form>}<div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead><tr className="bg-slate-50 text-left text-slate-500"><th className="p-2.5">#</th><th className="p-2.5">Topic</th><th className="p-2.5">Question banks</th><th className="p-2.5">Status</th><th className="p-2.5">Actions</th></tr></thead><tbody>{topics.data?.map((topic, index) => <tr key={topic.id} className="border-b border-slate-100"><td className="p-2.5 text-slate-400">{index + 1}</td><td className="p-2.5"><button className="font-semibold hover:text-primary" onClick={() => onNavigate("topic", topic.id)}>{topic.name}</button></td><td className="p-2.5 text-slate-500">{topic.totalQuestionBank}</td><td className="p-2.5"><Badge>{topic.status}</Badge></td><td className="p-2.5"><div className="flex gap-1"><button disabled={index === 0} aria-label="Move up" className="rounded border p-1 disabled:opacity-30"><ArrowUp size={14} /></button><button disabled={index === (topics.data?.length ?? 0) - 1} aria-label="Move down" className="rounded border p-1 disabled:opacity-30"><ArrowDown size={14} /></button><button onClick={() => archive.mutate(topic.id)} className="rounded border px-2 py-1 text-xs text-rose-500">Archive</button></div></td></tr>)}</tbody></table></div></section></>;
}
