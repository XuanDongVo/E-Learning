"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileQuestion, Plus, Tags, X, Activity as ActivityIcon } from "lucide-react";
import { contentService } from "@/services/content.service";
import { activityService } from "@/services/activity.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ContentQuestionBank,
  ContentView,
  CreateQuestionBankRequest,
  UpdateStatusRequest,
  UpdateTopicRequest,
} from "@/types/content";
import type { Activity } from "@/types/activity";
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
  const [includeArchived, setIncludeArchived] = useState(false);

  const topic = useQuery({
    queryKey: QUERY_KEYS.contentTopic(topicId),
    queryFn: async () => (await contentService.getTopic(topicId)).data,
  });

  const questionBanks = useQuery({
    queryKey: [...QUERY_KEYS.contentQuestionBanks(topicId), { includeArchived }],
    queryFn: async () => (await contentService.listQuestionBanks(topicId, includeArchived)).data,
    enabled: !!topic.data,
  });
  const section = useQuery({
    queryKey: QUERY_KEYS.contentSection(topic.data?.sectionId ?? 0),
    queryFn: async () => (await contentService.getSection(topic.data!.sectionId)).data,
    enabled: Boolean(topic.data?.sectionId),
  });
  const activities = useQuery({
    queryKey: QUERY_KEYS.activities(section.data?.unitId ?? 0),
    queryFn: async () => (await activityService.list(section.data!.unitId)).data ?? [],
    enabled: Boolean(section.data?.unitId),
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
      <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <p>Could not load topic.</p>
        <button type="button" onClick={() => void topic.refetch()} className="mt-2 rounded-md border border-rose-200 px-3 py-1.5 font-semibold hover:bg-rose-100">
          Retry
        </button>
      </div>
    );

  const bankList: ContentQuestionBank[] = questionBanks.data ?? [];
  const topicActivities = (activities.data ?? []).filter((activity: Activity) =>
    activity.banks.some((bank) => bank.topicId === topicId),
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

      <section className="mt-5 overflow-hidden rounded-xl border border-border-color bg-card-bg shadow-sm">
        <div className="flex items-center justify-between border-b border-border-color px-4 py-4 sm:px-5">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Activities
            </p>
            <h2 className="mt-1 text-card-title font-bold">Activities for this topic</h2>
          </div>
          <Link
            href={section.data ? `/teacher/activities?unitId=${section.data.unitId}` : "#"}
            className="inline-flex items-center gap-1 text-body-sm font-bold text-primary"
          >
            View activities <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {activities.isLoading ? (
          <p className="p-6 text-center text-body-sm text-muted-foreground">Loading activities...</p>
        ) : topicActivities.length === 0 ? (
          <p className="p-6 text-center text-body-sm text-muted-foreground">No activities use this topic yet.</p>
        ) : (
          <div className="divide-y divide-border-color">
            {topicActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/teacher/activities/${activity.id}`}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted sm:px-5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
                  <ActivityIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold">{activity.name}</span>
                  <span className="text-body-sm text-muted-foreground">{activity.totalQuestions} questions · {activity.mode}</span>
                </span>
                <ContentStatusBadge status={activity.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

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
                <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {createBank.error instanceof Error
                    ? createBank.error.message
                    : "Could not create question bank. Please try again."}
                </p>
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
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(event) => setIncludeArchived(event.target.checked)}
                className="size-4 rounded border-slate-300 accent-primary"
              />
              Include archived
            </label>
            <span className="text-sm text-slate-400">
              {bankList.length} {bankList.length === 1 ? "bank" : "banks"}
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
        ) : questionBanks.isError ? (
          <div role="alert" className="p-6 text-center text-sm text-rose-700">
            <p>Could not load question banks.</p>
            <p className="mt-1 break-words text-xs text-rose-600">
              {questionBanks.error instanceof Error
                ? questionBanks.error.message
                : "The request failed. Check the API server and try again."}
            </p>
            <button type="button" onClick={() => void questionBanks.refetch()} className="mt-2 rounded-md border border-rose-200 px-3 py-1.5 font-semibold hover:bg-rose-50">
              Retry
            </button>
          </div>
        ) : bankList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {includeArchived
              ? "No question banks match this view."
              : <>No active question banks yet. Click <b>Add Bank</b> to create one, or include archived banks to view them.</>}
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

function ContentStatusBadge({ status }: { status: Activity["status"] }) {
  const styles = { DRAFT: "bg-warm-soft text-primary", PUBLISHED: "bg-success-soft text-success", ARCHIVED: "bg-muted text-muted-foreground" };
  return <span className={`rounded-full px-2 py-0.5 text-[0.625rem] font-bold ${styles[status]}`}>{status}</span>;
}
