"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Coffee,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { getAppErrorMessage } from "@/lib/errors/app-error";

export default function StudentLoginPage() {
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
      setSessionReason(new URLSearchParams(window.location.search).get("reason"));
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
      await login({ email, password, expectedRole: "STUDENT" });
      
      let safeNext: string | null = null;
      if (typeof window !== "undefined") {
        const requestedNext = new URLSearchParams(window.location.search).get("next");
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
      let targetUrl = "/student";
      if (safeNext) {
        if (!safeNext.startsWith("/teacher")) {
          targetUrl = safeNext;
        }
      }

      router.replace(targetUrl, { locale });
    } catch (submissionError) {
      setError(getAppErrorMessage(submissionError, tErrors as (key: string) => string));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main 
      className="relative min-h-screen overflow-hidden bg-[#f7f2e7] px-4 py-8 text-[#2b2825] sm:px-6 lg:flex lg:items-center lg:justify-center"
      suppressHydrationWarning
    >
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2b2825 1px, transparent 1px),
            linear-gradient(to bottom, #2b2825 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#f8d77e]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-[#b8d8ca]/30 blur-3xl" />

      <div className="pointer-events-none absolute left-6 top-8 hidden select-none lg:block">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="opacity-40">
          <path d="M40 10 C40 25, 43 32, 58 32 C43 32, 40 39, 40 54 C40 39, 37 32, 22 32 C37 32, 40 25, 40 10 Z" fill="#2b2825" />
          <path d="M15 70 Q 30 60, 45 72 T 75 68 T 105 74" stroke="#2b2825" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="pointer-events-none absolute -bottom-2 right-16 hidden select-none lg:block">
        <svg width="110" height="90" viewBox="0 0 110 90" fill="none" className="opacity-45">
          <path d="M10 75 Q 40 85, 55 60 Q 65 40, 85 45" stroke="#2b2825" strokeWidth="2" strokeDasharray="3 4" fill="none" />
          <polygon points="85,45 105,25 70,38" fill="#f8d77e" stroke="#2b2825" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="85,45 105,25 90,48" fill="#e2c16a" stroke="#2b2825" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl overflow-hidden rounded-[26px] border-[3px] border-[#2b2825] bg-[#fffdfa] shadow-[10px_10px_0_#2b2825] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        
        <div 
          className="pointer-events-none absolute -top-3.5 left-1/2 z-20 h-7 w-36 -translate-x-1/2 -rotate-1 border border-[#2b2825]/40 bg-[#f8d77e]/85 shadow-sm"
          style={{ clipPath: "polygon(0% 0%, 96% 2%, 100% 50%, 97% 100%, 3% 98%, 0% 50%)" }}
        />

        <section className="relative flex flex-col justify-between border-b-[3px] border-[#2b2825] bg-[#224237] p-8 text-[#f4eee1] lg:border-b-0 lg:border-r-[3px] lg:p-12">
          <div 
            className="pointer-events-none absolute inset-0 opacity-10" 
            style={{ 
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", 
              backgroundSize: "16px 16px" 
            }} 
          />

          <div className="relative">
            <div className="mb-10 flex items-center justify-between">
              <Link href="/" className="group flex items-center gap-3 transition hover:opacity-90">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#2b2825] bg-[#f8d77e] text-[#2b2825] shadow-[2px_2px_0_#2b2825] transition group-hover:-translate-y-0.5">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-serif text-2xl font-black tracking-tight text-[#fffdfa]">
                    LearnVerse
                  </span>
                  <span className="block text-[11px] font-medium tracking-wide text-[#b4cec1]">
                    Góc học tập học sinh
                  </span>
                </div>
              </Link>

              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#d4e4db]">
                Student Desk
              </span>
            </div>

            <div className="inline-block -rotate-1 rounded-md border-2 border-[#2b2825] bg-[#f3bcbe] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2b2825] shadow-[2px_2px_0_#2b2825]">
              Bàn học cá nhân
            </div>

            <h1 className="mt-6 font-serif text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Hôm nay bạn đã sẵn sàng{" "}
              <span className="text-[#f8d77e] underline decoration-[#f8d77e]/60 decoration-wavy">
                giữ vững chuỗi streak?
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#d4e4db] sm:text-base">
              Mở sổ học tập, làm thử thách mini-test mỗi ngày và sưu tập đủ bộ huy hiệu kỹ năng mới nhé!
            </p>
          </div>

          <div className="relative mt-8 rounded-xl border-2 border-[#2b2825] bg-[#2a4f43] p-4 text-xs shadow-[3px_3px_0_#2b2825]">
            <div className="flex items-center gap-2 font-bold text-[#f8d77e]">
              <Sparkles className="h-4 w-4" />
              <span>Gợi ý cho bạn</span>
            </div>
            <p className="mt-1 leading-relaxed text-[#d4e4db]">
              Hãy dùng email và mật khẩu mà thầy cô trên lớp đã gửi cho bạn để vào bàn học.
            </p>
          </div>
        </section>

        <section className="relative flex flex-col justify-between bg-[#fffdfa] p-6 sm:p-10 lg:p-12">
          
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[#2b2825] bg-[#f8f4ec] px-3 py-1.5 text-xs font-bold text-[#2b2825] shadow-[2px_2px_0_#2b2825] transition hover:-translate-y-0.5 hover:bg-[#f1ebe0] active:translate-y-0 active:shadow-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>

            <Link
              href="/login/teacher"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b2825]/30 bg-[#fffdfa] px-3 py-1.5 text-xs font-bold text-[#224237] transition hover:bg-[#f8f4ec]"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Dành cho Thầy/Cô →</span>
            </Link>
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-black tracking-tight text-[#2b2825] sm:text-3xl">
              Mở bàn học của bạn
            </h2>
            <p className="mt-2 text-xs text-[#726a5e] sm:text-sm">
              Điền thông tin tài khoản được thầy cô cấp để bắt đầu ôn bài.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {mounted && sessionMessage && !error && (
                <div
                  role="status"
                  className="rounded-xl border-2 border-[#2b2825] bg-[#fbf0d3] p-3 text-xs font-semibold text-[#664c11] shadow-[2px_2px_0_#2b2825]"
                >
                  {sessionMessage}
                </div>
              )}

              

              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2825]" htmlFor="student-email">
                Email học sinh
                <p className="text-[11px] lowercase">g7.seed.student02@example.test có thể thay 02 -> 55</p>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a8275]" />
                  <input
                    id="student-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="hocsinh@gmail.com"
                    className="h-11 w-full rounded-xl border-2 border-[#2b2825] bg-[#fbf8f1] pl-10 pr-3 font-medium text-[#2b2825] outline-none transition placeholder:text-[#a19a8d] focus:bg-white focus:shadow-[3px_3px_0_#2b2825]"
                  />
                </div>
              </label>

              {/* Password */}
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2b2825]" htmlFor="student-password">
                Mật khẩu 123456
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a8275]" />
                  <input
                    id="student-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 w-full rounded-xl border-2 border-[#2b2825] bg-[#fbf8f1] pl-10 pr-11 font-medium text-[#2b2825] outline-none transition placeholder:text-[#a19a8d] focus:bg-white focus:shadow-[3px_3px_0_#2b2825]"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3.5 top-3 text-[#8a8275] transition hover:text-[#2b2825]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border-2 border-[#2b2825] bg-[#fee2e2] p-3 text-xs font-bold text-[#991b1b] shadow-[2px_2px_0_#2b2825]"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#2b2825] bg-[#f8d77e] px-4 font-black text-[#2b2825] shadow-[4px_4px_0_#2b2825] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isSubmitting ? "Đang mở bàn học..." : "Vào bàn học ngay"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 border-t border-dashed border-[#e4ded2] pt-4 text-center text-xs text-[#8a8275]">
            Chưa có tài khoản hoặc quên mật khẩu?{" "}
            <span className="font-bold text-[#224237]">Hãy báo ngay với thầy cô phụ trách lớp.</span>
          </div>
        </section>

      </div>
    </main>
  );
}
