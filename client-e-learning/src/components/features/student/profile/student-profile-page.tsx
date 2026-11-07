"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import type { StudentProfile, StudentRecentSession } from "@/types/student/profile";
import type { Gender, GuardianRelationship, StudentGuardianRequest } from "@/types/student";
import type { StudentGamificationOverview, StudentStreakOverview } from "@/types/gamification";
import { studentProfileService } from "@/services/student/student-profile.service";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import { studentAssignmentService } from "@/services/student/student-assignment.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { FullPageState, RegionState } from "@/components/feedback";
import { toAppError } from "@/lib/errors/app-error";
import { toast } from "sonner";

import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Flame,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";


type Profile = StudentProfile & {
  dateOfBirth: string; gender: Gender; phone: string; avatarKey: string;
  currentClass: NonNullable<StudentProfile["currentClass"]>;
};
type Tab = "overview" | "learning" | "streak" | "personal";
type LearningData = {
  sessionTotal: number; sessionsCompleted: number;
  assignments: {
    assigned: number; submitted: number; late: number;
    notStarted: number; inProgress: number; timedOut: number;
  };
  activities: StudentRecentSession[];
};
function toViewProfile(raw: StudentProfile): Profile {
  return {
    ...raw, dateOfBirth: raw.dateOfBirth ?? "",
    gender: raw.gender ?? "OTHER", phone: raw.phone ?? "",
    avatarKey: raw.avatarKey ?? `dicebear:adventurer:${raw.userId}`,
    currentClass: raw.currentClass ?? {
      id: 0, name: "—", gradeId: 0, gradeName: "—",
      academicYear: "—", status: "INACTIVE",
    },
  };
}
const RELATIONSHIPS: Record<GuardianRelationship, string> = {
  FATHER: "Bố", MOTHER: "Mẹ", GUARDIAN: "Người giám hộ", OTHER: "Khác",
};
function guardianPayload(g: Profile["guardians"][number]): StudentGuardianRequest {
  return {
    id: g.id, relationship: g.relationship, fullName: g.fullName,
    phone: g.phone, email: g.email ?? "", primary: g.primary,
  };
}

const AVATAR_STYLES = [
  { id: "adventurer", name: "Adventurer" },
  { id: "bottts", name: "Bottts" },
  { id: "lorelei", name: "Lorelei" },
  { id: "pixel-art", name: "Pixel Art" },
  { id: "fun-emoji", name: "Fun Emoji" },
  { id: "big-smile", name: "Big Smile" },
  { id: "notionists", name: "Notionists" },
  { id: "open-peeps", name: "Open Peeps" },
  { id: "micah", name: "Micah" },
  { id: "thumbs", name: "Thumbs" },
] as const;


const cx = (...parts: Array<string | false | undefined | null>) =>
  parts.filter(Boolean).join(" ");

const avatarSrc = (style: string, seed: string) =>
  `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed || "alice")}`;

const parseAvatar = (key: string) => {
  const [source, style, ...seed] = key.split(":");
  return source === "dicebear" && AVATAR_STYLES.some((s) => s.id === style)
    ? { style, seed: seed.join(":") || "alice" }
    : { style: "adventurer", seed: "alice" };
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Chưa cập nhật";
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
};

const genderLabel = (gender: string) =>
  ({ MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" })[gender] || gender;

const number = (n: number) => n.toLocaleString("vi-VN");

/** Thẻ Scrapbook viền méo vẽ tay hữu cơ */
function PaperCard({
  children,
  className = "",
  hasTape = false,
  tapePosition = "left",
}: {
  children: React.ReactNode;
  className?: string;
  hasTape?: boolean;
  tapePosition?: "left" | "center" | "right";
}) {
  const tapeOffsets = {
    left: "left-8 -rotate-2",
    center: "left-1/2 -translate-x-1/2 rotate-1",
    right: "right-8 rotate-2",
  };

  return (
    <section
      className={cx(
        "relative rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-2 border-[#2d2b2a] bg-[#fffdf9] shadow-[4px_5px_0_#2d2b2a]",
        className
      )}
    >
      {hasTape && (
        <div
          className={cx(
            "pointer-events-none absolute -top-3.5 z-10 h-6 w-24 rounded-[2px] bg-[#f3e88e]/85 shadow-[0_1px_2px_rgba(0,0,0,0.15)]",
            tapeOffsets[tapePosition]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </section>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  note,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  note?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-[#e8dec8] pb-3">
      <h2 className="flex items-center gap-2.5 font-serif text-xl font-black tracking-tight text-[#2d2b2a]">
        <span className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#2d2b2a] bg-[#f7f4eb] shadow-[1px_1px_0_#2d2b2a]">
          <Icon size={16} />
        </span>
        {title}
      </h2>
      {note && (
        <span className="font-mono text-xs font-semibold text-[#8c827a]">
          ~ {note} ~
        </span>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  color,
  rotation = "rotate-0",
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string;
  hint: string;
  color: string;
  rotation?: string;
}) {
  return (
    <div
      className={cx(
        "relative rounded-[20px_5px_18px_6px/5px_18px_6px_20px] border-2 border-[#2d2b2a] p-4.5 shadow-[3px_4px_0_#2d2b2a] transition hover:-translate-y-0.5",
        color,
        rotation
      )}
    >
      <div className="mb-2 flex items-center justify-between font-mono">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#544d47]">
          {label}
        </span>
        <Icon size={18} className="text-[#2d2b2a]" />
      </div>
      <div className="font-serif text-xl font-black tracking-tight text-[#2d2b2a] sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 font-mono text-[11px] font-semibold text-[#6e6863]">
        {hint}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 border-b border-dashed border-[#e8dec8] py-2.5 last:border-0">
      <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8c827a]">
        {label}
      </dt>
      <dd className="mt-0.5 break-words font-mono text-sm font-bold text-[#2d2b2a]">
        {value || "Chưa cập nhật"}
      </dd>
    </div>
  );
}

/** Hộp thoại chọn Avatar kiểu Scrapbook Box */
function AvatarDialog({
  current,
  onClose,
  onSave,
}: {
  current: string;
  onClose: () => void;
  onSave: (avatarKey: string) => void;
}) {
  const initial = parseAvatar(current);
  const [draftSeed, setDraftSeed] = useState(initial.seed);
  const [seed, setSeed] = useState(initial.seed);
  const [style, setStyle] = useState(initial.style);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setSeed(draftSeed.trim().slice(0, 40) || "alice"),
      300
    );
    return () => window.clearTimeout(timeout);
  }, [draftSeed]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a17]/70 p-3 backdrop-blur-[2px] sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Đổi hình đại diện"
        className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-3 border-[#2d2b2a] bg-[#fffdf9] p-5 shadow-[8px_10px_0_#2d2b2a] sm:p-7"
      >
        <div
          className="absolute -top-3 left-12 h-6 w-28 -rotate-1 rounded-[2px] bg-[#f3e88e] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#e8dec8] pb-4">
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#c85a32]">
              ✂ Xưởng phác thảo chân dung
            </div>
            <h2 className="mt-1 font-serif text-2xl font-black text-[#2d2b2a]">
              Chọn Avatar Của Bạn <Sparkles className="inline text-[#d99b26]" size={22} />
            </h2>
            <p className="mt-1 font-mono text-xs text-[#6e6863]">
              Gõ từ khóa bất kỳ để quan sát nét vẽ biến đổi qua 10 phong cách.
            </p>
          </div>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-full border-2 border-[#2d2b2a] bg-[#fffdf9] p-1.5 text-[#2d2b2a] shadow-[2px_2px_0_#2d2b2a] transition hover:bg-[#e8dec8]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-[14px_4px_16px_5px/4px_16px_5px_14px] border-2 border-[#2d2b2a] bg-[#fdfbf7] px-3.5 shadow-inner">
            <Search size={18} className="text-[#8c827a]" />
            <input
              aria-label="Từ khóa avatar"
              className="h-11 w-full min-w-0 bg-transparent font-mono text-sm font-bold text-[#2d2b2a] outline-none"
              value={draftSeed}
              maxLength={40}
              placeholder="Thử gõ: alice, luna, robot..."
              onChange={(e) => setDraftSeed(e.target.value)}
            />
          </label>
          <button
            onClick={() => setDraftSeed(Math.random().toString(36).slice(2, 10))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#d99b26] px-4 font-mono text-xs font-bold text-white shadow-[2px_2px_0_#2d2b2a] hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCw size={15} /> Xúc xắc hạt giống
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {AVATAR_STYLES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              aria-pressed={style === s.id}
              className={cx(
                "group relative rounded-[16px_4px_18px_5px/5px_18px_5px_16px] border-2 p-2.5 text-center transition hover:-translate-y-0.5",
                idx % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]",
                style === s.id
                  ? "border-[#2d2b2a] bg-[#fff3db] shadow-[3px_3px_0_#2d2b2a]"
                  : "border-[#2d2b2a]/30 bg-[#fffdf9] hover:border-[#2d2b2a]"
              )}
            >
              <div className="overflow-hidden rounded-[8px] border border-[#2d2b2a]/20 bg-[#f7f4eb] p-1.5">
                <img
                  src={avatarSrc(s.id, seed)}
                  alt={`${s.name} avatar`}
                  loading="lazy"
                  className="aspect-square w-full object-contain"
                />
              </div>
              {style === s.id && (
                <CheckCircle2
                  size={17}
                  className="absolute right-1.5 top-1.5 rounded-full bg-[#c85a32] text-white"
                />
              )}
              <span className="mt-2 block truncate font-serif text-xs font-bold text-[#2d2b2a]">
                {s.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-[16px_5px_18px_4px/4px_18px_4px_16px] border-2 border-[#2d2b2a] bg-[#e8dec8] p-3.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-[10px] border-2 border-[#2d2b2a] bg-[#fffdf9] p-1 shadow-[2px_2px_0_#2d2b2a]">
              <img
                src={avatarSrc(style, seed)}
                alt="Avatar đã chọn"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase text-[#6e6863]">
                Lựa chọn hiện tại
              </div>
              <div className="font-serif text-sm font-black text-[#2d2b2a]">
                {AVATAR_STYLES.find((s) => s.id === style)?.name}
              </div>
              <div className="max-w-[200px] truncate font-mono text-xs text-[#6e6863]">
                seed: {seed}
              </div>
            </div>
          </div>
          <button
            onClick={() => onSave(`dicebear:${style}:${seed}`)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#6b8e67] px-5 py-2.5 font-mono text-xs font-bold text-white shadow-[3px_3px_0_#2d2b2a] transition hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
          >
            <Check size={16} /> Dán vào hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}

/** Lịch học tập tem đóng dấu */
function Calendar({
  month, move, qualifiedDates, todayDate,
}: {
  month: Date;
  move: (delta: number) => void;
  qualifiedDates: ReadonlySet<string>;
  todayDate: string;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const start = (first.getDay() + 6) % 7;
  const cells = [
    ...Array(start).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const key = (day: number) =>
    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const label = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-[#e8dec8] pb-3">
        <h3 className="font-serif text-lg font-black capitalize text-[#2d2b2a]">
          {label}
        </h3>
        <div className="flex gap-2">
          <button
            aria-label="Tháng trước"
            onClick={() => move(-1)}
            className="rounded-[6px] border-2 border-[#2d2b2a] bg-[#fffdf9] p-1.5 shadow-[2px_2px_0_#2d2b2a] transition hover:bg-[#e8dec8]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            aria-label="Tháng sau"
            onClick={() => move(1)}
            className="rounded-[6px] border-2 border-[#2d2b2a] bg-[#fffdf9] p-1.5 shadow-[2px_2px_0_#2d2b2a] transition hover:bg-[#e8dec8]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center font-mono text-xs font-bold text-[#8c827a]">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((day, i) => {
          const isQualified = day !== null && qualifiedDates.has(key(day));
          const isToday = day !== null && key(day) === todayDate;

          return (
            <div
              key={`${i}-${day ?? "empty"}`}
              className={cx(
                "flex aspect-square items-center justify-center rounded-[8px_3px_7px_3px/3px_7px_3px_8px] border-2 font-mono text-xs font-bold sm:text-sm",
                day === null
                  ? "border-transparent"
                  : isQualified
                  ? "border-[#2d2b2a] bg-[#d9e8d4] text-[#2c5332] shadow-[2px_2px_0_#2d2b2a]"
                  : "border-[#2d2b2a]/20 bg-[#fbf6ed] text-[#8c827a]",
                isToday && "ring-2 ring-[#c85a32] ring-offset-1 font-black"
              )}
              title={isQualified ? "Ngày học đạt chuẩn streak" : undefined}
            >
              {day ?? ""}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs font-semibold text-[#6e6863]">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-[#2d2b2a] bg-[#d9e8d4] shadow-[1px_1px_0_#2d2b2a]" />
          Đã đạt chuẩn streak
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-[#2d2b2a]/20 bg-[#fbf6ed]" />
          Chưa có bài học
        </span>
      </div>
    </div>
  );
}

function StudentProfileContent({
  initialProfile, game, streak, learn,
}: {
  initialProfile: StudentProfile; game: StudentGamificationOverview;
  streak: StudentStreakOverview; learn: LearningData;
}) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile>(() => toViewProfile(initialProfile));
  const [tab, setTab] = useState<Tab>("overview");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Profile>(() => toViewProfile(initialProfile));
  const [month, setMonth] = useState(() => {
    const [year, m] = streak.todayDate.split("-").map(Number);
    return new Date(year, m - 1, 1);
  });
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [guardianVisible, setGuardianVisible] = useState(false);
  const [guardianEditing, setGuardianEditing] = useState(false);
  const selectedGuardian = profile.guardians.find((g) => g.primary) ?? profile.guardians[0];
  const [guardianDraft, setGuardianDraft] = useState<StudentGuardianRequest>(
    selectedGuardian ? guardianPayload(selectedGuardian) :
      { relationship: "GUARDIAN", fullName: "", phone: "", email: "", primary: true }
  );
  const qualifiedDates = useMemo(() => new Set(streak.qualifiedDates), [streak.qualifiedDates]);
  const milestones = streak.milestones;
  const avatar = useMemo(() => parseAvatar(profile.avatarKey), [profile.avatarKey]);
  const levelRange = Math.max(0, game.nextLevelRequiredXp - game.currentLevelStartXp);
  const progressPct =
    levelRange > 0
      ? Math.min(100, Math.max(0, (game.xpIntoCurrentLevel / levelRange) * 100))
      : 0;

  const tabList: {
    id: Tab;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
  }[] = [
    { id: "overview", label: "Tổng quan", icon: Sparkles },
    { id: "learning", label: "Học tập", icon: BookOpen },
    { id: "streak", label: "Chuỗi ngày", icon: Flame },
    { id: "personal", label: "Thông tin cá nhân", icon: UserRound },
  ];

  const saveDraft = async () => {
    if (saving || !draft.fullName.trim()) return;
    setSaving(true);
    try {
      const response = await studentProfileService.update({
        fullName: draft.fullName.trim(), dateOfBirth: draft.dateOfBirth || undefined,
        gender: draft.gender, phone: draft.phone.trim(),
      });
      if (!response.data) throw new Error("Không thể lấy hồ sơ vừa lưu.");
      const updated = toViewProfile(response.data);
      setProfile(updated);
      setDraft(updated);
      setEditMode(false);
      setNotice("Đã cập nhật hồ sơ cá nhân.");
      void queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    } catch (error) { setNotice(toAppError(error).message); }
    finally { setSaving(false); }
  };

  const saveGuardian = async () => {
    if (saving) return;
    const fullName = guardianDraft.fullName.trim();
    const phone = guardianDraft.phone.trim();
    if (!fullName || !phone) {
      setNotice("Vui lòng nhập họ tên và số điện thoại người bảo hộ.");
      return;
    }
    // Existing backend PUT replaces guardians; preserve every non-selected record.
    const guardians = profile.guardians.map(guardianPayload);
    const index = selectedGuardian
      ? guardians.findIndex((item) => item.id === selectedGuardian.id) : -1;
    const modified = {
      ...guardianDraft, fullName, phone,
      email: guardianDraft.email?.trim() ?? "",
      primary: selectedGuardian?.primary ?? true,
    };
    if (index >= 0) guardians[index] = modified;
    else guardians.push(modified);
    setSaving(true);
    try {
      const response = await studentProfileService.update({
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth || undefined,
        gender: profile.gender,
        phone: profile.phone,
        guardians,
      });
      if (!response.data) throw new Error("Không thể lấy thông tin vừa lưu.");
      const updated = toViewProfile(response.data);
      setProfile(updated);
      setDraft(updated);
      setGuardianEditing(false);
      setGuardianVisible(false);
      setNotice("Đã lưu thông tin người bảo hộ.");
      void queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    } catch (error) { setNotice(toAppError(error).message); }
    finally { setSaving(false); }
  };

  const saveAvatar = async (avatarKey: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await studentProfileService.updateAvatar(avatarKey);
      if (!response.data) throw new Error("Không thể lấy avatar vừa lưu.");
      const updated = toViewProfile(response.data);
      setProfile(updated);
      setDraft(updated);
      setAvatarOpen(false);
      setNotice("Đã cập nhật ảnh đại diện.");
      void queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      toast.success("Ảnh đại diện đã được lưu.");
    } catch (error) {
      setNotice(toAppError(error).message);
      toast.error("Không thể lưu ảnh đại diện.");
    } finally { setSaving(false); }
  };
  return (
    <main className="min-h-screen bg-[#f7f4eb] text-[#2d2b2a] selection:bg-[#f3e88e]">
      <div className="mx-auto max-w-[1140px] px-4 pb-20 pt-8 sm:px-7 sm:pt-12">
        {/* HEADER: Scrapbook Tag & Title */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 -rotate-1 rounded-sm border-2 border-[#2d2b2a] bg-[#e8dec8] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0_#2d2b2a]">
              <Star size={13} fill="currentColor" className="text-[#d99b26]" />
              <span>Góc học tập</span>
              <span className="text-[#c85a32]">✦</span>
              <span>Hồ sơ học sinh</span>
            </div>
            <h1 className="student-page-title font-serif font-black tracking-tight">
              Nhật ký của{" "}
              <span className="relative inline-block text-[#c85a32]">
                {profile.fullName}
                <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-1 rounded-sm bg-[#f3e88e]/80" />
              </span>
            </h1>
            <p className="mt-1 font-mono text-xs text-[#6e6863]">
              ~ Nơi lưu lại từng trang hành trình rèn luyện mỗi ngày ~
            </p>
          </div>
          <span className="-rotate-1 rounded-[14px_4px_16px_5px/4px_16px_5px_14px] border-2 border-[#2d2b2a] bg-[#fff3db] px-3.5 py-1.5 font-mono text-xs font-bold text-[#c85a32] shadow-[2px_2px_0_#2d2b2a]">
            ✦ SỔ TAY CỦA BẠN
          </span>
        </header>

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#d9e8d4] px-4 py-3 font-mono text-xs font-bold text-[#2c5332] shadow-[3px_3px_0_#2d2b2a]"
          >
            <span>{notice}</span>
            <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* PROFILE HERO CARD: Polaroid + Quick Stats */}
        <PaperCard className="p-6 sm:p-8" hasTape={true} tapePosition="left">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* POLAROID AVATAR FRAME */}
            <div className="relative mx-auto w-fit md:mx-0">
              {/* Paperclip top right */}
              <div
                className="absolute -right-2 -top-3 z-10 h-8 w-4 rotate-12 rounded-full border-2 border-[#2d2b2a] bg-transparent"
                aria-hidden="true"
              />

              <div className="w-36 rotate-[-1.5deg] rounded-[4px] border-2 border-[#2d2b2a] bg-[#fffdf9] p-2.5 pb-5 shadow-[4px_4px_0_#2d2b2a] transition hover:rotate-0 sm:w-40">
                <div className="aspect-square overflow-hidden rounded-[2px] border border-[#2d2b2a]/20 bg-[#f7f4eb] p-2">
                  <img
                    src={avatarSrc(avatar.style, avatar.seed)}
                    alt="Ảnh đại diện học sinh"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-2 truncate text-center font-mono text-[11px] text-[#6e6863]">
                  {avatar.seed}
                </div>
              </div>

              <button
                onClick={() => setAvatarOpen(true)}
                aria-label="Đổi ảnh đại diện"
                title="Đổi avatar"
                className="absolute -bottom-2 -right-2 rounded-full border-2 border-[#2d2b2a] bg-[#d99b26] p-2 text-white shadow-[2px_2px_0_#2d2b2a] transition hover:scale-105"
              >
                <Pencil size={15} />
              </button>
            </div>

            {/* STUDENT CORE INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-[4px] border border-[#2d2b2a] bg-[#d9e8d4] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#2c5332]">
                  ✓ {profile.accountStatus}
                </span>
                <span className="rounded-[4px] border border-[#2d2b2a] bg-[#e8dec8] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#2d2b2a]">
                  Học sinh
                </span>
              </div>

              <h2 className="mt-2.5 font-serif text-2xl font-black tracking-tight text-[#2d2b2a] sm:text-3xl">
                {profile.fullName}
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#6e6863]">
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={15} /> Lớp {profile.currentClass.name} ·{" "}
                  {profile.currentClass.gradeName}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={15} /> Năm học{" "}
                  {profile.currentClass.academicYear}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#fff3db] px-3 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_#2d2b2a]">
                  <Star size={13} className="text-[#d99b26]" /> Cấp độ{" "}
                  {game.currentLevel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#ffe3d6] px-3 py-1 font-mono text-xs font-bold text-[#c85a32] shadow-[2px_2px_0_#2d2b2a]">
                  <Zap size={13} /> {number(game.lifetimeXp)} XP
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#e8dec8] px-3 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_#2d2b2a]">
                  <Flame size={13} className="text-[#c85a32]" /> Chuỗi{" "}
                  {game.currentStreak} ngày
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setTab("personal");
                setEditMode(true);
                setDraft(profile);
              }}
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#fffdf9] px-4 py-2 font-mono text-xs font-bold shadow-[3px_3px_0_#2d2b2a] transition hover:-translate-y-0.5 active:translate-y-0"
            >
              <Pencil size={14} /> Chỉnh sửa
            </button>
          </div>

          {/* LEVEL ROADMAP BAR (Hand-drawn look) */}
          <div className="relative mt-6 rounded-[16px_5px_18px_4px/4px_18px_4px_16px] border-2 border-[#2d2b2a] bg-[#fbf6ed] p-4 shadow-[2px_2px_0_#2d2b2a]">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className="flex items-center gap-2 text-xs font-black text-[#2d2b2a]">
                <TrendingUp size={16} className="text-[#c85a32]" />
                Tiến trình lên Cấp {game.currentLevel + 1}
              </span>
              <span className="text-xs font-bold text-[#8c827a]">
                {number(game.xpIntoCurrentLevel)} / {number(levelRange)} XP
              </span>
            </div>
            <div className="mt-2.5 h-3.5 overflow-hidden rounded-[8px] border-2 border-[#2d2b2a] bg-[#fffdf9]">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full rounded-r-[4px] bg-[#d99b26] transition-all"
              />
            </div>
            <p className="mt-2 font-mono text-[11px] text-[#6e6863]">
              Cần thêm <strong>{number(game.xpToNextLevel)} XP</strong> để thăng
              cấp · Mốc kế tiếp: {number(game.nextLevelRequiredXp)} XP tích lũy
            </p>
          </div>
        </PaperCard>

        {/* 4 SCRAPBOOK KPI CARDS */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <Kpi
            icon={Zap}
            label="Tổng tích lũy"
            value={`${number(game.lifetimeXp)} XP`}
            hint="Điểm rèn luyện trọn đời"
            color="bg-[#fff3db]"
            rotation="rotate-[-0.8deg]"
          />
          <Kpi
            icon={Flame}
            label="Chuỗi liên tục"
            value={`${game.currentStreak} ngày`}
            hint={game.qualifiedToday ? "✓ Hôm nay đã đạt" : "Chưa hoàn thành hôm nay"}
            color="bg-[#ffe3d6]"
            rotation="rotate-[0.8deg]"
          />
          <Kpi
            icon={Activity}
            label="Phiên luyện tập"
            value={number(learn.sessionTotal)}
            hint="Bài tập đã thực hiện"
            color="bg-[#d9e8d4]"
            rotation="rotate-[-0.5deg]"
          />
          <Kpi
            icon={ClipboardCheck}
            label="Nhiệm vụ nộp"
            value={`${learn.assignments.submitted}/${learn.assignments.assigned}`}
            hint="Tiến độ bài tập giao"
            color="bg-[#e8dec8]"
            rotation="rotate-[0.7deg]"
          />
        </div>

        {/* NAVIGATION TABS (Notebook Bookmarks) */}
        <nav
          aria-label="Phần hồ sơ"
          className="mt-8 flex gap-2 overflow-x-auto border-b-2 border-dashed border-[#2d2b2a] pb-3"
        >
          {tabList.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={cx(
                "inline-flex shrink-0 items-center gap-2 rounded-[14px_4px_16px_5px/4px_16px_5px_14px] px-4 py-2 font-mono text-xs font-bold transition",
                tab === id
                  ? "border-2 border-[#2d2b2a] bg-[#d99b26] text-white shadow-[3px_3px_0_#2d2b2a]"
                  : "border-2 border-transparent text-[#6e6863] hover:border-[#2d2b2a]/30 hover:bg-[#fffdf9]"
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* TAB CONTENT 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <PaperCard className="p-6">
                <SectionHeading
                  icon={BookOpen}
                  title="Tóm tắt học tập"
                  note="Tổng quan nhiệm vụ"
                />
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border border-[#2d2b2a]/40 bg-[#fbf6ed] p-3.5">
                    <div className="font-serif text-2xl font-black text-[#2d2b2a]">
                      {learn.sessionTotal}
                    </div>
                    <div className="mt-1 font-mono text-xs font-bold text-[#8c827a]">
                      Tổng số bài
                    </div>
                  </div>
                  <div className="rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border border-[#2d2b2a]/40 bg-[#fbf6ed] p-3.5">
                    <div className="font-serif text-2xl font-black text-[#6b8e67]">
                      {learn.sessionsCompleted}
                    </div>
                    <div className="mt-1 font-mono text-xs font-bold text-[#8c827a]">
                      Đã hoàn thành
                    </div>
                  </div>
                  <div className="col-span-2 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border border-[#2d2b2a]/40 bg-[#fbf6ed] p-3.5 sm:col-span-1">
                    <div className="font-serif text-2xl font-black text-[#c85a32]">
                      {learn.assignments.assigned}
                    </div>
                    <div className="mt-1 font-mono text-xs font-bold text-[#8c827a]">
                      Bài tập giao
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 font-mono">
                  {[
                    {
                      label: "Đã nộp",
                      count: learn.assignments.submitted,
                      color: "bg-[#6b8e67]",
                    },
                    {
                      label: "Chưa bắt đầu",
                      count: learn.assignments.notStarted,
                      color: "bg-[#d99b26]",
                    },
                    {
                      label: "Đang làm",
                      count: learn.assignments.inProgress,
                      color: "bg-[#4a6b82]",
                    },
                    {
                      label: "Nộp muộn / Quá hạn",
                      count:
                        learn.assignments.late,
                      color: "bg-[#c85a32]",
                    },
                  ].map((entry) => (
                    <div key={entry.label}>
                      <div className="mb-1 flex justify-between text-xs font-bold">
                        <span>{entry.label}</span>
                        <span>{entry.count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full border border-[#2d2b2a] bg-[#f7f4eb]">
                        <div
                          className={cx("h-full", entry.color)}
                          style={{
                            width: `${Math.min(
                              100,
                              (100 * entry.count) / Math.max(1, learn.assignments.assigned)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setTab("learning")}
                  className="mt-5 inline-flex items-center gap-1 font-mono text-xs font-bold text-[#c85a32] hover:underline"
                >
                  Xem chi tiết học tập <ArrowRight size={14} />
                </button>
              </PaperCard>

              {/* RECENT ACTIVITY LIST */}
              <PaperCard className="p-6">
                <SectionHeading
                  icon={Clock3}
                  title="Nhật ký gần đây"
                  note="Phiên rèn luyện"
                />
                <div className="mt-4 divide-y border-dashed border-[#e8dec8]">
                  {learn.activities.length === 0 && (
                    <p className="text-sm text-[#6e6863]">Chưa có phiên luyện tập nào.</p>
                  )}
                  {learn.activities.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border-2 border-[#2d2b2a] bg-[#fff3db] shadow-[1px_1px_0_#2d2b2a]">
                        <BookOpen size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-serif text-sm font-black text-[#2d2b2a]">
                          {item.name}
                        </div>
                        <div className="truncate font-mono text-[11px] text-[#8c827a]">
                          {item.unit} · {formatDate(item.date)}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs font-black text-[#2d2b2a]">
                          {item.correct}/{item.total} đúng
                        </div>
                        <div className="text-[11px] font-bold text-[#c85a32]">
                          {item.xp ? `+${item.xp} XP` : "Đang làm..."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PaperCard>
            </div>

            {/* RIGHT COLUMN: STREAK WIDGET & CLASS INFO */}
            <div className="space-y-6 lg:col-span-2">
              <PaperCard className="p-6" hasTape={true} tapePosition="right">
                <SectionHeading icon={Flame} title="Độ chăm chỉ" />
                <div className="mt-4 flex items-end gap-3 font-serif">
                  <span className="text-5xl font-black text-[#c85a32]">
                    {game.currentStreak}
                  </span>
                  <div className="pb-1 font-mono text-xs font-bold text-[#6e6863]">
                    ngày liên tiếp{" "}
                    <Flame size={15} className="inline text-[#c85a32]" />
                  </div>
                </div>
                <p className="mt-2 font-mono text-xs text-[#8c827a]">
                  Kỷ lục dài nhất:{" "}
                  <strong className="text-[#2d2b2a]">
                    {game.longestStreak} ngày
                  </strong>
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#2d2b2a] bg-[#d9e8d4] p-2.5 font-mono text-xs font-bold text-[#2c5332]">
                  <CheckCircle2 size={16} /> Hôm nay đã hoàn thành mục tiêu
                </div>
                <button
                  onClick={() => setTab("streak")}
                  className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-bold text-[#c85a32] hover:underline"
                >
                  Mở lịch chuỗi ngày học <ArrowRight size={14} />
                </button>
              </PaperCard>

              <PaperCard className="p-6">
                <SectionHeading icon={GraduationCap} title="Lớp & Trường" />
                <dl className="mt-2">
                  <Info label="Lớp học" value={profile.currentClass.name} />
                  <Info label="Khối" value={profile.currentClass.gradeName} />
                  <Info
                    label="Năm học"
                    value={profile.currentClass.academicYear}
                  />
                  <Info
                    label="Trạng thái"
                    value={profile.currentClass.status}
                  />
                </dl>
                <button
                  onClick={() => setTab("personal")}
                  className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-bold text-[#c85a32] hover:underline"
                >
                  Xem thông tin chi tiết <ArrowRight size={14} />
                </button>
              </PaperCard>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: LEARNING */}
        {tab === "learning" && (
          <div className="mt-6 space-y-6">
            <PaperCard className="p-6">
              <SectionHeading
                icon={Target}
                title="Tổng quan bài tập"
                note="Nhiệm vụ rèn luyện"
              />
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {[
                  { label: "Được giao", val: learn.assignments.assigned },
                  { label: "Đã nộp", val: learn.assignments.submitted },
                  { label: "Đang làm", val: learn.assignments.inProgress },
                  { label: "Chưa bắt đầu", val: learn.assignments.notStarted },
                  { label: "Nộp muộn", val: learn.assignments.late },
                    ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={cx(
                      "rounded-[14px_4px_16px_5px/4px_16px_5px_14px] border-2 border-[#2d2b2a] bg-[#fbf6ed] p-4 shadow-[2px_2px_0_#2d2b2a]",
                      idx % 2 === 0 ? "rotate-[-0.6deg]" : "rotate-[0.6deg]"
                    )}
                  >
                    <div className="font-serif text-2xl font-black text-[#2d2b2a]">
                      {item.val}
                    </div>
                    <div className="mt-1 font-mono text-xs font-bold text-[#8c827a]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 font-mono text-xs text-[#8c827a]">
                <CircleHelp size={16} className="shrink-0 text-[#d99b26]" />
                Thống kê bài được giao của học sinh.
              </p>
            </PaperCard>

            <PaperCard className="p-6">
              <SectionHeading
                icon={Activity}
                title="Chi tiết bài luyện tập gần đây"
                note="Nhật ký phiên học"
              />
              <div className="mt-4 space-y-3">
                {learn.activities.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3.5 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#fffdf9] p-4 shadow-[2px_2px_0_#2d2b2a]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[8px] border-2 border-[#2d2b2a] bg-[#e8dec8]">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-[170px] flex-1">
                      <div className="font-serif text-sm font-black text-[#2d2b2a]">
                        {item.name}
                      </div>
                      <div className="font-mono text-xs text-[#8c827a]">
                        {item.unit}
                      </div>
                      <div className="font-mono text-[11px] text-[#8c827a]">
                        {formatDate(item.date)} · {item.mode}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 font-mono">
                      <span
                        className={cx(
                          "rounded-[4px] border border-[#2d2b2a] px-2 py-0.5 text-[10px] font-bold",
                          item.status === "COMPLETED"
                            ? "bg-[#d9e8d4] text-[#2c5332]"
                            : "bg-[#fff3db] text-[#966c31]"
                        )}
                      >
                        {item.status === "COMPLETED" ? "Đã xong" : "Đang làm"}
                      </span>
                      <span className="text-xs font-black">
                        {item.correct}/{item.total} câu đúng
                      </span>
                      <span className="text-xs font-bold text-[#c85a32]">
                        {item.xp != null ? `+${item.xp} XP` : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PaperCard>
          </div>
        )}

        {/* TAB CONTENT 3: STREAK CALENDAR & MILESTONES */}
        {tab === "streak" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <PaperCard className="p-6 lg:col-span-3" hasTape={true}>
              <SectionHeading
                icon={CalendarDays}
                title="Lịch rèn luyện"
                note="Con dấu ngày học đạt chuẩn"
              />
              <div className="mt-5">
                <Calendar
                  month={month}
                  qualifiedDates={qualifiedDates}
                  todayDate={streak.todayDate}
                  move={(delta) =>
                    setMonth(
                      (m) => new Date(m.getFullYear(), m.getMonth() + delta, 1)
                    )
                  }
                />
              </div>
              <p className="mt-4 font-mono text-xs text-[#8c827a]">
                * Các ô đóng dấu xanh thể hiện ngày bạn có bài tập hợp lệ được
                tính vào chuỗi liên tục.
              </p>
            </PaperCard>

            <div className="space-y-6 lg:col-span-2">
              <PaperCard className="p-6">
                <SectionHeading icon={Flame} title="Thống kê chuỗi ngày" />
                <dl className="mt-2">
                  <Info
                    label="Chuỗi hiện tại"
                    value={`${game.currentStreak} ngày liên tiếp`}
                  />
                  <Info
                    label="Kỷ lục dài nhất"
                    value={`${game.longestStreak} ngày`}
                  />
                  <Info
                    label="Hôm nay đạt chuẩn?"
                    value={game.qualifiedToday ? "Đã hoàn thành ✓" : "Chưa hoàn thành"}
                  />
                  <Info
                    label="Ngày hoàn thành gần nhất"
                    value={formatDate(game.lastQualifiedDate)}
                  />
                </dl>
              </PaperCard>

              {/* STAMP MILESTONES */}
              <PaperCard className="p-6">
                <SectionHeading
                  icon={Award}
                  title="Mốc huy hiệu chuỗi"
                  note="Tem kỷ niệm"
                />
                <div className="mt-4 space-y-3 font-mono">
                  {milestones.map((m) => (
                    <div
                      key={m.days}
                      className="flex items-center justify-between gap-3 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#fbf6ed] p-3 shadow-[2px_2px_0_#2d2b2a]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cx(
                            "flex h-9 w-9 items-center justify-center rounded-[8px] border-2 border-[#2d2b2a]",
                            m.awarded ? "bg-[#d99b26] text-white" : "bg-[#e8dec8] text-[#8c827a]"
                          )}
                        >
                          <Award size={18} />
                        </span>
                        <div>
                          <div className="text-xs font-black text-[#2d2b2a]">
                            Mốc {m.days} ngày
                          </div>
                          <div className="text-[11px] font-bold text-[#c85a32]">
                            +{m.xp} XP thưởng
                          </div>
                        </div>
                      </div>
                      {m.awarded ? (
                        <span className="rounded-[4px] border border-[#2d2b2a] bg-[#d9e8d4] px-2 py-0.5 text-[10px] font-bold text-[#2c5332]">
                          Đã mở khóa
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-[#8c827a]">
                          Chưa mở
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </PaperCard>
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: PERSONAL & GUARDIANS */}
        {tab === "personal" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <PaperCard className="p-6" hasTape={true} tapePosition="left">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-[#e8dec8] pb-3">
                <SectionHeading icon={UserRound} title="Thông tin cá nhân" />
                <button
                  onClick={() => {
                    setDraft(profile);
                    setEditMode(!editMode);
                  }}
                  className="inline-flex items-center gap-1 rounded-[6px] border-2 border-[#2d2b2a] bg-[#fff3db] px-2.5 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_#2d2b2a] transition hover:bg-[#d99b26] hover:text-white"
                >
                  <Pencil size={12} />
                  {editMode ? "Hủy" : "Sửa"}
                </button>
              </div>

              {editMode ? (
                <div className="mt-4 space-y-3.5 font-mono text-xs font-bold">
                  <label className="block">
                    Họ và tên
                    <input
                      className="mt-1 w-full rounded-[10px_3px_12px_4px/3px_12px_4px_10px] border-2 border-[#2d2b2a] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#d99b26]"
                      value={draft.fullName}
                      onChange={(e) =>
                        setDraft({ ...draft, fullName: e.target.value })
                      }
                    />
                  </label>
                  <label className="block">
                    Số điện thoại
                    <input
                      className="mt-1 w-full rounded-[10px_3px_12px_4px/3px_12px_4px_10px] border-2 border-[#2d2b2a] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#d99b26]"
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft({ ...draft, phone: e.target.value })
                      }
                    />
                  </label>
                  <label className="block">
                    Ngày sinh
                    <input
                      type="date"
                      className="mt-1 w-full rounded-[10px_3px_12px_4px/3px_12px_4px_10px] border-2 border-[#2d2b2a] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#d99b26]"
                      value={draft.dateOfBirth}
                      onChange={(e) =>
                        setDraft({ ...draft, dateOfBirth: e.target.value })
                      }
                    />
                  </label>
                  <label className="block">
                    Giới tính
                    <select
                      className="mt-1 w-full rounded-[10px_3px_12px_4px/3px_12px_4px_10px] border-2 border-[#2d2b2a] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#d99b26]"
                      value={draft.gender}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          gender: e.target.value as Profile["gender"],
                        })
                      }
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </label>
                  <button
                    onClick={() => void saveDraft()}
                    disabled={!draft.fullName.trim() || saving}
                    className="inline-flex items-center gap-1.5 rounded-[12px_4px_14px_4px/4px_14px_4px_12px] border-2 border-[#2d2b2a] bg-[#6b8e67] px-4 py-2 font-mono text-xs font-bold text-white shadow-[2px_2px_0_#2d2b2a] transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    <Save size={14} /> Lưu thay đổi
                  </button>
                </div>
              ) : (
                <dl className="mt-3 grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                  <Info label="Họ và tên" value={profile.fullName} />
                  <Info label="Email" value={profile.email} />
                  <Info
                    label="Ngày sinh"
                    value={formatDate(profile.dateOfBirth)}
                  />
                  <Info label="Giới tính" value={genderLabel(profile.gender)} />
                  <Info label="Số điện thoại" value={profile.phone} />
                  <Info
                    label="Trạng thái tài khoản"
                    value={profile.accountStatus}
                  />
                </dl>
              )}
            </PaperCard>

            <div className="space-y-6">
              <PaperCard className="p-6">
                <SectionHeading
                  icon={GraduationCap}
                  title="Thông tin trường học"
                />
                <dl className="mt-3 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <Info
                    label="Lớp học"
                    value={profile.currentClass.name}
                  />
                  <Info label="Khối" value={profile.currentClass.gradeName} />
                  <Info
                    label="Năm học"
                    value={profile.currentClass.academicYear}
                  />
                  <Info
                    label="Tình trạng"
                    value={profile.currentClass.status}
                  />
                </dl>
              </PaperCard>

              {/* PRIVATE GUARDIAN: one displayed, server collection preserved on update */}
              <PaperCard className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SectionHeading icon={Users} title="Phụ huynh / Người bảo hộ" note="Riêng tư" />
                  <button type="button" aria-pressed={guardianVisible}
                    aria-label={guardianVisible ? "Ẩn thông tin người bảo hộ" : "Hiện thông tin người bảo hộ"}
                    onClick={() => { setGuardianVisible((old) => !old); setGuardianEditing(false); }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-[#2d2b2a] bg-[#e8dec8] px-3 font-mono text-xs font-bold">
                    {guardianVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    {guardianVisible ? "Ẩn" : "Hiện"}
                  </button>
                </div>
                {!guardianVisible ? (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-[#2d2b2a] bg-[#fbf6ed] p-4">
                    <LockKeyhole size={18} aria-hidden="true" />
                    <span className="text-sm font-semibold">Thông tin đang ẩn. Nhấn nút mắt để xem.</span>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {!guardianEditing && (
                      <div className="space-y-3">
                        {selectedGuardian && (
                          <div className="rounded-lg border border-[#2d2b2a] bg-[#fbf6ed] p-4">
                            <h3 className="font-serif text-base font-black">{selectedGuardian.fullName}</h3>
                            <p className="text-xs">{RELATIONSHIPS[selectedGuardian.relationship]}</p>
                            <p className="mt-2 text-sm">Điện thoại: {selectedGuardian.phone}</p>
                            <p className="text-sm">Email: {selectedGuardian.email || "Chưa cập nhật"}</p>
                          </div>
                        )}
                        <button type="button" onClick={() => {
                          setGuardianDraft(selectedGuardian ? guardianPayload(selectedGuardian) :
                            { relationship: "GUARDIAN", fullName: "", phone: "", email: "", primary: true });
                          setGuardianEditing(true);
                        }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#2d2b2a] bg-[#fff3db] px-3 text-sm font-bold">
                          <Pencil size={14} /> {selectedGuardian ? "Chỉnh sửa người bảo hộ" : "Thêm người bảo hộ"}
                        </button>
                      </div>
                    )}
                    {guardianEditing && (
                      <div className="space-y-3 rounded-lg border border-[#2d2b2a] bg-[#fffdf9] p-4">
                        <label className="block text-sm font-bold">Quan hệ
                          <select className="mt-1 min-h-11 w-full rounded-md border border-[#2d2b2a] bg-white px-3"
                            value={guardianDraft.relationship}
                            onChange={(e) => setGuardianDraft({ ...guardianDraft, relationship: e.target.value as GuardianRelationship })}>
                            {Object.entries(RELATIONSHIPS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-sm font-bold">Họ và tên
                          <input maxLength={150} required className="mt-1 min-h-11 w-full rounded-md border border-[#2d2b2a] bg-white px-3"
                            value={guardianDraft.fullName}
                            onChange={(e) => setGuardianDraft({ ...guardianDraft, fullName: e.target.value })} />
                        </label>
                        <label className="block text-sm font-bold">Điện thoại
                          <input type="tel" maxLength={30} required className="mt-1 min-h-11 w-full rounded-md border border-[#2d2b2a] bg-white px-3"
                            value={guardianDraft.phone}
                            onChange={(e) => setGuardianDraft({ ...guardianDraft, phone: e.target.value })} />
                        </label>
                        <label className="block text-sm font-bold">Email (tùy chọn)
                          <input type="email" maxLength={255} className="mt-1 min-h-11 w-full rounded-md border border-[#2d2b2a] bg-white px-3"
                            value={guardianDraft.email ?? ""}
                            onChange={(e) => setGuardianDraft({ ...guardianDraft, email: e.target.value })} />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" disabled={saving || !guardianDraft.fullName.trim() || !guardianDraft.phone.trim()}
                            onClick={() => void saveGuardian()}
                            className="min-h-11 rounded-lg border border-[#2d2b2a] bg-[#6b8e67] px-4 text-sm font-bold text-white disabled:opacity-50">
                            {saving ? "Đang lưu" : "Lưu người bảo hộ"}
                          </button>
                          <button type="button" disabled={saving} onClick={() => setGuardianEditing(false)}
                            className="min-h-11 rounded-lg border border-[#2d2b2a] bg-[#e8dec8] px-4 text-sm font-bold">Hủy</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3 flex items-start gap-1.5 font-mono text-[11px] text-[#6e6863]">
                  <ShieldCheck size={14} className="shrink-0 text-[#6b8e67]" />
                  Thông tin riêng tư. Chỉ hiển thị sau khi bạn bật nút mắt.
                </div>
              </PaperCard>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[#2d2b2a] pt-5 font-mono text-xs font-semibold text-[#8c827a]">
          <span>✂ Nhật ký học tập · Hồ sơ học sinh</span>
          <span>~ Dữ liệu học tập cá nhân ~</span>
        </footer>
      </div>

      {/* AVATAR SELECTOR MODAL */}
      {avatarOpen && (
        <AvatarDialog
          current={profile.avatarKey}
          onClose={() => setAvatarOpen(false)}
          onSave={(avatarKey) => void saveAvatar(avatarKey)}
        />
      )}
    </main>
  );
}

export default function StudentProfilePage() {
  const identity = useQuery({
    queryKey: ["student-profile"],
    queryFn: studentProfileService.get,
  });
  const level = useQuery({
    queryKey: QUERY_KEYS.studentGamificationProfile,
    queryFn: studentGamificationService.profile,
  });
  const streak = useQuery({
    queryKey: QUERY_KEYS.studentStreak,
    queryFn: studentGamificationService.streak,
  });
  const learning = useQuery({
    queryKey: ["student", "profile", "learning"],
    queryFn: studentProfileService.learningOverview,
  });
  const todo = useQuery({
    queryKey: ["student", "profile", "assignments", "TODO"],
    queryFn: () => studentAssignmentService.getAssignments("TODO"),
  });
  const inProgress = useQuery({
    queryKey: ["student", "profile", "assignments", "IN_PROGRESS"],
    queryFn: () => studentAssignmentService.getAssignments("IN_PROGRESS"),
  });
  const submitted = useQuery({
    queryKey: ["student", "profile", "assignments", "SUBMITTED"],
    queryFn: () => studentAssignmentService.getAssignments("SUBMITTED"),
  });
  const queries = [identity, level, streak, learning, todo, inProgress, submitted];
  if (queries.some((q) => q.isPending)) {
    return <FullPageState variant="loading" title="Đang mở sổ tay học tập..." />;
  }
  const profile = identity.data?.data;
  const game = level.data?.data;
  const run = streak.data?.data;
  const learningData = learning.data?.data;
  if (queries.some((q) => q.isError) || !profile || !game || !run || !learningData) {
    return (
      <RegionState variant="error" title="Chưa thể tải đầy đủ hồ sơ"
        description="Thông tin được lấy từ dữ liệu thật, không thay bằng số liệu demo." />
    );
  }
  const todos = todo.data ?? [];
  const progress = inProgress.data ?? [];
  const submittedItems = submitted.data ?? [];
  const all = [...todos, ...progress, ...submittedItems];
  const learn: LearningData = {
    sessionTotal: learningData.sessionTotal,
    sessionsCompleted: learningData.sessionsCompleted,
    assignments: {
      assigned: all.length,
      submitted: submittedItems.length,
      late: all.filter((item) => item.late).length,
      notStarted: todos.length,
      inProgress: progress.length,
      timedOut: 0,
    },
    activities: learningData.activities,
  };
  return (
    <StudentProfileContent key={profile.userId}
      initialProfile={profile} game={game} streak={run} learn={learn} />
  );
}
