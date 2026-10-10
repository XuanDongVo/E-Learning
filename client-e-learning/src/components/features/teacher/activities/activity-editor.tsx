"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Info,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activityService } from "@/services/activity.service";
import { unitService } from "@/services/content/content.unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ActivityMode,
  ActivityDifficulty,
  ActivitySourceOption,
  DistributionMode,
  SelectionStrategy,
  ActivityBankRequest,
} from "@/types/activity";

type SelectedBank = ActivitySourceOption & {
  displayOrder: number;
  percentage?: number;
  fixedCount?: number;
};

const strategies: {
  value: SelectionStrategy;
  label: string;
  description: string;
}[] = [
  {
    value: "RANDOM",
    label: "Random",
    description: "Choose randomly inside each bank quota.",
  },
  {
    value: "WEAKNESS_PRIORITY",
    label: "Weakness priority",
    description: "Prioritize weaker areas when answer history exists.",
  },
];

const modes: { value: ActivityMode; label: string; description: string }[] = [
  {
    value: "LEARNING",
    label: "Practice",
    description: "No timer, immediate feedback, 1 retry and optional hint.",
  },
  {
    value: "TRY_HARD",
    label: "Try Hard",
    description: "Seconds per question, lives, no retry and no hint.",
  },
  {
    value: "BOTH",
    label: "Both",
    description: "Student chooses Practice or Try Hard at start.",
  },
];

const distributions: {
  value: DistributionMode;
  label: string;
  description: string;
}[] = [
  {
    value: "EQUAL",
    label: "Equal",
    description: "Every bank gets the same number of questions.",
  },
  {
    value: "PERCENTAGE",
    label: "Percentage",
    description: "Set a share per bank. Must total 100%.",
  },
  {
    value: "FIXED_COUNT",
    label: "Fixed count",
    description: "Set an exact number per bank.",
  },
];

const btnPrimary =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-body font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";

export function ActivityEditor({ activityId }: { activityId?: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const requestedUnitId = Number(params.get("unitId") || 0);

  const existing = useQuery({
    queryKey: QUERY_KEYS.activity(activityId || 0),
    queryFn: async () => (await activityService.get(activityId!)).data,
    enabled: !!activityId,
  });
  const unitId = existing.data?.unitId || requestedUnitId;
  const unit = useQuery({
    queryKey: QUERY_KEYS.contentUnit(unitId),
    queryFn: async () => (await unitService.get(unitId)).data,
    enabled: !!unitId,
  });
  const sources = useQuery({
    queryKey: QUERY_KEYS.activitySources(unitId),
    queryFn: async () => (await activityService.sources(unitId)).data || [],
    enabled: !!unitId,
  });

  const [initialized, setInitialized] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [distribution, setDistribution] = useState<DistributionMode>("EQUAL");
  const [total, setTotal] = useState(10);
  const [questionDifficulty, setQuestionDifficulty] = useState<ActivityDifficulty>("MIXED");
  const [availableSelectionStrategies, setAvailableSelectionStrategies] =
    useState<SelectionStrategy[]>(["RANDOM"]);
  const [mode, setMode] = useState<ActivityMode>("BOTH");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | undefined>(
    60,
  );
  const [lives, setLives] = useState<number | undefined>(3);
  const [banks, setBanks] = useState<SelectedBank[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!existing.data || initialized) return;
    const a = existing.data;
    setInitialized(true);
    setName(a.name);
    setDescription(a.description || "");
    setDistribution(a.distributionMode);
    setTotal(a.totalQuestions);
    setQuestionDifficulty(a.questionDifficulty ?? "MIXED");
    setAvailableSelectionStrategies(a.availableSelectionStrategies);
    setMode(a.mode);
    setTimeLimitSeconds(
      a.mode === "LEARNING" ? undefined : a.timeLimitSeconds || 60,
    );
    setLives(a.mode === "LEARNING" ? undefined : a.lives || 3);
    setBanks(
      a.banks.map((b) => ({
        ...b,
        status: "PUBLISHED",
        percentage: b.percentage ?? undefined,
        fixedCount: b.fixedCount ?? undefined,
      })),
    );
  }, [existing.data, initialized]);

  const selected = useMemo(
    () => new Set(banks.map((b) => b.questionBankId)),
    [banks],
  );

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sections = new Map<string, Map<string, ActivitySourceOption[]>>();
    for (const source of sources.data || []) {
      if (source.status === "ARCHIVED") continue;
      if (
        q &&
        !`${source.questionBankName} ${source.topicName} ${source.sectionName}`
          .toLowerCase()
          .includes(q)
      )
        continue;
      if (!sections.has(source.sectionName))
        sections.set(source.sectionName, new Map());
      const topics = sections.get(source.sectionName)!;
      if (!topics.has(source.topicName)) topics.set(source.topicName, []);
      topics.get(source.topicName)!.push(source);
    }
    return [...sections.entries()];
  }, [sources.data, search]);

  const allocation = useMemo(() => {
    if (!banks.length) return [];
    if (distribution === "FIXED_COUNT")
      return banks.map((b) => ({
        id: b.questionBankId,
        count: b.fixedCount || 0,
      }));
    if (distribution === "EQUAL") {
      const each = Math.floor(total / banks.length);
      return banks.map((b) => ({ id: b.questionBankId, count: each }));
    }
    const base = banks.map((b) => {
      const exact = (total * (b.percentage || 0)) / 100;
      return {
        id: b.questionBankId,
        floor: Math.floor(exact),
        fraction: exact - Math.floor(exact),
      };
    });
    let remaining = total - base.reduce((s, x) => s + x.floor, 0);
    const extras = new Set(
      base
        .sort((a, b) => b.fraction - a.fraction || a.id - b.id)
        .slice(0, remaining)
        .map((x) => x.id),
    );
    return base.map((x) => ({
      id: x.id,
      count: x.floor + (extras.has(x.id) ? 1 : 0),
    }));
  }, [banks, distribution, total]);

  const difficultyLabel: Record<ActivityDifficulty, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
    MIXED: "Mixed",
  };
  const difficultyCounts = (source: ActivitySourceOption) => ({
    EASY: source.easyReadyQuestions,
    MEDIUM: source.mediumReadyQuestions,
    HARD: source.hardReadyQuestions,
    MIXED: source.easyReadyQuestions + source.mediumReadyQuestions + source.hardReadyQuestions,
  });
  const sourceForBank = (questionBankId: number) =>
    (sources.data || []).find((source) => source.questionBankId === questionBankId);
  const selectedDifficultyTotal = (bank: { questionBankId: number }) => {
    const source = sourceForBank(bank.questionBankId);
    return source ? difficultyCounts(source)[questionDifficulty] : 0;
  };
  const selectedBanksAvailability = banks.map((bank) => {
    const required = allocation.find((item) => item.id === bank.questionBankId)?.count ?? 0;
    const available = selectedDifficultyTotal(bank);
    return { ...bank, required, available, enough: available >= required };
  });
  const insufficientBanks = selectedBanksAvailability.filter(
    (bank) => bank.required > 0 && !bank.enough,
  );

  const allocationById = useMemo(
    () => new Map(allocation.map((x) => [x.id, x.count])),
    [allocation],
  );
  const allocationTotal = allocation.reduce((s, x) => s + x.count, 0);
  const percentageTotal = banks.reduce((s, b) => s + (b.percentage || 0), 0);
  const fixedTotal = banks.reduce((s, b) => s + (b.fixedCount || 0), 0);
  const distributionError = !banks.length
    ? "Select at least one Question Bank."
    : distribution === "EQUAL" && total % banks.length !== 0
      ? "Equal distribution must divide evenly."
      : distribution === "PERCENTAGE" &&
          (percentageTotal !== 100 ||
            banks.some((b) => !b.percentage || b.percentage < 1))
        ? "Percentages must be positive and total exactly 100%."
        : distribution === "FIXED_COUNT" &&
            (fixedTotal !== total ||
              banks.some((b) => !b.fixedCount || b.fixedCount < 1))
          ? "Fixed counts must be positive and add up to the total."
          : "";
  const formError = !unitId
    ? "A Unit is required."
    : !name.trim()
      ? "Activity name is required."
      : !availableSelectionStrategies.length
        ? "Select at least one practice option."
        : distributionError;

  const save = useMutation({
    mutationFn: async () => {
      if (formError) throw new Error(formError);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        distributionMode: distribution,
        totalQuestions: total,
        questionDifficulty,
        availableSelectionStrategies,
        mode,
        timeLimitSeconds: mode === "LEARNING" ? undefined : timeLimitSeconds,
        lives: mode === "LEARNING" ? undefined : lives,
        banks: banks.map(
          (b): ActivityBankRequest => ({
            questionBankId: b.questionBankId,
            displayOrder: b.displayOrder,
            ...(distribution === "PERCENTAGE"
              ? { percentage: b.percentage }
              : {}),
            ...(distribution === "FIXED_COUNT"
              ? { fixedCount: b.fixedCount }
              : {}),
          }),
        ),
      };
      return activityId
        ? activityService.update(activityId, payload)
        : activityService.create({ unitId: unitId!, ...payload });
    },
    onSuccess: async (r) => {
      if (!r.data) return;
      await qc.invalidateQueries({
        queryKey: QUERY_KEYS.activities(r.data.unitId),
      });
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.activity(r.data.id) });
      toast.success(
        activityId ? "Activity updated" : "Activity saved as draft",
      );
      router.push(`/teacher/activities/${r.data.id}`);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save activity"),
  });

  const toggleBank = (source: ActivitySourceOption) =>
    setBanks((cur) => {
      const exists = cur.some(
        (b) => b.questionBankId === source.questionBankId,
      );
      const next = exists
        ? cur.filter((b) => b.questionBankId !== source.questionBankId)
        : [
            ...cur,
            {
              ...source,
              displayOrder: cur.length,
              ...(distribution === "PERCENTAGE" ? { percentage: 0 } : {}),
              ...(distribution === "FIXED_COUNT" ? { fixedCount: 1 } : {}),
            },
          ];

      if (distribution === "FIXED_COUNT") {
        setTotal(next.reduce((sum, bank) => sum + (bank.fixedCount || 0), 0));
      }

      return next;
    });

  const changeDistribution = (next: DistributionMode) => {
    setDistribution(next);
    if (next === "EQUAL")
      setBanks((cur) =>
        cur.map((b) => ({
          ...b,
          percentage: undefined,
          fixedCount: undefined,
        })),
      );
    if (next === "PERCENTAGE")
      setBanks((cur) =>
        cur.map((b, i) => ({
          ...b,
          percentage: cur.length === 1 ? 100 : i === 0 ? 0 : undefined,
          fixedCount: undefined,
        })),
      );
    if (next === "FIXED_COUNT")
      setBanks((cur) => {
        const nextBanks = cur.map((b) => ({
          ...b,
          percentage: undefined,
          fixedCount: b.fixedCount && b.fixedCount > 0 ? b.fixedCount : 1,
        }));
        setTotal(nextBanks.reduce((s, b) => s + (b.fixedCount || 0), 0));
        return nextBanks;
      });
  };

  const changeMode = (next: ActivityMode) => {
    setMode(next);
    if (next === "LEARNING") {
      setTimeLimitSeconds(undefined);
      setLives(undefined);
    } else {
      setTimeLimitSeconds((v) => v || 60);
      setLives((v) => v || 3);
    }
  };

  const saveLabel = save.isPending
    ? "Saving…"
    : activityId
      ? "Save changes"
      : "Save draft";
  const allocationPct =
    total > 0 ? Math.min(100, Math.round((allocationTotal / total) * 100)) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* ───────── Header ───────── */}
      <header className="rounded-xl border border-border-color bg-card-bg p-5 shadow-sm">
        <Link
          href={
            activityId
              ? `/teacher/activities/${activityId}`
              : `/teacher/activities?unitId=${unitId || ""}`
          }
          className="inline-flex items-center gap-1 text-body-sm font-semibold text-neutral-muted hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {activityId ? "Back to activity" : "Activities"}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-page-title font-extrabold">
              {activityId ? "Edit activity" : "New activity"}
            </h1>
            <p className="mt-1 text-body text-neutral-muted">
              {unit.data?.code ? `${unit.data.code} · ` : ""}
              Saving keeps it as a draft until you publish.
            </p>
          </div>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending || !!formError}
            title={formError || undefined}
            className={btnPrimary}
          >
            {saveLabel}
          </button>
        </div>
      </header>

      {existing.isError && (
        <div className="rounded-xl border border-danger-light bg-danger-light p-4 text-body text-danger-text">
          Could not load this Activity.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-6">
          {/* Details */}
          <EditorSection title="Activity details">
            <Field label="Activity name">
              <input
                value={name}
                maxLength={150}
                onChange={(e) => setName(e.target.value)}
                className={inputClass()}
                placeholder="e.g. Unit 1 Grammar Practice"
              />
            </Field>
            <Field
              label="Description"
              hint="Optional. Keep it to one short sentence."
            >
              <textarea
                value={description}
                maxLength={1000}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass() + " min-h-24 py-2"}
                placeholder="What should students practice?"
              />
            </Field>
          </EditorSection>

          {/* Question difficulty */}
          <EditorSection
            title="Question difficulty"
            description="Students will see this level before starting. Only questions matching this setting are selected; Mixed allows all three levels."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                { value: "EASY", label: "Easy", description: "Beginner-friendly questions." },
                { value: "MEDIUM", label: "Medium", description: "Questions with moderate challenge." },
                { value: "HARD", label: "Hard", description: "More challenging questions." },
                { value: "MIXED", label: "Mixed", description: "Use Easy, Medium and Hard questions." },
              ] as const).map((option) => (
                <OptionCard
                  key={option.value}
                  on={questionDifficulty === option.value}
                  onClick={() => setQuestionDifficulty(option.value)}
                  title={option.label}
                  description={option.description}
                />
              ))}
            </div>
          </EditorSection>

          {/* Question Banks */}
          <EditorSection
            title="Question Banks"
            description="Only Question Banks from this Unit can be selected."
            aside={
              <span className="rounded-full bg-background-app px-2.5 py-1 text-body-sm font-semibold tabular-nums">
                {banks.length} selected
              </span>
            }
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-muted"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by bank, topic or section"
                aria-label="Search Question Banks"
                className="h-10 w-full rounded-lg border border-border-input bg-card-bg pl-9 pr-3 text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {sources.isLoading ? (
              <p className="text-body text-neutral-muted">
                Loading Question Banks…
              </p>
            ) : sources.isError ? (
              <div className="rounded-lg border-l-4 border-danger bg-background-app p-4 text-body text-danger-text">
                Could not load Question Banks.
              </div>
            ) : grouped.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-color p-6 text-center text-body text-neutral-muted">
                {search
                  ? "No Question Banks match your search."
                  : "No Question Banks are available in this Unit."}
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border-color">
                {grouped.map(([section, topics]) => (
                  <div key={section} className="border-b border-border-color last:border-b-0">
                    <div className="bg-background-app px-4 py-2.5 text-body font-semibold">
                      {section}
                    </div>
                    {[...topics.entries()].map(([topic, list]) => (
                      <div key={topic}>
                        <div className="px-4 pb-1 pt-3 text-body-sm font-semibold text-neutral-muted">
                          {topic}
                        </div>
                        {list.map((source) => {
                          const on = selected.has(source.questionBankId);
                          const available = selectedDifficultyTotal(source);
                          const noneReady = available === 0;
                          return (
                            <button
                              key={source.questionBankId}
                              type="button"
                              disabled={source.status === "ARCHIVED"}
                              onClick={() => toggleBank(source)}
                              aria-pressed={on}
                              className={`flex min-h-14 w-full items-center gap-3 border-t border-border-color px-4 py-3 text-left transition-colors first:border-t-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${on ? "bg-primary-light" : "hover:bg-background-app"}`}
                            >
                              <Checkbox on={on} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-body font-semibold">
                                  {source.questionBankName}
                                </span>
                                <span className="mt-0.5 block text-body-sm text-neutral-muted">
                                  {source.status === "PUBLISHED"
                                    ? "Published"
                                    : "Draft"}
                                </span>
                              </span>
                              <span
                                className={`shrink-0 rounded-full border border-border-color px-2.5 py-1 text-body-sm font-semibold tabular-nums ${noneReady ? "text-accent-text" : "text-neutral-muted"}`}
                              >
                                {available}{" "}
                                {difficultyLabel[questionDifficulty].toLowerCase()} ready
                                <span className="ml-1 text-neutral-muted">({source.readyQuestions} complete total)</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </EditorSection>

          <EditorSection
            title="Question availability"
            description="Counts update immediately when you change difficulty or question allocation. Only complete questions are counted."
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {([
                { value: "EASY", label: "Easy" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HARD", label: "Hard" },
                { value: "MIXED", label: "Mixed" },
              ] as const).map((option) => {
                const count = banks.reduce((sum, bank) => {
                  const source = sourceForBank(bank.questionBankId);
                  return sum + (source ? difficultyCounts(source)[option.value] : 0);
                }, 0);
                return (
                  <div key={option.value} className="rounded-lg border border-border-color p-3">
                    <p className="text-body-sm text-neutral-muted">{option.label}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{sources.isLoading ? "—" : count}</p>
                    <p className="text-body-sm text-neutral-muted">ready in selected banks</p>
                  </div>
                );
              })}
            </div>
            {banks.length === 0 ? (
              <p className="text-body-sm text-neutral-muted">Select one or more Question Banks to see availability by difficulty.</p>
            ) : sources.isLoading ? (\n              <p className="text-body-sm text-neutral-muted">Loading question availability…</p>\n            ) : insufficientBanks.length > 0 ? (
              <div role="alert" className="rounded-lg border-l-4 border-danger bg-background-app p-3 text-body-sm text-danger-text">
                <p className="font-semibold">Not enough {difficultyLabel[questionDifficulty].toLowerCase()} questions</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {insufficientBanks.map((bank) => (
                    <li key={bank.questionBankId}>
                      {bank.questionBankName}: {bank.available} available, {bank.required} required
                      {bank.status !== "PUBLISHED" ? " · Question Bank is not published" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-body-sm font-semibold text-success">Enough questions are available for the current selection.</p>
            )}
          </EditorSection>

          {/* Question set */}
          <EditorSection
            title="Question set"
            description="Distribution controls how many questions come from each selected Question Bank."
          >
            <div className="grid gap-5 md:grid-cols-[11rem_1fr]">
              <Field
                label="Total questions"
                hint={
                  distribution === "FIXED_COUNT"
                    ? "Calculated from fixed counts."
                    : "Per Activity run."
                }
              >
                <input
                  type="number"
                  min={distribution === "FIXED_COUNT" ? 0 : 1}
                  value={total}
                  readOnly={distribution === "FIXED_COUNT"}
                  onChange={(e) =>
                    distribution !== "FIXED_COUNT" &&
                    setTotal(Math.max(1, Number(e.target.value)))
                  }
                  className={
                    inputClass() +
                    (distribution === "FIXED_COUNT"
                      ? " bg-background-app text-neutral-muted"
                      : "")
                  }
                />
              </Field>
              <div>
                <p className="text-body font-semibold">Distribution</p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {distributions.map((d) => (
                    <OptionCard
                      key={d.value}
                      on={distribution === d.value}
                      onClick={() => changeDistribution(d.value)}
                      title={d.label}
                      description={d.description}
                    />
                  ))}
                </div>
              </div>
            </div>

            {banks.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border-color">
                <div className="grid grid-cols-[1fr_6rem_7rem] gap-3 bg-background-app px-4 py-2 text-label font-semibold text-neutral-muted">
                  <span>Question Bank</span>
                  <span className="text-right">Gets</span>
                  <span className="text-right">
                    {distribution === "PERCENTAGE"
                      ? "Percentage"
                      : distribution === "FIXED_COUNT"
                        ? "Questions"
                        : ""}
                  </span>
                </div>
                {banks.map((b) => {
                  const count = allocationById.get(b.questionBankId) ?? 0;
                  const over = count > b.readyQuestions;
                  return (
                    <div
                      key={b.questionBankId}
                      className="grid grid-cols-[1fr_6rem_7rem] items-center gap-3 border-t border-border-color px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-body font-semibold">
                          {b.questionBankName}
                        </p>
                        {over && (
                          <p className="text-body-sm text-accent-text">
                            Only {b.readyQuestions} ready right now
                          </p>
                        )}
                      </div>
                      <span className="text-right text-body font-semibold tabular-nums">
                        {count}
                      </span>
                      {distribution === "EQUAL" ? (
                        <span />
                      ) : (
                        <input
                          type="number"
                          min={1}
                          max={distribution === "PERCENTAGE" ? 100 : undefined}
                          aria-label={`${distribution === "PERCENTAGE" ? "Percentage" : "Question count"} for ${b.questionBankName}`}
                          value={
                            distribution === "PERCENTAGE"
                              ? (b.percentage ?? "")
                              : (b.fixedCount ?? "")
                          }
                          onChange={(e) => {
                            const value = Math.max(1, Number(e.target.value));
                            setBanks((cur) =>
                              cur.map((x) =>
                                x.questionBankId === b.questionBankId
                                  ? {
                                      ...x,
                                      ...(distribution === "PERCENTAGE"
                                        ? { percentage: value }
                                        : { fixedCount: value }),
                                    }
                                  : x,
                              ),
                            );
                            if (distribution === "FIXED_COUNT") {
                              setTotal(
                                banks.reduce(
                                  (sum, bank) =>
                                    sum +
                                    (bank.questionBankId === b.questionBankId
                                      ? value
                                      : bank.fixedCount || 0),
                                  0,
                                ),
                              );
                            }
                          }}
                          className={
                            inputClass().replace("mt-2 ", "") + " text-right"
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div
              className={`rounded-lg border-l-4 bg-background-app p-3 ${distributionError ? "border-accent text-accent-text" : "border-success text-success"}`}
            >
              <div className="flex items-start gap-2 text-body-sm">
                {distributionError ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                )}
                <p className="font-semibold">
                  {distributionError ||
                    `Allocated ${allocationTotal} / ${total} questions.`}
                </p>
              </div>
              {banks.length > 0 && (
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-bg"
                  role="progressbar"
                  aria-valuenow={allocationTotal}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-label="Questions allocated"
                >
                  <div
                    className={`h-full rounded-full ${distributionError ? "bg-accent" : "bg-success"}`}
                    style={{ width: `${allocationPct}%` }}
                  />
                </div>
              )}
            </div>
          </EditorSection>

          {/* Practice options */}
          <EditorSection
            title="Practice options"
            description="Students can choose one of the enabled selection strategies when more than one is allowed."
          >
            <div className="grid gap-2 md:grid-cols-2">
              {strategies.map((o) => {
                const on = availableSelectionStrategies.includes(o.value);
                return (
                  <OptionCard
                    key={o.value}
                    on={on}
                    checkbox
                    onClick={() =>
                      setAvailableSelectionStrategies((cur) =>
                        on
                          ? cur.filter((x) => x !== o.value)
                          : [...cur, o.value],
                      )
                    }
                    title={o.label}
                    description={o.description}
                  />
                );
              })}
            </div>
          </EditorSection>

          {/* Student mode */}
          <EditorSection
            title="Student mode"
            description="Practice has no timer. Try Hard uses a separate timer for each question."
          >
            <div className="grid gap-2 md:grid-cols-3">
              {modes.map((o) => (
                <OptionCard
                  key={o.value}
                  on={mode === o.value}
                  onClick={() => changeMode(o.value)}
                  title={o.label}
                  description={o.description}
                />
              ))}
            </div>
            {mode !== "LEARNING" && (
              <div className="grid gap-4 rounded-lg bg-background-app p-4 md:grid-cols-2">
                <Field
                  label="Time limit (seconds per question)"
                  hint="Used for each Try Hard question, not the whole Activity."
                >
                  <input
                    type="number"
                    min={1}
                    value={timeLimitSeconds ?? ""}
                    onChange={(e) =>
                      setTimeLimitSeconds(Math.max(1, Number(e.target.value)))
                    }
                    className={inputClass()}
                  />
                </Field>
                <Field label="Lives" hint="Used only in Try Hard.">
                  <input
                    type="number"
                    min={1}
                    value={lives ?? ""}
                    onChange={(e) =>
                      setLives(Math.max(1, Number(e.target.value)))
                    }
                    className={inputClass()}
                  />
                </Field>
              </div>
            )}
          </EditorSection>
        </main>

        {/* ───────── Summary ───────── */}
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-xl border border-border-color bg-card-bg p-5">
            <h2 className="text-card-title font-semibold">
              Configuration summary
            </h2>
            <dl className="mt-4 divide-y divide-border-color text-body-sm">
              <Row label="Unit" value={unit.data?.code || "—"} />
              <Row label="Question Banks" value={String(banks.length)} />
              <Row label="Questions" value={String(total)} />
              <Row label="Difficulty" value={{ EASY: "Easy", MEDIUM: "Medium", HARD: "Hard", MIXED: "Mixed" }[questionDifficulty]} />
              <Row
                label="Distribution"
                value={
                  distributions.find((x) => x.value === distribution)?.label ||
                  distribution
                }
              />
              <Row
                label="Practice options"
                value={String(availableSelectionStrategies.length)}
              />
              <Row
                label="Mode"
                value={modes.find((x) => x.value === mode)?.label || mode}
              />
            </dl>

            {formError ? (
              <div
                role="alert"
                className="mt-4 flex gap-2 rounded-lg border-l-4 border-accent bg-background-app p-3 text-body-sm text-accent-text"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{formError}</p>
              </div>
            ) : (
              <div className="mt-4 flex gap-2 rounded-lg border-l-4 border-success bg-background-app p-3 text-body-sm text-success">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p className="font-semibold">Ready to save</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending || !!formError}
              className={`${btnPrimary} mt-4 w-full`}
            >
              {saveLabel}
            </button>

            <div className="mt-4 flex gap-2 text-body-sm text-neutral-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p>
                Saving creates a draft configuration. Publishing is separate and
                checks live Question Bank readiness.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ───────── Small components ───────── */

function EditorSection({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border-color bg-card-bg">
      <header className="flex items-start justify-between gap-3 border-b border-border-color px-5 py-4">
        <div>
          <h2 className="text-section-title font-bold">{title}</h2>
          {description && (
            <p className="mt-1 max-w-prose text-body-sm text-neutral-muted">
              {description}
            </p>
          )}
        </div>
        {aside}
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Checkbox({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border-input bg-card-bg"}`}
    >
      {on && <Check className="h-3.5 w-3.5" />}
    </span>
  );
}

function OptionCard({
  on,
  onClick,
  title,
  description,
  checkbox,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  description: string;
  checkbox?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${on ? "border-primary bg-primary-light" : "border-border-color hover:bg-background-app"}`}
    >
      <span className="flex items-start gap-3">
        {checkbox ? (
          <Checkbox on={on} />
        ) : (
          <span
            aria-hidden
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-primary" : "border-border-input"}`}
          >
            {on && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
          </span>
        )}
        <span>
          <span className="block text-body font-semibold">{title}</span>
          <span className="mt-1 block text-body-sm text-neutral-muted">
            {description}
          </span>
        </span>
      </span>
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-body font-semibold">{label}</span>
      {children}
      {hint && (
        <span className="mt-1 block text-body-sm text-neutral-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

function inputClass() {
  return "mt-2 h-10 w-full rounded-lg border border-border-input bg-card-bg px-3 text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-neutral-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}