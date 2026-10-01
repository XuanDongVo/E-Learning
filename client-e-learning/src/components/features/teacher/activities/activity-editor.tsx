"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Check,
  Clock3,
  Layers3,
  Shuffle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activityService } from "@/services/activity.service";
import { unitService } from "@/services/content/content.unit.service";
import { QUERY_KEYS } from "@/services/query-keys";
import type {
  ActivityMode,
  ActivitySourceOption,
  DistributionMode,
  SelectionStrategy,
} from "@/types/activity";

type Selected = ActivitySourceOption & {
  displayOrder: number;
  percentage?: number;
  fixedCount?: number;
};
const input =
  "mt-1.5 h-10 w-full rounded-xl border border-border-color bg-background-app px-3 text-sm outline-none focus:border-primary";

export function ActivityEditor({ activityId }: { activityId?: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const requested = Number(params.get("unitId") || 0);
  const existing = useQuery({
    queryKey: QUERY_KEYS.activity(activityId || 0),
    queryFn: async () => (await activityService.get(activityId!)).data,
    enabled: !!activityId,
  });
  const unitId = existing.data?.unitId || requested;
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
  const [selection, setSelection] = useState<SelectionStrategy>("RANDOM");
  const [mode, setMode] = useState<ActivityMode>("BOTH");
  const [seconds, setSeconds] = useState(60);
  const [lives, setLives] = useState(3);
  const [banks, setBanks] = useState<Selected[]>([]);
  if (existing.data && !initialized) {
    setInitialized(true);
    setName(existing.data.name);
    setDescription(existing.data.description || "");
    setDistribution(existing.data.distributionMode);
    setTotal(existing.data.totalQuestions);
    setSelection(existing.data.selectionStrategy);
    setMode(existing.data.mode);
    setSeconds(existing.data.timeLimitSeconds || 60);
    setLives(existing.data.lives || 3);
    setBanks(
      existing.data.banks.map((b) => ({
        questionBankId: b.questionBankId,
        questionBankName: b.questionBankName,
        topicId: b.topicId,
        topicName: b.topicName,
        sectionName: b.sectionName,
        status: "PUBLISHED",
        totalQuestions: b.totalQuestions,
        readyQuestions: b.readyQuestions,
        displayOrder: b.displayOrder,
        percentage: b.percentage || undefined,
        fixedCount: b.fixedCount || undefined,
      })),
    );
  }
  const grouped = useMemo(() => {
    const m = new Map<string, Map<string, ActivitySourceOption[]>>();
    (sources.data || []).forEach((s) => {
      if (s.status === "ARCHIVED") return;
      if (!m.has(s.sectionName)) m.set(s.sectionName, new Map());
      const t = m.get(s.sectionName)!;
      if (!t.has(s.topicName)) t.set(s.topicName, []);
      t.get(s.topicName)!.push(s);
    });
    return [...m.entries()];
  }, [sources.data]);
  const selected = new Set(banks.map((b) => b.questionBankId));
  const equalInvalid =
    distribution === "EQUAL" && banks.length > 0 && total % banks.length !== 0;
  const allocation = banks.map((b, i) => {
    if (distribution === "FIXED_COUNT")
      return { ...b, allocated: b.fixedCount || 0 };
    if (distribution === "EQUAL") {
      const each = Math.floor(total / Math.max(1, banks.length));
      return {
        ...b,
        allocated: each + (i < total % Math.max(1, banks.length) ? 1 : 0),
      };
    }
    return { ...b, allocated: Math.floor((total * (b.percentage || 0)) / 100) };
  });
  const allocationTotal = allocation.reduce((s, b) => s + b.allocated, 0);
  const toggle = (s: ActivitySourceOption) =>
    setBanks((cur) =>
      cur.some((b) => b.questionBankId === s.questionBankId)
        ? cur.filter((b) => b.questionBankId !== s.questionBankId)
        : [...cur, { ...s, displayOrder: cur.length }],
    );
  const payloadBanks = banks.map((b) => ({
    questionBankId: b.questionBankId,
    displayOrder: b.displayOrder,
    percentage: distribution === "PERCENTAGE" ? b.percentage : undefined,
    fixedCount: distribution === "FIXED_COUNT" ? b.fixedCount : undefined,
  }));
  const save = useMutation({
    mutationFn: () => {
      if (
        !unitId ||
        !name.trim() ||
        !banks.length ||
        allocationTotal !== total ||
        equalInvalid
      )
        throw new Error("Complete the activity configuration first.");
      const p = {
        name: name.trim(),
        description: description.trim() || undefined,
        distributionMode: distribution,
        totalQuestions: total,
        selectionStrategy: selection,
        mode,
        timeLimitSeconds: mode === "LEARNING" ? undefined : seconds,
        lives: mode === "LEARNING" ? undefined : lives,
        banks: payloadBanks,
      };
      return activityId
        ? activityService.update(activityId, p)
        : activityService.create({ unitId, ...p });
    },
    onSuccess: (r) => {
      if (r.data) {
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.activities(r.data.unitId),
        });
        toast.success("Activity saved");
        router.push("/teacher/activities/" + r.data.id);
      }
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save activity"),
  });
  return (
    <div className="mx-auto max-w-[1280px] space-y-5 pb-20">
      <header className="flex items-start gap-3">
        <Link
          href={"/teacher/activities?unitId=" + unitId}
          className="grid h-10 w-10 place-items-center rounded-xl border bg-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
            {activityId ? "Edit activity" : "Create activity"}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">
            {name || "New activity"}
          </h1>
          <p className="mt-1 text-sm text-neutral-muted">
            {unit.data?.code} · {unit.data?.name} · Grade {unit.data?.gradeId}
          </p>
        </div>
      </header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-5">
          <Section icon={Layers3} title="Activity">
            <label className="block text-sm font-bold">
              Name
              <input
                className={input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Unit 1 Grammar Practice"
              />
            </label>
            <label className="mt-4 block text-sm font-bold">
              Description
              <textarea
                className={input + " h-24 py-2"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What should students practice?"
              />
            </label>
          </Section>
          <Section icon={Target} title="Question Banks">
            <p className="mb-4 text-xs text-neutral-muted">
              Only Question Banks inside this Unit are available.
            </p>
            {grouped.map(([section, topics]) => (
              <div
                key={section}
                className="mb-3 overflow-hidden rounded-xl border"
              >
                <div className="bg-slate-50 px-4 py-3 text-sm font-extrabold">
                  {section}
                </div>
                {[...topics.entries()].map(([topic, list]) => (
                  <div key={topic} className="p-4">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-neutral-subtle">
                      {topic}
                    </p>
                    {list.map((s) => (
                      <button
                        key={s.questionBankId}
                        type="button"
                        disabled={s.status !== "PUBLISHED"}
                        onClick={() => toggle(s)}
                        className={
                          (selected.has(s.questionBankId)
                            ? "border-primary bg-primary-light/50"
                            : "border-border-color") +
                          " mb-2 flex w-full items-center gap-3 rounded-xl border p-3 text-left"
                        }
                      >
                        <span
                          className={
                            (selected.has(s.questionBankId)
                              ? "bg-primary text-white"
                              : "border bg-white") +
                            " grid h-5 w-5 shrink-0 place-items-center rounded-md"
                          }
                        >
                          {selected.has(s.questionBankId) && (
                            <Check size={13} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-extrabold">
                            {s.questionBankName}
                          </span>
                          <span className="text-xs text-neutral-muted">
                            {s.readyQuestions}/{s.totalQuestions} ready ·{" "}
                            {s.status}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </Section>
          <Section icon={Target} title="Question Set">
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <label className="text-sm font-bold">
                Total
                <input
                  className={input}
                  type="number"
                  min={1}
                  value={total}
                  onChange={(e) =>
                    setTotal(Math.max(1, Number(e.target.value)))
                  }
                />
              </label>
              <div>
                <span className="text-sm font-bold">Distribution</span>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                  {(
                    ["EQUAL", "PERCENTAGE", "FIXED_COUNT"] as DistributionMode[]
                  ).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDistribution(v)}
                      className={
                        (distribution === v
                          ? "border-primary bg-primary-light"
                          : "border-border-color") +
                        " rounded-xl border p-3 text-left text-xs font-extrabold"
                      }
                    >
                      {v === "FIXED_COUNT"
                        ? "Fixed count"
                        : v === "PERCENTAGE"
                          ? "Percentage"
                          : "Equal"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {distribution !== "EQUAL" && (
              <div className="mt-4 space-y-2">
                {banks.map((b) => (
                  <div
                    key={b.questionBankId}
                    className="flex items-center gap-3"
                  >
                    <span className="flex-1 truncate text-xs font-bold">
                      {b.questionBankName}
                    </span>
                    <input
                      className={input + " w-28"}
                      type="number"
                      min={1}
                      value={
                        distribution === "PERCENTAGE"
                          ? b.percentage || 0
                          : b.fixedCount || 0
                      }
                      onChange={(e) =>
                        setBanks((cur) =>
                          cur.map((x) =>
                            x.questionBankId === b.questionBankId
                              ? {
                                  ...x,
                                  ...(distribution === "PERCENTAGE"
                                    ? { percentage: Number(e.target.value) }
                                    : { fixedCount: Number(e.target.value) }),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs font-bold">
              Allocated: {allocationTotal} / {total}
              {equalInvalid && (
                <span className="ml-2 text-amber-600">
                  Equal distribution must divide evenly.
                </span>
              )}
            </div>
          </Section>
          <Section icon={Shuffle} title="Selection">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["RANDOM", "Random", "Random within each bank quota.", Shuffle],
                [
                  "WEAKNESS_PRIORITY",
                  "Weakness priority",
                  "Prioritize weaker areas.",
                  Target,
                ],
              ].map(([v, t, d, I]) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setSelection(v as SelectionStrategy)}
                  className={
                    (selection === v
                      ? "border-primary bg-primary-light"
                      : "border-border-color") +
                    " rounded-xl border p-4 text-left"
                  }
                >
                  <I size={16} />
                  <p className="mt-2 text-sm font-extrabold">{String(t)}</p>
                  <p className="mt-1 text-xs text-neutral-muted">{String(d)}</p>
                </button>
              ))}
            </div>
          </Section>
          <Section icon={Zap} title="Student Mode">
            <div className="grid gap-2 md:grid-cols-3">
              {[
                ["LEARNING", "Learning", Brain],
                ["TRY_HARD", "Try Hard", Clock3],
                ["BOTH", "Both", Sparkles],
              ].map(([v, t, I]) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setMode(v as ActivityMode)}
                  className={
                    (mode === v
                      ? "border-primary bg-primary-light"
                      : "border-border-color") +
                    " rounded-xl border p-4 text-left"
                  }
                >
                  <I size={17} />
                  <p className="mt-2 text-sm font-extrabold">{String(t)}</p>
                  <p className="mt-1 text-xs text-neutral-muted">
                    {v === "BOTH"
                      ? "Student chooses Learning or Try Hard."
                      : v === "TRY_HARD"
                        ? "Timed challenge with limited lives."
                        : "Guided practice."}
                  </p>
                </button>
              ))}
            </div>
            {mode !== "LEARNING" && (
              <div className="mt-4 grid gap-3 rounded-xl bg-amber-50 p-4 sm:grid-cols-2">
                <label className="text-xs font-bold">
                  Time limit
                  <input
                    className={input + " bg-white"}
                    type="number"
                    min={1}
                    value={seconds}
                    onChange={(e) =>
                      setSeconds(Math.max(1, Number(e.target.value)))
                    }
                  />
                </label>
                <label className="text-xs font-bold">
                  Lives
                  <input
                    className={input + " bg-white"}
                    type="number"
                    min={1}
                    value={lives}
                    onChange={(e) =>
                      setLives(Math.max(1, Number(e.target.value)))
                    }
                  />
                </label>
              </div>
            )}
          </Section>
        </main>
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-subtle">
              Summary
            </p>
            <h2 className="mt-2 font-extrabold">
              {name || "Untitled activity"}
            </h2>
            <div className="mt-4 space-y-2 text-xs">
              <p className="flex justify-between">
                <span>Unit</span>
                <b>{unit.data?.code || "—"}</b>
              </p>
              <p className="flex justify-between">
                <span>Banks</span>
                <b>{banks.length}</b>
              </p>
              <p className="flex justify-between">
                <span>Questions</span>
                <b>{total}</b>
              </p>
              <p className="flex justify-between">
                <span>Mode</span>
                <b>{mode}</b>
              </p>
            </div>
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="mt-5 h-11 w-full rounded-xl bg-primary text-sm font-extrabold text-white disabled:opacity-50"
            >
              {save.isPending ? "Saving..." : "Save activity"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Brain;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border-color bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-light text-primary">
          <Icon size={17} />
        </span>
        <h2 className="font-extrabold">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
