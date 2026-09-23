"use client";

import { useQuery } from "@tanstack/react-query";
import { Tags } from "lucide-react";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type { ContentView } from "@/types/content";
import { EntityHeader } from "./components/entity-header";

export function TopicDetail({ topicId }: { topicId: number; onNavigate: (view: ContentView, id?: number) => void }) {
  const topic = useQuery({ queryKey: QUERY_KEYS.contentTopic(topicId), queryFn: async () => (await contentService.getTopic(topicId)).data });
  if (topic.isLoading) return <p className="text-sm text-slate-400">Loading topic...</p>;
  if (topic.isError || !topic.data) return <p className="rounded bg-rose-50 p-4 text-sm text-rose-600">Could not load topic.</p>;
  return <><EntityHeader title={topic.data.name} label="Topic" description={topic.data.description ?? "Organize question banks for this topic."} icon={<Tags size={21} />} editLabel="Edit Topic" /><section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="text-base font-bold text-slate-800">Question banks</h2><p className="mt-2 text-sm text-slate-400">Question Bank management will be connected after its server module is implemented.</p></section></>;
}
