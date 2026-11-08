/**
 * Cấu hình đường dẫn điều hướng thực tế của hệ thống E-Learning.
 * Khớp chuẩn với cấu trúc xác thực và các module trong dự án.
 */

export interface AuthSessionInfo {
  isAuthenticated: boolean;
  role?: "student" | "teacher" | "admin" | null;
}

export const LANDING_ROUTES = {
  // Route đăng nhập dành cho học sinh
  studentLogin: "/login?role=student&next=%2Fstudent",
  // Route đăng nhập dành cho giáo viên (Mục "Dành cho giáo viên" trên thanh điều hướng)
  teacherLogin: "/login?role=teacher&next=%2Fteacher",
  // Route trang chính của học sinh sau khi đăng nhập
  studentWorkspace: "/student",
  // Route khu vực trò chơi từ vựng của học sinh
  studentGames: "/student/game",
  // Route khu vực làm việc của giáo viên sau khi đăng nhập
  teacherWorkspace: "/teacher",
  // Các anchor cuộn nội bộ trên Landing Page
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
export function resolvePrimaryCtaRoute(session?: AuthSessionInfo): {
  href: string;
  label: string;
} {
  if (session?.isAuthenticated) {
    if (session.role === "teacher") {
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

