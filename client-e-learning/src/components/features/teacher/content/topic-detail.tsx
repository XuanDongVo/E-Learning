"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tags } from "lucide-react";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentView,
  UpdateStatusRequest,
  UpdateTopicRequest,
} from "@/types/content";
import { EntityHeader } from "./components/entity-header";
import { ContentEditor } from "./components/content-editor";

export function TopicDetail({
  topicId,
}: {
  topicId: number;
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const client = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const topic = useQuery({
    queryKey: QUERY_KEYS.contentTopic(topicId),
    queryFn: async () => (await contentService.getTopic(topicId)).data,
  });
  const update = useMutation({
    mutationFn: (payload: UpdateTopicRequest) =>
      contentService.updateTopic(topicId, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: QUERY_KEYS.contentTopic(topicId) });
      setEditOpen(false);
    },
  });
  const status = useMutation({
    mutationFn: (payload: UpdateStatusRequest) =>
      contentService.updateTopicStatus(topicId, payload),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: QUERY_KEYS.contentTopic(topicId) }),
  });
  const archive = useMutation({
    mutationFn: () => contentService.archiveTopic(topicId),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: QUERY_KEYS.contentTopic(topicId) }),
  });
  if (topic.isLoading)
    return <p className="text-sm text-slate-400">Loading topic...</p>;
  if (topic.isError || !topic.data)
    return (
      <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
        Could not load topic.
      </p>
    );
  return (
    <>
      <EntityHeader
        title={topic.data.name}
        label="Topic"
        status={topic.data.status}
        description={
          topic.data.description ?? "Organize question banks for this topic."
        }
        icon={<Tags size={21} />}
        editLabel="Edit Topic"
        onEdit={() => setEditOpen((open) => !open)}
        onStatusChange={(nextStatus) => status.mutate({ status: nextStatus })}
        onArchive={() => archive.mutate()}
        actionPending={status.isPending || archive.isPending}
      />
      {editOpen && (
        <ContentEditor
          kind="topic"
          initial={topic.data}
          onSubmit={(payload) => update.mutate(payload as UpdateTopicRequest)}
          onCancel={() => setEditOpen(false)}
          pending={update.isPending}
          error={update.isError ? "Could not save changes." : undefined}
        />
      )}
      <section className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Question banks
        </p>
        <h2 className="mt-2 text-lg font-bold text-slate-800">
          Build question banks for this topic
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Question bank management willTopics appear here when its server module is
          connected.
        </p>
      </section>
    </>
  );
}
