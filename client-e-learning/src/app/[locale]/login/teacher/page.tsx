"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { getAppErrorMessage } from "@/lib/errors/app-error";

export default function TeacherLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const tErrors = useTranslations("errors");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReason, setSessionReason] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setSessionReason(
        new URLSearchParams(window.location.search).get("reason"),
      );
    }
  }, []);

  const sessionMessage =
    sessionReason === "account_inactive"
      ? tErrors("errors.ACCOUNT_INACTIVE")
      : sessionReason === "session_expired"
        ? tErrors("errors.SESSION_EXPIRED")
        : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password, expectedRole: "TEACHER" });

      let safeNext: string | null = null;
      if (typeof window !== "undefined") {
        const requestedNext = new URLSearchParams(window.location.search).get(
          "next",
        );
        if (
          requestedNext &&
          requestedNext.startsWith("/") &&
          !requestedNext.startsWith("//") &&
          !requestedNext.includes("\\")
        ) {
          safeNext = requestedNext;
        }
      }

      // Điều hướng đúng vai trò
      let targetUrl = "/teacher";
      if (safeNext) {
        if (safeNext.startsWith("/teacher")) {
          targetUrl = safeNext;
        }
      }

      router.replace(targetUrl, { locale });
    } catch (submissionError) {
      setError(
        getAppErrorMessage(submissionError, tErrors as (key: string) => string),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-background-app px-4 py-8 text-neutral-dark sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-10"
      suppressHydrationWarning
    >
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[var(--radius-xl,24px)] border border-border-color bg-card-bg shadow-2xl lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        {/* Cột trái: Giới thiệu không gian giảng dạy */}
        <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-secondary/30 blur-2xl" />

          <div className="relative">
            {/* Logo */}
            <Link
              href="/"
              className="mb-14 flex items-center gap-3 transition hover:opacity-90"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md,12px)] bg-white text-primary shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                E-Learning
              </span>
            </Link>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Dành cho giáo viên
            </p>

            <h1 className="max-w-lg text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl">
              Chào mừng thầy cô trở lại!
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
              Đăng nhập để quản lý lớp học, tổ chức hoạt động học tập và đồng
              hành cùng học sinh trên E-Learning.
            </p>

            <div className="mt-10 space-y-3.5 text-sm text-white/90">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8de0b6]" />
                <span>Quản lý lớp học và học sinh</span>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8de0b6]" />
                <span>Tạo hoạt động và giao bài tập</span>
              </div>

              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8de0b6]" />
                <span>Theo dõi kết quả học tập</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/60">
            <span>Cổng giảng viên & Quản trị viên</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Bảo mật tiêu chuẩn
            </span>
          </div>
        </section>

        {/* Cột phải: Form đăng nhập giảng viên */}
        <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div>
            {/* Header phụ: Nút về trang chủ */}
            <div className="mb-8 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-muted transition hover:text-neutral-dark"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Về trang chủ</span>
              </Link>

              {/* Link chuyển sang trang Học sinh */}
              <Link
                href="/login/student"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary transition hover:bg-primary/10"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Bạn là học sinh?</span>
              </Link>
            </div>

            <div className="w-full max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Khu vực giáo viên
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-dark sm:text-3xl">
                Đăng nhập giảng dạy
              </h2>
              <p className="mt-2 text-xs text-neutral-muted sm:text-sm">
                Sử dụng email và mật khẩu do tổ chức giáo dục của bạn cấp.
              </p>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                {mounted && sessionMessage && !error && (
                  <p
                    role="status"
                    className="rounded-[var(--radius-md,10px)] border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground"
                  >
                    {sessionMessage}
                  </p>
                )}

                {/* Email */}
                <label
                  className="block text-xs font-bold text-neutral-dark"
                  htmlFor="teacher-email"
                >
                  Email giảng viên (teacher@example.com)
                  <span className="relative mt-2 block">
                    <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-subtle" />
                    <input
                      id="teacher-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 w-full rounded-[var(--radius-md,10px)] border border-border-color bg-background-app pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="teacher@school.edu.vn"
                    />
                  </span>
                </label>

                {/* Password */}
                <label
                  className="block text-xs font-bold text-neutral-dark"
                  htmlFor="teacher-password"
                >
                  Mật khẩu 123456
                  <span className="relative mt-2 block">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-subtle" />
                    <input
                      id="teacher-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 w-full rounded-[var(--radius-md,10px)] border border-border-color bg-background-app pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="Nhập mật khẩu của thầy cô"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-3 text-neutral-muted hover:text-neutral-dark"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </span>
                </label>

                {error && (
                  <p
                    role="alert"
                    className="rounded-[var(--radius-md,10px)] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md,10px)] bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Đang xác thực..." : "Đăng nhập bàn làm việc"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 border-t border-border-color pt-4 text-center text-xs text-neutral-muted">
            Cần cấp mới hoặc khôi phục tài khoản giáo viên?{" "}
            <span className="font-semibold text-primary">
              Liên hệ Quản trị viên IT
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
