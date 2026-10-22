import { useQuery } from "@tanstack/react-query";
import { gradeService } from "@/services/grade.service";
import { Checkbox } from "@/components/ui/checkbox";
import { classService } from "@/services/class.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBuilder } from "@/components/features/teacher/assignments/builder/store";
import type { AssignmentSettings, ShowAnswers } from "@/types/assignment-builder";

export function SettingsSheet() {
  const open = useBuilder((s) => s.settingsOpen);
  const classes = useQuery({ queryKey: ["classes"], queryFn: classService.list });
  const grades = useQuery({ queryKey: ["grades"], queryFn: gradeService.list, enabled: open });
  const a = useBuilder((s) => s.assignment);
  const { set, mutate } = useBuilder.getState();
  const st = a.settings;
  const upd = (p: Partial<AssignmentSettings>) => mutate((d) => Object.assign(d.settings, p));
  const dateError = st.startAt && st.dueAt && st.dueAt <= st.startAt ? "Due date must be after the start date" : null;
  const timeError = st.timeLimitMin != null && (st.timeLimitMin <= 0 || !Number.isFinite(st.timeLimitMin)) ? "Time limit must be a positive number" : null;
  return (
    <Sheet open={open} onOpenChange={(o) => set({ settingsOpen: o })}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assignment settings</SheetTitle>
          <SheetDescription>Changes apply to the draft immediately and are saved with it.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8">
          <div className="space-y-1.5">
            <Label htmlFor="set-title">Title</Label>
            <Input id="set-title" value={a.title} onChange={(e) => mutate((d) => (d.title = e.target.value))} />
            {!a.title.trim() && <p className="text-xs text-destructive">Title is required</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Grade</Label>
            <Select
              value={String(a.grade)}
              onValueChange={(v) => mutate((d) => (d.grade = Number(v) as 6 | 7 | 8))}
              disabled={grades.isLoading || grades.isError || !(grades.data?.data?.length)}
            >
              <SelectTrigger><SelectValue placeholder={grades.isLoading ? "Loading grades…" : "Select grade"} /></SelectTrigger>
              <SelectContent>
                {[...(grades.data?.data ?? [])]
                  .filter((grade) => grade.status !== "INACTIVE")
                  .sort((left, right) => left.displayOrder - right.displayOrder)
                  .map((grade) => (
                    <SelectItem key={grade.id} value={String(Number(grade.code))}>
                      {grade.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {grades.isLoading && <p className="text-xs text-muted-foreground">Loading grades…</p>}
            {grades.isError && <p className="text-xs text-destructive">Could not load grades. Please retry.</p>}
            {!grades.isLoading && !grades.isError && !(grades.data?.data ?? []).some((grade) => grade.status !== "INACTIVE") &&
              <p className="text-xs text-destructive">No active grades are available.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-ins">Instructions for students</Label>
            <Textarea id="set-ins" rows={3} value={a.instructions} onChange={(e) => mutate((d) => (d.instructions = e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-time">Time limit for the whole attempt (minutes)</Label>
            <Input id="set-time" type="number" min={1} placeholder="No limit" value={st.timeLimitMin ?? ""} onChange={(e) => upd({ timeLimitMin: e.target.value === "" ? null : Number(e.target.value) })} />
            {timeError ? <p className="text-xs text-destructive">{timeError}</p> : <p className="text-xs text-muted-foreground">Leave empty for no limit. There are no per-question timers.</p>}
          </div>
          <div className="space-y-4">
            <div className="space-y-2 rounded-md border p-3">
              <div>
                <Label>Begin</Label>
                <p className="text-xs text-muted-foreground">Choose when students can start.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    const now = new Date();
                    now.setSeconds(0, 0);
                    upd({ startAt: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16) });
                  }}
                >Start now</button>
                <button
                  type="button"
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    const start = new Date();
                    start.setDate(start.getDate() + 1);
                    start.setHours(8, 0, 0, 0);
                    upd({ startAt: new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16) });
                  }}
                >Tomorrow, 8:00 AM</button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-start">Start date and time</Label>
                <Input id="set-start" type="datetime-local" value={st.startAt} onChange={(e) => upd({ startAt: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <div>
                <Label>Due date</Label>
                <p className="text-xs text-muted-foreground">Use a quick option or choose an exact date and time.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["today", "Today"],
                  ["tomorrow", "Tomorrow"],
                  ["week", "In 7 days"],
                ] as const).map(([preset, label]) => (
                  <button
                    key={preset}
                    type="button"
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      const due = new Date();
                      due.setHours(23, 59, 0, 0);
                      if (preset === "tomorrow") due.setDate(due.getDate() + 1);
                      if (preset === "week") due.setDate(due.getDate() + 7);
                      upd({ dueAt: new Date(due.getTime() - due.getTimezoneOffset() * 60000).toISOString().slice(0, 16) });
                    }}
                  >{label}</button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-due">Due date and time</Label>
                <Input id="set-due" type="datetime-local" value={st.dueAt} aria-invalid={!!dateError} onChange={(e) => upd({ dueAt: e.target.value })} />
              </div>
            </div>
            {dateError && <p className="text-xs text-destructive">{dateError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Target classes</Label>
            <div className="grid grid-cols-3 gap-2 rounded-md border p-3">
              {(classes.data?.data ?? []).filter((classItem) => classItem.status === "ACTIVE" &&
                (Number(classItem.grade.code) === a.grade || classItem.grade.name.includes(String(a.grade)))).map((classItem) => (
                <label key={classItem.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={st.classIds.includes(String(classItem.id))} onCheckedChange={(v) => upd({ classIds: v ? [...new Set([...st.classIds, String(classItem.id)])] : st.classIds.filter((x) => x !== String(classItem.id)) })} />
                  {classItem.name}
                </label>
              ))}
            </div>
            {classes.isLoading ? <p className="text-xs text-muted-foreground">Loading classes…</p> : st.classIds.length === 0 && <p className="text-xs text-warning-foreground">No class selected; this Assignment targets the whole grade when saved.</p>}
            {classes.isError && <p className="text-xs text-destructive">Could not load classes. Check your connection and retry.</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Show answers to students</Label>
            <Select value={st.showAnswers} onValueChange={(v) => upd({ showAnswers: v as ShowAnswers })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Never</SelectItem>
                <SelectItem value="after_submission">After submission</SelectItem>
                <SelectItem value="after_due">After the due date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Show score after submission</span>
            <Switch checked={st.showScoreAfterSubmit} onCheckedChange={(v) => upd({ showScoreAfterSubmit: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Show points per question</span>
            <Switch checked={st.showPoints} onCheckedChange={(v) => upd({ showPoints: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              Shuffle questions within sections
              <span className="block text-xs text-muted-foreground">Off by default. Shared groups stay together.</span>
            </span>
            <Switch checked={st.shuffle} onCheckedChange={(v) => upd({ shuffle: v })} />
          </label>
        </div>
      </SheetContent>
    </Sheet>
  );
}
