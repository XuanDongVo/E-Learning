import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Play,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Pipo, type PipoMood } from "@/components/ui/mascot";
import type { AttemptIntroResponse } from "@/types/student/assignment-attempt";

export interface StudentAssignmentIntroProps {
  data: AttemptIntroResponse;
  onBack?: () => void;
  onStart?: () => void;
  onResume?: () => void;
  onViewResult?: () => void;
}

function formatDueAt(isoDate: string, locale: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;

    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoDate;
  }
}

export function StudentAssignmentIntro({
  data,
  onBack,
  onStart,
  onResume,
  onViewResult,
}: StudentAssignmentIntroProps) {
  const locale = useLocale();
  const t = useTranslations("student.assignmentAttempt.intro");
  const {
    assignmentTitle,
    gradeName,
    questionCount,
    timeLimitMinutes,
    dueAt,
    attemptStatus,
    late,
  } = data;

  // Quyết định trạng thái, lời thoại của Pipo và nút bấm
  const isNotStarted = attemptStatus === null;
  const isInProgress = attemptStatus === "IN_PROGRESS";
  const isSubmitted = attemptStatus === "SUBMITTED";
  const isTimedOut = attemptStatus === "TIMED_OUT";

  let pipoMood: PipoMood = "wave";
  let pipoDialogue = t("dialogue.notStarted");
  let statusBadge = {
    text: t("status.notStarted"),
    bg: "bg-amber-100 text-amber-800 border-amber-300",
  };

  if (isInProgress) {
    pipoMood = "cheer";
    pipoDialogue = t("dialogue.inProgress");
    statusBadge = {
      text: t("status.inProgress"),
      bg: "bg-blue-100 text-blue-800 border-blue-300",
    };
  } else if (isSubmitted) {
    pipoMood = "celebrate";
    pipoDialogue = t("dialogue.submitted");
    statusBadge = {
      text: t("status.submitted"),
      bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    };
  } else if (isTimedOut) {
    pipoMood = "oops";
    pipoDialogue = t("dialogue.timedOut");
    statusBadge = {
      text: t("status.timedOut"),
      bg: "bg-rose-100 text-rose-800 border-rose-300",
    };
  }

  return (
    <div className="w-full mx-auto px-4 py-6 font-sans text-slate-900">
      {/* Nút quay lại dạng chip xúc giác */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 mb-6 text-sm font-semibold rounded-2xl bg-white border-2 border-slate-200 text-slate-700 shadow-[0_3px_0_#e2e8f0] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>{t("backToAssignments")}</span>
      </button>

      {/* Cảnh báo trễ hạn nếu late = true và chưa nộp */}
      {late && !isSubmitted && (
        <div className="mb-6 p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3 shadow-[0_4px_0_#fecdd3]">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="block text-base font-bold text-rose-800">
              {t("overdueTitle")}
            </strong>
            {t("overdueDescription")}
          </div>
        </div>
      )}

      {/* Hero Quest Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 border-2 border-orange-200 p-6 sm:p-8 shadow-[0_6px_0_#fed7aa] mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Mascot Pipo & Bóng thoại */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              {/* <InlinePipo mood={pipoMood} size={115} /> */}
              <Pipo mood={pipoMood} size={115} color="success" />
              {/* Bóng thoại Pipo */}
              <div className="sm:hidden mt-2 px-3 py-1.5 rounded-2xl bg-white border-2 border-orange-300 text-xs font-bold text-orange-950 text-center shadow-[0_2px_0_#fed7aa]">
                {pipoDialogue}
              </div>
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 border border-orange-200 text-orange-800 shadow-sm">
                <Sparkles size={13} className="text-orange-500" />
                {t("eyebrow")}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${statusBadge.bg}`}
              >
                {statusBadge.text}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {assignmentTitle}
            </h1>

            {/* Bóng thoại Pipo trên desktop */}
            <div className="hidden sm:inline-block mt-1 px-4 py-2 rounded-2xl bg-white/95 border-2 border-orange-200 text-sm font-semibold text-orange-950 shadow-[0_3px_0_#ffedd5]">
              {pipoDialogue}
            </div>
          </div>
        </div>
      </div>

      {/* Lưới 4 Thẻ Thông số (Tactile Stat Chips) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Số câu hỏi */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_4px_0_#e2e8f0] flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 font-bold">
            <FileQuestion size={20} />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {t("questionLabel")}
          </span>
          <strong className="text-lg font-bold text-slate-800">
            {t("questionCount", { count: questionCount })}
          </strong>
        </div>

        {/* Thời gian */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_4px_0_#e2e8f0] flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-2 font-bold">
            <Clock3 size={20} />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {t("timeLimit")}
          </span>
          <strong className="text-lg font-bold text-slate-800">
            {timeLimitMinutes
              ? t("timeLimitValue", { minutes: timeLimitMinutes })
              : t("noTimeLimit")}
          </strong>
        </div>

        {/* Khối lớp */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_4px_0_#e2e8f0] flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 font-bold">
            <GraduationCap size={20} />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {t("grade")}
          </span>
          <strong className="text-lg font-bold text-slate-800">
            {gradeName || t("metadataUnavailable")}
          </strong>
        </div>

        {/* Hạn nộp */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_4px_0_#e2e8f0] flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2 font-bold">
            <CalendarDays size={20} />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {t("dueAt")}
          </span>
          <strong className="text-sm font-bold text-slate-800 truncate max-w-full">
            {formatDueAt(dueAt, locale)}
          </strong>
        </div>
      </div>

      {/* Quy chế làm bài (Client guidelines) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-[0_5px_0_#e2e8f0] mb-8">
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span>📋</span> {t("rules.title")}
        </h2>
        <ul className="space-y-2.5 text-sm text-slate-600">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>{t("rules.oneAttemptTitle")}</strong>{" "}
              {t("rules.oneAttempt")}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>{t("rules.autoSaveTitle")}</strong> {t("rules.autoSave")}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>{t("rules.noHintsTitle")}</strong> {t("rules.noHints")}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>{t("rules.stayOnScreenTitle")}</strong>{" "}
              {t("rules.stayOnScreen")}
            </span>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>{t("rules.singleTabTitle")}</strong>{" "}
              {t("rules.singleTab")}
            </span>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>{t("rules.warningTitle")}</strong> {t("rules.warning")}
            </span>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong>{t("rules.submitTitle")}</strong> {t("rules.submit")}
            </span>
          </li>
        </ul>
      </div>

      {/* Khu vực Nút hành động 3D Tactile CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-100 border-2 border-slate-200">
        <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
          {isNotStarted && t("actionDescription.notStarted")}
          {isInProgress && t("actionDescription.inProgress")}
          {isSubmitted && t("actionDescription.submitted")}
          {isTimedOut && t("actionDescription.timedOut")}
        </div>

        <div className="w-full sm:w-auto shrink-0">
          {/* Chưa làm -> Nút Bắt đầu */}
          {isNotStarted && (
            <button
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base shadow-[0_5px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={18} className="fill-white" />
              <span>{t("start")}</span>
            </button>
          )}

          {/* Đang làm dở -> Nút Tiếp tục */}
          {isInProgress && (
            <button
              type="button"
              onClick={onResume}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-[0_5px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={18} className="fill-white" />
              <span>{t("resume")}</span>
            </button>
          )}

          {/* Đã nộp -> Nút Xem kết quả / Đã nộp */}
          {isSubmitted && (
            <button
              type="button"
              onClick={onViewResult}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-[0_4px_0_#047857] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={18} />
              <span>{t("completed")}</span>
            </button>
          )}

          {/* Hết giờ */}
          {isTimedOut && (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-slate-300 text-slate-500 font-bold text-sm cursor-not-allowed opacity-80 flex items-center justify-center gap-2"
            >
              <Clock3 size={18} />
              <span>{t("timeUp")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
