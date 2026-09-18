"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login({ email, password });
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || (user.role === "TEACHER" ? "/teacher" : "/"));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background-app px-5 py-8 text-neutral-dark lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[var(--radius-xl)] border border-border-color bg-card-bg shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-secondary/30" />
          <div className="relative">
            <div className="mb-16 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-white text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">LearnVerse</span>
            </div>
            <p className="mb-4 max-w-md text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Teacher workspace</p>
            <h1 className="max-w-lg text-5xl font-extrabold leading-[1.05]">Make every lesson count.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/75">One calm place to guide classes, build activities, and see student progress clearly.</p>
          </div>
          <p className="relative text-sm text-white/60">English learning platform · Grades 6–8</p>
        </section>

        <section className="flex items-center p-6 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary text-primary-foreground"><BookOpen className="h-5 w-5" /></div>
                <span className="text-xl font-extrabold">LearnVerse</span>
              </div>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Welcome back</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Sign in to your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-muted">Use the email and password provided by your teacher.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-bold" htmlFor="email">
                Email
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-subtle" />
                  <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-[var(--radius-md)] border border-border-color bg-background-app pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light" placeholder="teacher@example.com" />
                </span>
              </label>
              <label className="block text-sm font-bold" htmlFor="password">
                Password
                <span className="relative mt-2 block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-subtle" />
                  <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-[var(--radius-md)] border border-border-color bg-background-app pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light" placeholder="Enter your password" />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3 text-neutral-muted hover:text-neutral-dark">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </span>
              </label>
              {error && <p role="alert" className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-extrabold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Signing in..." : "Sign in"}<ArrowRight className="h-4 w-4" /></button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}