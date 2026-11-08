/**
 * Cấu hình đường dẫn điều hướng thực tế của hệ thống E-Learning.
 * Khớp chuẩn với cấu trúc xác thực và các module trong dự án.
 */

import type { UserRole } from "@/types/auth";

export const LANDING_ROUTES = {
  studentLogin: "/login/student",
  teacherLogin: "/login/teacher",
  studentWorkspace: "/student",
  studentGames: "/student/game",
  teacherWorkspace: "/teacher",
  anchors: {
    hero: "#trang-chu",
    explore: "#kham-pha",
    games: "#tro-choi",
    rewards: "#thanh-tich",
    final: "#bat-dau",
  },
} as const;

/**
 * Trả về đường dẫn CTA chính dựa trên trạng thái đăng nhập thực tế (nếu được truyền từ Server/Auth Provider).
 * Không tự suy đoán role ở phía client nếu chưa có phiên xác thực.
 */
export function resolvePrimaryCtaRoute(role?: UserRole | null): {
  href: string;
  label: string;
} {
  if (role) {
    if (role === "TEACHER") {
      return {
        href: LANDING_ROUTES.teacherWorkspace,
        label: "Vào không gian Giáo viên",
      };
    }
    return {
      href: LANDING_ROUTES.studentWorkspace,
      label: "Tiếp tục hành trình học",
    };
  }
  return {
    href: LANDING_ROUTES.studentLogin,
    label: "Bắt đầu học",
  };
}

