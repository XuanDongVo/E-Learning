"use client";

import type {
  ActivityHistoryPeriod,
  ActivitySessionMode,
  ActivitySessionStatus,
} from "@/types/student/activity-session";

const periods: ActivityHistoryPeriod[] = ["ALL", "TODAY", "LAST_7_DAYS", "LAST_30_DAYS"];

type TerminalStatus = Exclude<ActivitySessionStatus, "IN_PROGRESS">;

export function ActivityHistoryFilters({
  period,
  mode,
  status,
  onPeriodChange,
  onModeChange,
  onStatusChange,
  label,
}: {
  period: ActivityHistoryPeriod;
  mode?: ActivitySessionMode;
  status?: TerminalStatus;
  onPeriodChange: (value: ActivityHistoryPeriod) => void;
  onModeChange: (value?: ActivitySessionMode) => void;
  onStatusChange: (value?: TerminalStatus) => void;
  label: (key: string) => string;
}) {
  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="student-label text-foreground">{label("periodLabel")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {periods.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              onClick={() => onPeriodChange(value)}
              className={`student-control px-3 ${
                period === value ? "student-filter-active" : "student-control--quiet"
              }`}
            >
              {label(`periods.${value}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="student-label block text-foreground">{label("modeLabel")}</span>
          <select
            value={mode ?? ""}
            onChange={(event) =>
              onModeChange((event.target.value || undefined) as ActivitySessionMode | undefined)
            }
            className="student-field px-3"
          >
            <option value="">{label("allModes")}</option>
            <option value="LEARNING">{label("modes.LEARNING")}</option>
            <option value="TRY_HARD">{label("modes.TRY_HARD")}</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="student-label block text-foreground">{label("statusLabel")}</span>
          <select
            value={status ?? ""}
            onChange={(event) =>
              onStatusChange((event.target.value || undefined) as TerminalStatus | undefined)
            }
            className="student-field px-3"
          >
            <option value="">{label("allStatuses")}</option>
            <option value="COMPLETED">{label("statuses.COMPLETED")}</option>
            <option value="GAME_OVER">{label("statuses.GAME_OVER")}</option>
            <option value="ABANDONED">{label("statuses.ABANDONED")}</option>
          </select>
        </label>
      </div>
    </div>
  );
}
