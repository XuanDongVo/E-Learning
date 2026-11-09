"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAppErrorMessage } from "@/lib/errors/app-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileQuestion, Plus, Tags, Activity as ActivityIcon } from "lucide-react";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { FullPageState, PageBanner, RegionState } from "@/components/feedback";
import { SkeletonList } from "@/components/ui/skeleton/skeleton-list";
import { ContentBreadcrumb } from "./components/content-breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TopicDetail({
  topicId,
  onNavigate,
}: {
  topicId: number;
  onNavigate: (view: ContentView, id?: number) => void;
}) {
  const client = useQueryClient();
  const tErrors = useTranslations("errors");
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
  const unit = useQuery({
    queryKey: QUERY_KEYS.contentUnit(section.data?.unitId ?? 0),
    queryFn: async () =>
      (await contentService.getUnit(section.data!.unitId)).data,
    enabled: Boolean(section.data?.unitId),
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

  if (topic.isLoading) return <FullPageState variant="loading" />;
  if (topic.isError || !topic.data)
    return <FullPageState variant="error" action={<button type="button" onClick={() => void topic.refetch()}>{tErrors("retry")}</button>} />;
  if (section.isLoading || unit.isLoading)
    return <FullPageState variant="loading" />;
  if (section.isError || !section.data || unit.isError || !unit.data)
    return (
      <FullPageState
        variant="error"
        action={
          <button
            type="button"
            onClick={() => {
              if (section.isError || !section.data) void section.refetch();
              if (unit.isError || !unit.data) void unit.refetch();
            }}
          >
            {tErrors("retry")}
          </button>
        }
      />
    );

  const bankList: ContentQuestionBank[] = questionBanks.data ?? [];
  const topicActivities = (activities.data ?? []).filter((activity: Activity) =>
    activity.banks.some((bank) => bank.topicId === topicId),
  );
  const pageMutationError = update.error ?? status.error ?? archive.error;

  return (
    <>
      <ContentBreadcrumb
        items={[
          { label: "Content" },
          { label: "Units", href: "/teacher/content" },
          {
            label: `${unit.data.code} - ${unit.data.name}`,
            href: `/teacher/content/units/${unit.data.id}`,
          },
          {
            label: section.data.name,
            href: `/teacher/content/sections/${section.data.id}`,
          },
          { label: topic.data.name },
        ]}
      />
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
        context={
          <Link
            href={`/teacher/content/sections/${section.data.id}`}
            className="rounded hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Section: {section.data.name}
          </Link>
        }
      />

      {pageMutationError && (
        <PageBanner
          tone="error"
          className="mt-4"
          title="Could not save changes"
          message={
            pageMutationError instanceof Error
              ? pageMutationError.message
              : "Check the data and try again."
          }
          onDismiss={() => {
            update.reset();
            status.reset();
            archive.reset();
          }}
        />
      )}

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

      <section className="mt-5 border-y border-border py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <ActivityIcon className="size-4" />
            </span>
            <div>
              <h2 className="text-card-title font-bold text-foreground">
                Related activities
              </h2>
              {activities.isLoading ? (
                <p className="mt-1 text-body-sm text-muted-foreground">
                  Checking activity references…
                </p>
              ) : activities.isError ? (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-destructive">
                  <span>Activity references could not be loaded.</span>
                  <button
                    type="button"
                    onClick={() => void activities.refetch()}
                    className="font-semibold underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {topicActivities.length === 0
                    ? "No non-archived activities currently use a Question Bank from this topic."
                    : `${topicActivities.length} non-archived ${topicActivities.length === 1 ? "activity uses" : "activities use"} a Question Bank from this topic.`}
                </p>
              )}
              <p className="mt-1 text-body-sm text-muted-foreground">
                The Activities page opens with this Unit selected; Topic filtering is not available.
              </p>
            </div>
          </div>
          <Link
            href={`/teacher/activities?unitId=${section.data.unitId}`}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Open Unit activities <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <Dialog open={createBankOpen} onOpenChange={setCreateBankOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-card-title font-bold text-foreground">
              New Question Bank
            </DialogTitle>
            <DialogDescription>
              Create a bank inside {topic.data.name}. You can add questions after creating it.
            </DialogDescription>
          </DialogHeader>
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
              className="space-y-4"
            >
              <div>
                <label className="block text-label font-semibold text-foreground">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Past Simple - Basic"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-label font-semibold text-foreground">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Basic exercises for past simple tense..."
                  value={bankDescription}
                  onChange={(e) => setBankDescription(e.target.value)}
                  className="mt-1 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-body-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {createBank.isError && (
                <PageBanner
                  tone="error"
                  message={getAppErrorMessage(createBank.error, tErrors as (key: string) => string)}
                />
              )}

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setCreateBankOpen(false)}
                  className="min-h-10 rounded-lg border border-border bg-card px-4 py-2 text-body-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBank.isPending || !bankName.trim()}
                  className="min-h-10 rounded-lg bg-primary px-4 py-2 text-body-sm font-bold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                >
                  {createBank.isPending ? "Creating..." : "Create Bank"}
                </button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <section className="mt-5 overflow-hidden border-2 border-ink bg-card rounded-lg shadow-pop">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-label font-semibold text-primary">
              Question banks
            </p>
            <h2 className="mt-1 text-section-title font-bold text-foreground">
              Banks for this topic
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-10 items-center gap-2 text-body-sm text-foreground">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(event) => setIncludeArchived(event.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              Include archived
            </label>
            <span className="text-body-sm text-muted-foreground">
              {bankList.length} {bankList.length === 1 ? "bank" : "banks"}
            </span>
            <button
              type="button"
              onClick={() => setCreateBankOpen(true)}
              className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-body-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus size={14} />
              Add Bank
            </button>
          </div>
        </div>

        {questionBanks.isLoading ? (
          <SkeletonList count={4} className="p-4" />
        ) : questionBanks.isError ? (
          <RegionState
            variant="error"
            description={getAppErrorMessage(questionBanks.error, tErrors as (key: string) => string)}
            action={<button type="button" onClick={() => void questionBanks.refetch()} className="min-h-10 rounded-lg border border-border px-3 py-2 font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Retry</button>}
          />
        ) : bankList.length === 0 ? (
          <div className="p-8 text-center text-body-sm text-muted-foreground">
            {includeArchived
              ? "No question banks match this view."
              : <>No active question banks yet. Click <b>Add Bank</b> to create one, or include archived banks to view them.</>}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {bankList.map((bank) => (
              <li key={bank.id}>
                <button
                  type="button"
                  onClick={() => onNavigate("bank", bank.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
                    <FileQuestion size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-body font-semibold text-foreground">
                        {bank.name}
                      </span>
                      <StatusBadge status={bank.status} label={bank.status} />
                    </span>
                    <span className="mt-1 block text-body-sm text-muted-foreground">
                      {bank.totalQuestions ?? 0} questions ({bank.readyQuestions ?? 0} ready) {bank.description ? `· ${bank.description}` : ""}
                    </span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
