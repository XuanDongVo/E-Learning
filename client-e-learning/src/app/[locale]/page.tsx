import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

const audiences = [
  {
    href: "/login?role=student&next=%2Fstudent",
    eyebrow: "For learners",
    title: "Build your next English win.",
    description: "Practice units, finish assignments, and see your progress grow one clear step at a time.",
    icon: GraduationCap,
    tone: "bg-primary-light text-primary",
    button: "Student sign in",
  },
  {
    href: "/login?role=teacher&next=%2Fteacher",
    eyebrow: "For teachers",
    title: "Make every lesson count.",
    description: "Organize classes, shape activities, and keep every learner visible from one calm workspace.",
    icon: ShieldCheck,
    tone: "bg-secondary-light text-secondary-hover",
    button: "Teacher sign in",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background-app text-neutral-dark">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-ui-lg font-extrabold tracking-tight">Learn<span className="text-primary">Verse</span></span>
          </Link>
          <span className="hidden items-center gap-2 text-body-sm font-bold text-neutral-muted sm:flex"><Sparkles className="h-4 w-4 text-accent" /> English learning for every class</span>
        </header>

        <section className="relative py-20 sm:py-28 lg:py-32">
          <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-secondary-light/70 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-4 h-80 w-80 rounded-full bg-primary-light/80 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="mb-5 text-body font-extrabold uppercase tracking-[0.2em] text-primary">Learn with purpose</p>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">A brighter way to learn English together.</h1>
            <p className="mt-7 max-w-2xl text-card-title leading-8 text-neutral-muted sm:text-ui-lg">LearnVerse brings lessons, practice, assignments, and progress into one shared rhythm for teachers and students.</p>
          </div>
        </section>

        <section className="grid gap-5 pb-10 md:grid-cols-2" aria-label="Choose your workspace">
          {audiences.map((audience) => {
            const Icon = audience.icon;
            return (
              <article key={audience.href} className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-border-color bg-card-bg p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-9">
                <div className={`mb-12 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] ${audience.tone}`}><Icon className="h-6 w-6" /></div>
                <p className="text-body-sm font-extrabold uppercase tracking-[0.16em] text-neutral-subtle">{audience.eyebrow}</p>
                <h2 className="mt-3 text-ui-3xl font-extrabold tracking-tight">{audience.title}</h2>
                <p className="mt-4 max-w-md text-body leading-7 text-neutral-muted">{audience.description}</p>
                <Link href={audience.href} className="mt-8 inline-flex items-center gap-2 text-body font-extrabold text-primary transition group-hover:gap-3">{audience.button}<ArrowRight className="h-4 w-4" /></Link>
              </article>
            );
          })}
        </section>
        <footer className="border-t border-border-color py-6 text-body-sm text-neutral-subtle">A focused learning space for classes, practice, and progress.</footer>
      </div>
    </main>
  );
}