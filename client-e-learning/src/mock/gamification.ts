import type {
  HallOfFameItem,
  LeaderboardEntry,
  RecentActivityItem,
  StudentGamificationProfile,
} from "@/types/gamification";

/** Presentation-only sample data. Not real student outcomes. */

export const mockCurrentGamificationProfile: StudentGamificationProfile = {
  id: "prof_001",
  studentId: "stu_ngoc_nguyen",
  lifetimeXp: 12850,
  currentLevel: 18,
  currentStreak: 230,
  longestStreak: 230,
  lastQualifiedDate: "2026-11-05",
  activeAvatarKey: "dicebear:bottts:ngoc-nguyen",
  activeMascotKey: "banhbao-explorer",
};

export const mockStreakLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    studentId: "stu_ngoc_nguyen",
    fullName: "Ngọc Nguyễn",
    avatarKey: "dicebear:bottts:ngoc-nguyen",
    value: 230,
    valueLabel: "230 ngày",
    isCurrentUser: true,
  },
  {
    rank: 2,
    studentId: "stu_doan_manh_duy",
    fullName: "Đoàn Mạnh Duy",
    avatarKey: "dicebear:bottts:doan-manh-duy",
    value: 179,
    valueLabel: "179 ngày",
    isCurrentUser: false,
  },
  {
    rank: 3,
    studentId: "stu_nguyen_van_duy",
    fullName: "Nguyễn Văn Duy",
    avatarKey: "dicebear:bottts:nguyen-van-duy",
    value: 168,
    valueLabel: "168 ngày",
    isCurrentUser: false,
  },
  {
    rank: 4,
    studentId: "stu_tuan_thanh",
    fullName: "Tuấn Thanh",
    avatarKey: "dicebear:bottts:tuan-thanh",
    value: 158,
    valueLabel: "158 ngày",
    isCurrentUser: false,
  },
  {
    rank: 5,
    studentId: "stu_thanh_nam",
    fullName: "Thành Nam Nguyễn",
    avatarKey: "dicebear:bottts:thanh-nam",
    value: 154,
    valueLabel: "154 ngày",
    isCurrentUser: false,
  },
  {
    rank: 6,
    studentId: "stu_bach_nguyen",
    fullName: "Bách Nguyễn",
    avatarKey: "dicebear:bottts:bach-nguyen",
    value: 153,
    valueLabel: "153 ngày",
    isCurrentUser: false,
  },
  {
    rank: 7,
    studentId: "stu_bui_my_le",
    fullName: "Bùi Thị Mỹ Lệ",
    avatarKey: "dicebear:bottts:bui-my-le",
    value: 151,
    valueLabel: "151 ngày",
    isCurrentUser: false,
  },
  {
    rank: 8,
    studentId: "stu_tuan_le",
    fullName: "Tuan Le",
    avatarKey: "dicebear:bottts:tuan-le",
    value: 150,
    valueLabel: "150 ngày",
    isCurrentUser: false,
  },
  {
    rank: 9,
    studentId: "stu_thang_ho",
    fullName: "Thắng Hồ Hữu",
    avatarKey: "dicebear:bottts:thang-ho",
    value: 150,
    valueLabel: "150 ngày",
    isCurrentUser: false,
  },
  {
    rank: 10,
    studentId: "stu_tien_dat",
    fullName: "Tiến Đạt",
    avatarKey: "dicebear:bottts:tien-dat",
    value: 147,
    valueLabel: "147 ngày",
    isCurrentUser: false,
  },
];

export const mockHallOfFame: HallOfFameItem[] = [
  {
    title: "Bậc thầy tri thức",
    studentName: "Thuấn Trần Hữu",
    valueLabel: "133.269 XP",
    avatarKey: "dicebear:bottts:thuan-tran",
    icon: "trophy",
  },
  {
    title: "Huyền thoại không nghỉ",
    studentName: "Ngọc Nguyễn",
    valueLabel: "230 ngày",
    avatarKey: "dicebear:bottts:ngoc-nguyen",
    icon: "fire",
  },
  {
    title: "Đại sứ lan tỏa",
    studentName: "minh trương",
    valueLabel: "3.354 bạn",
    avatarKey: "dicebear:bottts:minh-truong",
    icon: "megaphone",
  },
];

export const mockRecentActivities: RecentActivityItem[] = [
  {
    id: "act_01",
    actorName: "trình T.",
    message: "vừa lên Lv. 2",
    badgeLabel: "Lv. 2",
    minutesAgo: 3,
    kind: "level",
  },
  {
    id: "act_02",
    actorName: "Thảo P.",
    message: "vừa đạt mốc streak 30 ngày",
    badgeLabel: "30",
    minutesAgo: 3,
    kind: "streak",
  },
  {
    id: "act_03",
    actorName: "Trần B.",
    message: "vừa kiếm thêm XP trong ít phút",
    badgeLabel: "+14 XP",
    minutesAgo: 4,
    kind: "xp",
  },
  {
    id: "act_04",
    actorName: "Nguyễn N.",
    message: "vừa hoàn thành 1 bộ thi thử",
    minutesAgo: 7,
    kind: "quiz",
  },
  {
    id: "act_05",
    actorName: "Trần H.",
    message: "vừa kiếm thêm XP trong ít phút",
    badgeLabel: "+15 XP",
    minutesAgo: 7,
    kind: "xp",
  },
  {
    id: "act_06",
    actorName: "Ho D.",
    message: "vừa lên Lv. 11",
    badgeLabel: "Lv. 11",
    minutesAgo: 7,
    kind: "level",
  },
  {
    id: "act_07",
    actorName: "Hoàng Đ.",
    message: "vừa lên Lv. 28",
    badgeLabel: "Lv. 28",
    minutesAgo: 8,
    kind: "level",
  },
];

export function avatarUrlFromKey(key: string): string {
  // DiceBear CDN — presentation only
  const seed = key.includes(":") ? key.split(":").pop()! : key;
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;
}
