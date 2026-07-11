import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Bug,
  FileText,
  FlaskConical,
  GaugeCircle,
  GitPullRequest,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Sparkles,
  Swords,
  Timer,
  Wand2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    title: "Live Code Analysis",
    body: "Eight quality dimensions — performance, security, readability, maintainability and more — recomputed as you type, without a refresh.",
  },
  {
    icon: GaugeCircle,
    title: "Complexity Analyzer",
    body: "Big-O time and space for every function, with the exact loops and recursion responsible highlighted, plus best, average and worst case.",
  },
  {
    icon: Rocket,
    title: "Optimization Coach",
    body: "When a faster algorithm exists, see it immediately: O(n²) → O(n), the concrete change, estimated speedup and the memory tradeoff.",
  },
  {
    icon: Bug,
    title: "AI Bug Detector",
    body: "Risky lines flagged with confidence scores — null dereferences, off-by-one, overflow — each with a one-click fix.",
  },
  {
    icon: ShieldCheck,
    title: "Security Scanner",
    body: "SQL injection, XSS, RCE, command injection, hardcoded secrets, weak crypto — severity-ranked with a live security score.",
  },
  {
    icon: FlaskConical,
    title: "Hidden Test Prediction",
    body: "A percentage prediction of whether your solution survives hidden test cases, and the categories most likely to break it.",
  },
  {
    icon: Sparkles,
    title: "Edge Case Generator",
    body: "Empty inputs, max integers, duplicates, unicode, fuzz — generated automatically and runnable against your code.",
  },
  {
    icon: Wand2,
    title: "AI Refactor",
    body: "One click to a faster, cleaner, production-ready version — SOLID principles, better naming, design patterns — reviewed in a diff before you apply.",
  },
  {
    icon: FileText,
    title: "Docs Generator",
    body: "README, API docs, function comments, architecture summaries and flowcharts, generated from the code itself.",
  },
] as const;

const MODES = [
  {
    icon: GraduationCap,
    name: "Learning Mode",
    body: "Understand why it's O(n log n), why not O(log n), and the path to O(1) — with step-by-step visual walkthroughs.",
  },
  {
    icon: Timer,
    name: "Interview Mode",
    body: "Expected vs. current complexity, progressive hints, alternative approaches and an estimated interview rating.",
  },
  {
    icon: Swords,
    name: "Competitive Mode",
    body: "LeetCode, Codeforces, CodeChef, HackerRank, AtCoder — acceptance prediction, TLE risk and memory estimates.",
  },
] as const;

const LANGUAGES = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "PHP",
  "Ruby",
  "C#",
];

function HeroEditor() {
  return (
    <div className="glass-strong glow-accent mx-auto w-full max-w-3xl rounded-2xl p-1 text-left">
      <div className="rounded-xl bg-surface/90">
        <div className="flex items-center gap-2 border-b border-stroke px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <span className="ml-3 font-mono text-xs text-mute">two_sum.py</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Analyzing
          </span>
        </div>
        <div className="grid gap-0 md:grid-cols-[1.5fr_1fr]">
          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
            <code>
              <span className="text-violet">def</span>{" "}
              <span className="text-info">two_sum</span>
              <span className="text-mute">(nums, target):</span>
              {"\n"}
              <span className="text-mute">    </span>
              <span className="text-violet">for</span>
              <span className="text-mute"> i </span>
              <span className="text-violet">in</span>
              <span className="text-mute"> range(len(nums)):</span>
              {"\n"}
              <span className="text-mute">        </span>
              <span className="text-violet">for</span>
              <span className="text-mute"> j </span>
              <span className="text-violet">in</span>
              <span className="text-mute"> range(i + 1, len(nums)):</span>
              {"\n"}
              <span className="text-mute">            </span>
              <span className="text-violet">if</span>
              <span className="text-mute"> nums[i] + nums[j] == target:</span>
              {"\n"}
              <span className="text-mute">                </span>
              <span className="text-violet">return</span>
              <span className="text-mute"> [i, j]</span>
            </code>
          </pre>
          <div className="flex flex-col gap-2.5 border-t border-stroke p-4 md:border-l md:border-t-0">
            <div className="rounded-lg bg-warn-soft px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-warn">
                Time Complexity
              </div>
              <div className="font-mono text-sm text-ink">
                O(n²) <span className="text-xs text-mute">· nested loops</span>
              </div>
            </div>
            <div className="rounded-lg bg-accent-soft px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Better Approach
              </div>
              <div className="font-mono text-sm text-ink">
                O(n){" "}
                <span className="text-xs text-mute">· hash map — ~12x faster</span>
              </div>
            </div>
            <div className="rounded-lg bg-info-soft px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-info">
                Hidden Test Prediction
              </div>
              <div className="font-mono text-sm text-ink">
                74%{" "}
                <span className="text-xs text-mute">· risk: large inputs (TLE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-mesh relative min-h-svh">
      <div className="bg-grid pointer-events-none absolute inset-0" />

      <div className="relative">
        {/* nav */}
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <BrainCircuit size={20} strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              CodeIQ
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden rounded-xl px-4 py-2 text-sm text-mute transition-colors hover:text-ink sm:block"
            >
              Dashboard
            </Link>
            <Link
              href="/workbench"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              Open Workbench
            </Link>
          </div>
        </nav>

        {/* hero */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 text-center">
          <div className="glass mx-auto mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-mute">
            <Sparkles size={13} className="text-accent" />
            An AI senior engineer on every keystroke
          </div>
          <h1 className="font-display mx-auto max-w-3xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Code review that happens{" "}
            <span className="text-gradient">while you type.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-mute sm:text-lg">
            CodeIQ continuously analyzes your code for complexity, bugs,
            security and performance — then coaches you to the optimal
            solution. Like Grammarly, but for software engineers.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/workbench"
              className="group flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              Start analyzing
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/dashboard"
              className="glass rounded-xl px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-stroke-strong"
            >
              View dashboard
            </Link>
          </div>

          <div className="mt-14">
            <HeroEditor />
          </div>

          {/* languages strip */}
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {LANGUAGES.map((lang) => (
              <span
                key={lang}
                className="rounded-full border border-stroke bg-surface/60 px-3 py-1 font-mono text-xs text-mute"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* features */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="font-display mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything a senior reviewer would catch
          </h2>
          <p className="mb-10 text-center text-sm text-mute">
            Powered by frontier AI models reasoning about your code — not regex
            lint rules.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="glass group rounded-2xl p-5 transition-colors hover:border-stroke-strong"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:scale-110">
                  <Icon size={20} />
                </div>
                <h3 className="font-display mb-1.5 text-[15px] font-semibold">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-mute">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* modes */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <h2 className="font-display mb-2 text-center text-2xl font-bold tracking-tight">
              Three ways to level up
            </h2>
            <p className="mb-8 text-center text-sm text-mute">
              Switch modes and CodeIQ changes how it coaches you.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {MODES.map(({ icon: Icon, name, body }) => (
                <div
                  key={name}
                  className="rounded-2xl border border-stroke bg-surface/50 p-5"
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-soft text-info">
                      <Icon size={18} />
                    </span>
                    <h3 className="font-display text-[15px] font-semibold">
                      {name}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-mute">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* github cta */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-soft text-violet">
              <GitPullRequest size={24} />
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Bring it to your pull requests
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-mute">
              Connect GitHub and CodeIQ reviews every PR with line-anchored
              comments, severity ratings and concrete suggestions — like a
              teammate who never gets tired.
            </p>
            <Link
              href="/github"
              className="mt-2 flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              Explore GitHub intelligence
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <footer className="border-t border-stroke py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-mute">
            <span className="flex items-center gap-2">
              <BrainCircuit size={14} className="text-accent" />
              CodeIQ
            </span>
            <span>Built for developers who want to get better, faster.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
