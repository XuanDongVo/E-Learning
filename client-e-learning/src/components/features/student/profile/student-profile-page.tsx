"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  StudentProfile,
  StudentRecentSession,
} from "@/types/student/profile";
import type {
  Gender,
  GuardianRelationship,
  StudentGuardianRequest,
} from "@/types/student";
import type {
  StudentGamificationOverview,
  StudentStreakOverview,
} from "@/types/gamification";
import { studentProfileService } from "@/services/student/student-profile.service";
import { studentGamificationService } from "@/services/student/student-gamification.service";
import { studentAssignmentService } from "@/services/student/student-assignment.service";
import { QUERY_KEYS } from "@/services/query-keys";
import { FullPageState, RegionState } from "@/components/feedback";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { SketchProgress } from "@/components/student-ui/sketch-progress";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toAppError } from "@/lib/errors/app-error";
import { formatDate } from "@/utils/format";
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
  Eye,
  EyeOff,
  Flame,
  GraduationCap,
  LockKeyhole,
  Pencil,
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
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  avatarKey: string;
  currentClass: NonNullable<StudentProfile["currentClass"]>;
};
type Tab = "overview" | "learning" | "streak" | "personal";
type LearningData = {
  sessionTotal: number;
  sessionsCompleted: number;
  assignments: {
    assigned: number;
    submitted: number;
    late: number;
    notStarted: number;
    inProgress: number;
    timedOut: number;
  };
  activities: StudentRecentSession[];
};
function toViewProfile(raw: StudentProfile): Profile {
  return {
    ...raw,
    dateOfBirth: raw.dateOfBirth ?? "",
    gender: raw.gender ?? "OTHER",
    phone: raw.phone ?? "",
    avatarKey: raw.avatarKey ?? `dicebear:adventurer:${raw.userId}`,
    currentClass: raw.currentClass ?? {
      id: 0,
      name: "—",
      gradeId: 0,
      gradeName: "—",
      academicYear: "—",
      status: "INACTIVE",
    },
  };
}
const RELATIONSHIPS: Record<GuardianRelationship, string> = {
  FATHER: "Bố",
  MOTHER: "Mẹ",
  GUARDIAN: "Người giám hộ",
  OTHER: "Khác",
};
function guardianPayload(
  g: Profile["guardians"][number],
): StudentGuardianRequest {
  return {
    id: g.id,
    relationship: g.relationship,
    fullName: g.fullName,
    phone: g.phone,
    email: g.email ?? "",
    primary: g.primary,
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
  return (
    <PaperSurface
      as="section"
      tape={hasTape}
      tapePosition={tapePosition}
      className={className}
    >
      {children}
    </PaperSurface>
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
    <div className="flex flex-wrap items-center justify-between gap-5 border-b-2 border-dashed border-secondary pb-3">
      <h2 className="student-section-title flex items-center gap-3 text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink bg-background shadow-pop-sm">
          <Icon size={16} />
        </span>
        {title}
      </h2>
      {note && (
        <span className=" student-meta font-semibold text-muted-foreground">
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
        "relative rounded-2xl border-2 border-ink p-5 shadow-pop",
        color,
        rotation,
      )}
    >
      <div className="mb-2 flex items-center justify-between ">
        <span className="student-meta font-bold text-muted-foreground">
          {label}
        </span>
        <Icon size={16} className="text-foreground" />
      </div>
      <div className="student-stat text-foreground">{value}</div>
      <div className="mt-1 student-meta font-semibold text-muted-foreground">
        {hint}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 border-b border-dashed border-secondary py-3 last:border-0">
      <dt className=" student-meta font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words student-body font-bold text-foreground">
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
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [draftSeed]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="student-avatar-dialog" showCloseButton={false}>
        <span className="student-washi" aria-hidden="true" />
        <DialogHeader className="border-b-2 border-dashed border-secondary pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="student-meta text-primary">
                Xưởng phác thảo chân dung
              </p>
              <DialogTitle className="student-section-title mt-1 text-foreground">
                Chọn avatar của bạn{" "}
                <Sparkles className="inline text-accent" size={22} />
              </DialogTitle>
              <DialogDescription className="student-body mt-1 text-muted-foreground">
                Gõ từ khóa để xem avatar thay đổi qua 10 phong cách.
              </DialogDescription>
            </div>
            <DialogClose
              className="student-control student-control--quiet grid size-11 shrink-0 place-items-center rounded-full shadow-pop-sm"
              aria-label="Đóng"
            >
              <X size={16} />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              aria-label="Từ khóa avatar"
              className="student-field !px-[30px]"
              value={draftSeed}
              maxLength={40}
              placeholder="Thử gõ: alice, luna, robot..."
              onChange={(e) => setDraftSeed(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              setDraftSeed(Math.random().toString(36).slice(2, 10))
            }
            className="student-control student-control--secondary px-4 inline-flex flex-row items-center justify-center gap-1.5 sm:w-auto"
          >
            <RefreshCw size={16} /> Xúc xắc hạt giống
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {AVATAR_STYLES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              aria-pressed={style === s.id}
              className={cx(
                "group relative rounded-2xl border-2 p-3 text-center transition hover:-translate-y-0.5",
                idx % 2 === 0 ? "-rotate-1" : "rotate-1",
                style === s.id
                  ? "border-ink bg-warning-soft shadow-pop"
                  : "border-border bg-card hover:border-ink",
              )}
            >
              <div className="overflow-hidden rounded-lg border border-border bg-background p-2">
                <img
                  src={avatarSrc(s.id, seed)}
                  alt={`${s.name} avatar`}
                  loading="lazy"
                  className="aspect-square w-full object-contain"
                />
              </div>
              {style === s.id && (
                <CheckCircle2
                  size={16}
                  className="absolute right-2 top-2 rounded-full bg-primary text-primary-foreground"
                />
              )}
              <span className="mt-2 block truncate student-handwriting student-meta font-bold text-foreground">
                {s.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border-2 border-ink bg-secondary p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl border-2 border-ink bg-card p-1 shadow-pop-sm">
              <img
                src={avatarSrc(style, seed)}
                alt="Avatar đã chọn"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className=" student-meta text-muted-foreground">
                Lựa chọn hiện tại
              </div>
              <div className="student-handwriting student-body font-black text-foreground">
                {AVATAR_STYLES.find((s) => s.id === style)?.name}
              </div>
              <div className="max-w-48 truncate student-meta text-muted-foreground">
                seed: {seed}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSave(`dicebear:${style}:${seed}`)}
            className="student-control student-control--action w-full px-5 sm:w-auto"
          >
            <Check size={16} /> Dán vào hồ sơ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Lịch học tập tem đóng dấu */
function Calendar({
  month,
  move,
  qualifiedDates,
  todayDate,
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
      <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-secondary pb-3">
        <h3 className="student-handwriting student-card-title font-black capitalize text-foreground">
          {label}
        </h3>
        <div className="flex gap-2">
          <button
            aria-label="Tháng trước"
            onClick={() => move(-1)}
            className="student-control student-control--quiet grid size-11 place-items-center shadow-pop-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            aria-label="Tháng sau"
            onClick={() => move(1)}
            className="student-control student-control--quiet grid size-11 place-items-center shadow-pop-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center student-meta font-bold text-muted-foreground">
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
                "flex aspect-square items-center justify-center rounded-lg border-2 student-meta font-bold ",
                day === null
                  ? "border-transparent"
                  : isQualified
                    ? "border-ink bg-success-soft text-success shadow-pop-sm"
                    : "border-border bg-muted text-muted-foreground",
                isToday && "ring-2 ring-primary ring-offset-1 font-black",
              )}
              title={isQualified ? "Ngày học đạt chuẩn streak" : undefined}
            >
              {day ?? ""}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 student-meta font-semibold text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-ink bg-success-soft shadow-pop-sm" />
          Đã đạt chuẩn streak
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-border bg-muted" />
          Chưa có bài học
        </span>
      </div>
    </div>
  );
}

function StudentProfileContent({
  initialProfile,
  game,
  streak,
  learn,
}: {
  initialProfile: StudentProfile;
  game: StudentGamificationOverview;
  streak: StudentStreakOverview;
  learn: LearningData;
}) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile>(() =>
    toViewProfile(initialProfile),
  );

  const [tab, setTab] = useState<Tab>("overview");
  const tabsRef = useRef<HTMLElement>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Profile>(() =>
    toViewProfile(initialProfile),
  );
  const [month, setMonth] = useState(() => {
    const [year, m] = streak.todayDate.split("-").map(Number);
    return new Date(year, m - 1, 1);
  });
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [guardianVisible, setGuardianVisible] = useState(false);
  const [guardianEditing, setGuardianEditing] = useState(false);
  const selectedGuardian =
    profile.guardians.find((g) => g.primary) ?? profile.guardians[0];
  const [guardianDraft, setGuardianDraft] = useState<StudentGuardianRequest>(
    selectedGuardian
      ? guardianPayload(selectedGuardian)
      : {
          relationship: "GUARDIAN",
          fullName: "",
          phone: "",
          email: "",
          primary: true,
        },
  );
  const email = guardianDraft.email?.trim() ?? "";

  const isEmailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const qualifiedDates = useMemo(
    () => new Set(streak.qualifiedDates),
    [streak.qualifiedDates],
  );
  const milestones = streak.milestones;
  const avatar = useMemo(
    () => parseAvatar(profile.avatarKey),
    [profile.avatarKey],
  );

  const levelRange = Math.max(
    0,
    game.nextLevelRequiredXp - game.currentLevelStartXp,
  );

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
        fullName: draft.fullName.trim(),
        dateOfBirth: draft.dateOfBirth || undefined,
        gender: draft.gender,
        phone: draft.phone.trim(),
      });
      if (!response.data) throw new Error("Không thể lấy hồ sơ vừa lưu.");
      const updated = toViewProfile(response.data);
      setProfile(updated);
      setDraft(updated);
      setEditMode(false);
      setNotice("Đã cập nhật hồ sơ cá nhân.");
      void queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    } catch (error) {
      setNotice(toAppError(error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveGuardian = async () => {
    if (saving) return;
    const fullName = guardianDraft.fullName.trim();
    const phone = guardianDraft.phone.trim();
    if (!fullName || !phone) {
      setNotice("Vui lòng nhập họ tên và số điện thoại người bảo hộ.");
      return;
    }
    if (!isEmailValid) {
      setNotice("Vui lòng nhập email hợp lệ.");
      return;
    }
    // Existing backend PUT replaces guardians; preserve every non-selected record.
    const guardians = profile.guardians.map(guardianPayload);
    const index = selectedGuardian
      ? guardians.findIndex((item) => item.id === selectedGuardian.id)
      : -1;
    const modified = {
      ...guardianDraft,
      fullName,
      phone,
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
    } catch (error) {
      setNotice(toAppError(error).message);
    } finally {
      setSaving(false);
    }
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
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="student-profile text-foreground selection:bg-marker">
      <div className="mx-auto max-w-6xl pb-12">
        {/* HEADER: Scrapbook Tag & Title */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 -rotate-1 rounded-sm border-2 border-ink bg-secondary px-3 py-1 student-meta font-bold shadow-pop-sm">
              <Star size={16} fill="currentColor" className="text-accent" />
              <span>Góc học tập</span>
              <span className="text-primary">✦</span>
              <span>Hồ sơ học sinh</span>
            </div>
            <h1 className="student-page-title">
              Nhật ký của{" "}
              <span className="relative inline-block text-primary">
                {profile.fullName}
                <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-1 rounded-sm bg-marker/80" />
              </span>
            </h1>
            <p className="mt-1 student-meta text-muted-foreground">
              ~ Nơi lưu lại từng trang hành trình rèn luyện mỗi ngày ~
            </p>
          </div>
          <span className="-rotate-1 rounded-xl border-2 border-ink bg-warning-soft px-4 py-2 student-meta font-bold text-primary shadow-pop-sm">
            ✦ Sổ tay của bạn
          </span>
        </header>

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-success-soft px-4 py-3 student-meta font-bold text-success shadow-pop"
          >
            <span>{notice}</span>
            <button
              className="grid size-11 place-items-center"
              aria-label="Đóng thông báo"
              onClick={() => setNotice("")}
            >
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
                className="absolute -right-2 -top-3 z-10 h-8 w-4 rotate-12 rounded-full border-2 border-ink bg-transparent"
                aria-hidden="true"
              />

              <div className="w-36 -rotate-1 rounded-sm border-2 border-ink bg-card p-3 pb-5 shadow-pop transition hover:rotate-0 sm:w-40">
                <div className="aspect-square overflow-hidden rounded-sm border border-border bg-background p-2">
                 {profile.avatarKey && (
                    <img
                      src={avatarSrc(avatar.style, avatar.seed)}
                      alt="Ảnh đại diện học sinh"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={() => setAvatarOpen(true)}
                aria-label="Đổi ảnh đại diện"
                title="Đổi avatar"
                className="student-control student-control--accent absolute -bottom-2 -right-2 grid size-11 place-items-center rounded-full shadow-pop-sm"
              >
                <Pencil size={16} />
              </button>
            </div>

            {/* STUDENT CORE INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-ink bg-success-soft px-3 py-1 student-caption font-bold text-success">
                  ✓ {profile.accountStatus}
                </span>
                <span className="rounded-sm border border-ink bg-secondary px-3 py-1 student-caption font-bold text-foreground">
                  Học sinh
                </span>
              </div>

              <h2 className="student-section-title mt-3 text-foreground">
                {profile.fullName}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 student-meta text-muted-foreground">
                <span className="flex items-center gap-2">
                  <GraduationCap size={16} /> Lớp {profile.currentClass.name} ·{" "}
                  {profile.currentClass.gradeName}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} /> Năm học{" "}
                  {profile.currentClass.academicYear}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-warning-soft px-3 py-1 student-meta font-bold shadow-pop-sm">
                  <Star size={16} className="text-accent" /> Cấp độ{" "}
                  {game.currentLevel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-primary-soft px-3 py-1 student-meta font-bold text-primary shadow-pop-sm">
                  <Zap size={16} /> {number(game.lifetimeXp)} XP
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-secondary px-3 py-1 student-meta font-bold shadow-pop-sm">
                  <Flame size={16} className="text-primary" /> Chuỗi{" "}
                  {game.currentStreak} ngày
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setTab("personal");
                setEditMode(true);
                setDraft(profile);
                window.requestAnimationFrame(() => {
                  tabsRef.current?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "auto"
                      : "smooth",
                    block: "start",
                  });
                });
              }}
              className="student-control student-control--secondary self-start px-4 inline-flex flex-row items-center justify-center gap-1.5"
            >
              <Pencil size={16} className="shrink-0" />
              <span>Chỉnh sửa</span>
            </button>
          </div>

          {/* LEVEL ROADMAP BAR (Hand-drawn look) */}
          <div className="relative mt-6 rounded-2xl border-2 border-ink bg-muted p-4 shadow-pop-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 ">
              <span className="flex items-center gap-2 student-meta font-black text-foreground">
                <TrendingUp size={16} className="text-primary" />
                Tiến trình lên Cấp {game.currentLevel + 1}
              </span>
              <span className="student-meta font-bold text-muted-foreground">
                {number(game.xpIntoCurrentLevel)} / {number(levelRange)} XP
              </span>
            </div>
            <SketchProgress
              className="mt-3"
              value={game.xpIntoCurrentLevel}
              max={levelRange}
              label={`Tiến trình lên Cấp ${game.currentLevel + 1}`}
            />
            <p className="mt-2 student-meta text-muted-foreground">
              Cần thêm <strong>{number(game.xpToNextLevel)} XP</strong> để thăng
              cấp · Mốc kế tiếp: {number(game.nextLevelRequiredXp)} XP tích lũy
            </p>
          </div>
        </PaperCard>

        {/* 4 SCRAPBOOK KPI CARDS */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi
            icon={Zap}
            label="Tổng tích lũy"
            value={`${number(game.lifetimeXp)} XP`}
            hint="Điểm rèn luyện trọn đời"
            color="bg-warning-soft"
            rotation="-rotate-1"
          />
          <Kpi
            icon={Flame}
            label="Chuỗi liên tục"
            value={`${game.currentStreak} ngày`}
            hint={
              game.qualifiedToday
                ? "✓ Hôm nay đã đạt"
                : "Chưa hoàn thành hôm nay"
            }
            color="bg-primary-soft"
            rotation="rotate-1"
          />
          <Kpi
            icon={Activity}
            label="Phiên luyện tập"
            value={number(learn.sessionTotal)}
            hint="Bài tập đã thực hiện"
            color="bg-success-soft"
            rotation="-rotate-1"
          />
          <Kpi
            icon={ClipboardCheck}
            label="Nhiệm vụ nộp"
            value={`${learn.assignments.submitted}/${learn.assignments.assigned}`}
            hint="Tiến độ bài tập giao"
            color="bg-secondary"
            rotation="rotate-1"
          />
        </div>

        {/* NAVIGATION TABS (Notebook Bookmarks) */}
        <nav
          ref={tabsRef}
          aria-label="Phần hồ sơ"
          className="mt-8 flex scroll-mt-6 gap-2 overflow-x-auto border-b-2 border-dashed border-ink pb-3"
        >
          {tabList.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={cx(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2 student-meta font-bold transition",
                tab === id
                  ? "border-2 border-ink bg-accent text-accent-foreground shadow-pop"
                  : "border-2 border-transparent text-muted-foreground hover:border-border hover:bg-card",
              )}
            >
              <Icon size={16} />
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
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <div className="student-stat text-foreground">
                      {learn.sessionTotal}
                    </div>
                    <div className="mt-1 student-meta font-bold text-muted-foreground">
                      Tổng số bài
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <div className="student-stat text-success">
                      {learn.sessionsCompleted}
                    </div>
                    <div className="mt-1 student-meta font-bold text-muted-foreground">
                      Đã hoàn thành
                    </div>
                  </div>
                  <div className="col-span-2 rounded-xl border border-border bg-muted p-4 sm:col-span-1">
                    <div className="student-stat text-primary">
                      {learn.assignments.assigned}
                    </div>
                    <div className="mt-1 student-meta font-bold text-muted-foreground">
                      Bài tập giao
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 ">
                  {[
                    {
                      label: "Đã nộp",
                      count: learn.assignments.submitted,
                      color: "bg-success",
                    },
                    {
                      label: "Chưa bắt đầu",
                      count: learn.assignments.notStarted,
                      color: "bg-accent",
                    },
                    {
                      label: "Đang làm",
                      count: learn.assignments.inProgress,
                      color: "bg-learning",
                    },
                    {
                      label: "Nộp muộn / Quá hạn",
                      count: learn.assignments.late,
                      color: "bg-primary",
                    },
                  ].map((entry) => (
                    <div key={entry.label}>
                      <div className="mb-1 flex justify-between student-meta font-bold">
                        <span>{entry.label}</span>
                        <span>{entry.count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full border border-ink bg-background">
                        <div
                          className={cx("h-full", entry.color)}
                          style={{
                            width: `${Math.min(
                              100,
                              (100 * entry.count) /
                                Math.max(1, learn.assignments.assigned),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setTab("learning")}
                  className="mt-5 inline-flex min-h-11 items-center gap-1 student-label text-primary hover:underline"
                >
                  Xem chi tiết học tập <ArrowRight size={16} />
                </button>
              </PaperCard>

              {/* RECENT ACTIVITY LIST */}
              <PaperCard className="p-6">
                <SectionHeading
                  icon={Clock3}
                  title="Nhật ký gần đây"
                  note="Phiên rèn luyện"
                />
                <div className="mt-4 divide-y border-dashed border-secondary">
                  {learn.activities.length === 0 && (
                    <p className="student-body text-muted-foreground">
                      Chưa có phiên luyện tập nào.
                    </p>
                  )}
                  {learn.activities.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink bg-warning-soft shadow-pop-sm">
                        <BookOpen size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate student-handwriting student-body font-black text-foreground">
                          {item.name}
                        </div>
                        <div className="truncate student-meta text-muted-foreground">
                          {item.unit} · {formatDate(item.date)}
                        </div>
                      </div>
                      <div className="text-right ">
                        <div className="student-meta font-black text-foreground">
                          {item.correct}/{item.total} đúng
                        </div>
                        <div className="student-meta font-bold text-primary">
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
                <div className="mt-4 flex items-end gap-3 student-handwriting">
                  <span className="student-stat font-black text-primary">
                    {game.currentStreak}
                  </span>
                  <div className="pb-1 student-meta font-bold text-muted-foreground">
                    ngày liên tiếp{" "}
                    <Flame size={16} className="inline text-primary" />
                  </div>
                </div>
                <p className="mt-2 student-meta text-muted-foreground">
                  Kỷ lục dài nhất:{" "}
                  <strong className="text-foreground">
                    {game.longestStreak} ngày
                  </strong>
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-ink bg-success-soft p-3 student-meta font-bold text-success">
                  <CheckCircle2 size={16} /> Hôm nay đã hoàn thành mục tiêu
                </div>
                <button
                  onClick={() => setTab("streak")}
                  className="mt-4 inline-flex min-h-11 items-center gap-1 student-label text-primary hover:underline"
                >
                  Mở lịch chuỗi ngày học <ArrowRight size={16} />
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
                  className="mt-3 inline-flex min-h-11 items-center gap-1 student-label text-primary hover:underline"
                >
                  Xem thông tin chi tiết <ArrowRight size={16} />
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
                      "rounded-xl border-2 border-ink bg-muted p-4 shadow-pop-sm",
                      idx % 2 === 0 ? "-rotate-1" : "rotate-1",
                    )}
                  >
                    <div className="student-stat text-foreground">
                      {item.val}
                    </div>
                    <div className="mt-1 student-meta font-bold text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 student-meta text-muted-foreground">
                <CircleHelp size={16} className="shrink-0 text-accent" />
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
                    className="flex flex-wrap items-center gap-4 rounded-xl border-2 border-ink bg-card p-4 shadow-pop-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink bg-secondary">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-44 flex-1">
                      <div className="student-handwriting student-body font-black text-foreground">
                        {item.name}
                      </div>
                      <div className=" student-meta text-muted-foreground">
                        {item.unit}
                      </div>
                      <div className=" student-meta text-muted-foreground">
                        {formatDate(item.date)} · {item.mode}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ">
                      <span
                        className={cx(
                          "rounded-sm border border-ink px-2 py-1 student-caption font-bold",
                          item.status === "COMPLETED"
                            ? "bg-success-soft text-success"
                            : "bg-warning-soft text-warning",
                        )}
                      >
                        {item.status === "COMPLETED" ? "Đã xong" : "Đang làm"}
                      </span>
                      <span className="student-meta font-black">
                        {item.correct}/{item.total} câu đúng
                      </span>
                      <span className="student-meta font-bold text-primary">
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
                      (m) => new Date(m.getFullYear(), m.getMonth() + delta, 1),
                    )
                  }
                />
              </div>
              <p className="mt-4 student-meta text-muted-foreground">
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
                    value={
                      game.qualifiedToday
                        ? "Đã hoàn thành ✓"
                        : "Chưa hoàn thành"
                    }
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
                <div className="mt-4 space-y-3 ">
                  {milestones.map((m) => (
                    <div
                      key={m.days}
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-muted p-3 shadow-pop-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cx(
                            "flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink",
                            m.awarded
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          <Award size={16} />
                        </span>
                        <div>
                          <div className="student-meta font-black text-foreground">
                            Mốc {m.days} ngày
                          </div>
                          <div className="student-meta font-bold text-primary">
                            +{m.xp} XP thưởng
                          </div>
                        </div>
                      </div>
                      {m.awarded ? (
                        <span className="rounded-sm border border-ink bg-success-soft px-2 py-1 student-caption font-bold text-success">
                          Đã mở khóa
                        </span>
                      ) : (
                        <span className=" student-caption font-bold text-muted-foreground">
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-secondary pb-3">
                <SectionHeading icon={UserRound} title="Thông tin cá nhân" />
                <button
                  onClick={() => {
                    setDraft(profile);
                    setEditMode(!editMode);
                  }}
                  className="student-control student-control--secondary px-3 inline-flex flex-row items-center justify-center gap-1.5"
                >
                  <Pencil size={16} />
                  {editMode ? "Hủy" : "Sửa"}
                </button>
              </div>

              {editMode ? (
                <div className="mt-4 space-y-4">
                  <label className="student-label block">
                    Họ và tên
                    <input
                      className="student-field mt-1"
                      value={draft.fullName}
                      onChange={(e) =>
                        setDraft({ ...draft, fullName: e.target.value })
                      }
                    />
                  </label>
                  <label className="student-label block">
                    Số điện thoại
                    <input
                      className="student-field mt-1"
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft({ ...draft, phone: e.target.value })
                      }
                    />
                  </label>
                  <label className="student-label block">
                    Ngày sinh
                    <input
                      type="date"
                      className="student-field mt-1"
                      value={draft.dateOfBirth}
                      onChange={(e) =>
                        setDraft({ ...draft, dateOfBirth: e.target.value })
                      }
                    />
                  </label>
                  <label className="student-label block">
                    Giới tính
                    <select
                      className="student-field mt-1"
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
                    className="student-control student-control--action px-4"
                  >
                    <Save size={16} /> Lưu thay đổi
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
                  <Info label="Lớp học" value={profile.currentClass.name} />
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
                  <SectionHeading
                    icon={Users}
                    title="Người bảo hộ"
                    note="Riêng tư"
                  />
                  <button
                    type="button"
                    aria-pressed={guardianVisible}
                    aria-label={
                      guardianVisible
                        ? "Ẩn thông tin người bảo hộ"
                        : "Hiện thông tin người bảo hộ"
                    }
                    onClick={() => {
                      setGuardianVisible((old) => !old);
                      setGuardianEditing(false);
                    }}
                    className="student-control student-control--secondary px-3 inline-flex flex-row items-center justify-center gap-1.5 "
                  >
                    {guardianVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    {guardianVisible ? "Ẩn" : "Hiện"}
                  </button>
                </div>
                {!guardianVisible ? (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-ink bg-muted p-4">
                    <LockKeyhole size={16} aria-hidden="true" />
                    <span className="student-body font-semibold">
                      Thông tin đang ẩn. Nhấn nút mắt để xem.
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {!guardianEditing && (
                      <div className="space-y-3">
                        {selectedGuardian && (
                          <div className="rounded-xl border-2 border-ink bg-panel p-4 shadow-[2px_2px_0px_var(--student-ink,#18181b)]">
                            <div className="flex items-center justify-between gap-2 border-b border-ink/15 pb-2.5">
                              <h3 className="student-body">
                                {selectedGuardian.fullName}
                              </h3>
                              <span className="rounded-md border border-ink bg-mustard px-2 py-0.5 text-meta font-bold text-ink shadow-[1px_1px_0px_var(--student-ink,#18181b)]">
                                {RELATIONSHIPS[selectedGuardian.relationship]}
                              </span>
                            </div>

                            {/* Thông tin liên hệ */}
                            <div className="mt-2.5 space-y-1.5 text-sm">
                              <div className="flex items-center justify-between ">
                                <span className="student-body">
                                  Điện thoại:
                                </span>
                                <span className="student-body">
                                  {selectedGuardian.phone}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="student-body">Email:</span>
                                <span className="text-ink font-medium">
                                  {selectedGuardian.email || (
                                    <span className="student-body">
                                      Chưa cập nhật
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setGuardianDraft(
                              selectedGuardian
                                ? guardianPayload(selectedGuardian)
                                : {
                                    relationship: "GUARDIAN",
                                    fullName: "",
                                    phone: "",
                                    email: "",
                                    primary: true,
                                  },
                            );
                            setGuardianEditing(true);
                          }}
                          className="student-control student-control--secondary inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-bold"
                        >
                          <Pencil size={15} className="shrink-0" />
                          <span>
                            {selectedGuardian
                              ? "Chỉnh sửa người bảo hộ"
                              : "Thêm người bảo hộ"}
                          </span>
                        </button>
                      </div>
                    )}
                    {guardianEditing && (
                      <div className="space-y-3 rounded-lg border border-ink bg-card p-4">
                        <label className="student-label block">
                          Quan hệ
                          <select
                            className="student-field mt-1"
                            value={guardianDraft.relationship}
                            onChange={(e) =>
                              setGuardianDraft({
                                ...guardianDraft,
                                relationship: e.target
                                  .value as GuardianRelationship,
                              })
                            }
                          >
                            {Object.entries(RELATIONSHIPS).map(
                              ([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className="student-label block">
                          Họ và tên
                          <input
                            maxLength={150}
                            required
                            className="student-field mt-1"
                            value={guardianDraft.fullName}
                            onChange={(e) =>
                              setGuardianDraft({
                                ...guardianDraft,
                                fullName: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="student-label block">
                          Điện thoại
                          <input
                            type="tel"
                            maxLength={30}
                            required
                            className="student-field mt-1"
                            value={guardianDraft.phone}
                            onChange={(e) =>
                              setGuardianDraft({
                                ...guardianDraft,
                                phone: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="student-label block">
                          Email (tùy chọn)
                          <input
                            type="email"
                            maxLength={255}
                            className="student-field mt-1"
                            value={guardianDraft.email ?? ""}
                            onChange={(e) =>
                              setGuardianDraft({
                                ...guardianDraft,
                                email: e.target.value,
                              })
                            }
                            aria-invalid={!isEmailValid}
                            aria-describedby={
                              !isEmailValid ? "guardian-email-error" : undefined
                            }
                          />
                          {!isEmailValid && (
                            <span
                              id="guardian-email-error"
                              role="alert"
                              className="mt-1 block student-meta font-medium text-destructive"
                            >
                              Email không hợp lệ. Ví dụ: parent@gmail.com
                            </span>
                          )}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={
                              saving ||
                              !guardianDraft.fullName.trim() ||
                              !guardianDraft.phone.trim()
                            }
                            onClick={() => void saveGuardian()}
                            className="student-control student-control--action px-4"
                          >
                            {saving ? "Đang lưu" : "Lưu người bảo hộ"}
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => setGuardianEditing(false)}
                            className="student-control student-control--secondary px-4"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3 flex items-start gap-2 student-meta text-muted-foreground">
                  <ShieldCheck size={16} className="shrink-0 text-success" />
                  Thông tin riêng tư. Chỉ hiển thị sau khi bạn bật nút mắt.
                </div>
              </PaperCard>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-ink pt-5 student-meta font-semibold text-muted-foreground">
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
    </div>
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
  const queries = [
    identity,
    level,
    streak,
    learning,
    todo,
    inProgress,
    submitted,
  ];
  if (queries.some((q) => q.isPending)) {
    return (
      <FullPageState variant="loading" title="Đang mở sổ tay học tập..." />
    );
  }
  const profile = identity.data?.data;
  const game = level.data?.data;
  const run = streak.data?.data;
  const learningData = learning.data?.data;
  if (
    queries.some((q) => q.isError) ||
    !profile ||
    !game ||
    !run ||
    !learningData
  ) {
    return (
      <RegionState
        variant="error"
        title="Chưa thể tải đầy đủ hồ sơ"
        description="Thông tin được lấy từ dữ liệu thật, không thay bằng số liệu demo."
      />
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
    <StudentProfileContent
      key={profile.userId}
      initialProfile={profile}
      game={game}
      streak={run}
      learn={learn}
    />
  );
}
