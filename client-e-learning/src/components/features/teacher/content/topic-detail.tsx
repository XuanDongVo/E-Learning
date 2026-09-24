"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileQuestion, Tags } from "lucide-react";
import { contentQuestionBanks } from "@/mock/content";
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
  onNavigate,
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
      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(94,134,173,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Question banks
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-800">
              Banks for this topic
            </h2>
          </div>
          <span className="text-sm text-slate-400">
            {contentQuestionBanks.length} banks
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {contentQuestionBanks.map((bank, index) => (
            <li key={bank.name}>
              <button
                type="button"
                onClick={() => onNavigate("bank", index + 1)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
                  <FileQuestion size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {bank.name}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {bank.questions} questions · {bank.difficulty} · {bank.type}
                  </span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
