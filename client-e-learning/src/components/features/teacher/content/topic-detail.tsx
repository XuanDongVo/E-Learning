"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileQuestion, Plus, Tags, X } from "lucide-react";
import { contentService } from "@/services/content.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentQuestionBank,
  ContentView,
  CreateQuestionBankRequest,
  UpdateStatusRequest,
  UpdateTopicRequest,
} from "@/types/content";
import { EntityHeader } from "./components/entity-header";
import { ContentEditor } from "./components/content-editor";
import { Badge } from "./components/badge";

export function TopicDetail({
  topicId,
  onNavigate,
}: {
  topicId: number;
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const client = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [createBankOpen, setCreateBankOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankDescription, setBankDescription] = useState("");

  const topic = useQuery({
    queryKey: QUERY_KEYS.contentTopic(topicId),
    queryFn: async () => (await contentService.getTopic(topicId)).data,
  });

  const questionBanks = useQuery({
    queryKey: QUERY_KEYS.contentQuestionBanks(topicId),
    queryFn: async () => (await contentService.listQuestionBanks(topicId)).data,
    enabled: !!topic.data,
  });

  const createBank = useMutation({
    mutationFn: (payload: CreateQuestionBankRequest) =>
      contentService.createQuestionBank(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: QUERY_KEYS.contentQuestionBanks(topicId) });
      setCreateBankOpen(false);
      setBankName("");
      setBankDescription("");
    },
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

  const bankList: ContentQuestionBank[] = questionBanks.data ?? [];

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

      {/* Modal create QuestionBank */}
      {createBankOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">New Question Bank</h3>
              <button
                onClick={() => setCreateBankOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!bankName.trim()) return;
                createBank.mutate({
                  topicId,
                  name: bankName.trim(),
                  description: bankDescription.trim() || undefined,
                });
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Past Simple - Basic"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Basic exercises for past simple tense..."
                  value={bankDescription}
                  onChange={(e) => setBankDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary"
                />
              </div>

              {createBank.isError && (
                <p className="text-xs text-rose-600">Failed to create question bank. Ensure name is unique.</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateBankOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBank.isPending || !bankName.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {createBank.isPending ? "Creating..." : "Create Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {bankList.length} banks
            </span>
            <button
              type="button"
              onClick={() => setCreateBankOpen(true)}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-hover"
            >
              <Plus size={14} />
              Add Bank
            </button>
          </div>
        </div>

        {questionBanks.isLoading ? (
          <div className="p-6 text-center text-sm text-slate-400">Loading banks...</div>
        ) : bankList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No question banks created yet. Click <b>Add Bank</b> to create one.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {bankList.map((bank) => (
              <li key={bank.id}>
                <button
                  type="button"
                  onClick={() => onNavigate("bank", bank.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
                    <FileQuestion size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-800">
                        {bank.name}
                      </span>
                      <Badge tone={bank.status === "PUBLISHED" ? "green" : "gray"}>
                        {bank.status}
                      </Badge>
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {bank.totalQuestions ?? 0} questions ({bank.readyQuestions ?? 0} ready) {bank.description ? `· ${bank.description}` : ""}
                    </span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
