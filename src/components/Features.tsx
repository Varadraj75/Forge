import type { ReactNode } from "react";
import Reveal from "./Reveal";
import {
  Check,
  FlagIcon,
  TargetIcon,
  TerminalIcon,
  LayersIcon,
  ArrowRight,
} from "./icons";

interface FeatureProps {
  id?: string;
  icon: ReactNode;
  kicker: string;
  title: string;
  body: string;
  points: string[];
  mock: ReactNode;
  flip?: boolean;
}

function FeatureRow({ id, icon, kicker, title, body, points, mock, flip }: FeatureProps) {
  return (
    <div id={id} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Reveal className={flip ? "lg:order-2" : ""}>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-paper-card text-ink shadow-sm dark:border-ink-line dark:bg-ink-raised dark:text-paper">
          {icon}
        </div>
        <p className="kicker mt-6">{kicker}</p>
        <h3 className="mt-3 max-w-md text-balance font-display text-3xl font-bold leading-tight tracking-tight text-ink dark:text-paper sm:text-[34px]">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink/65 dark:text-paper/70">{body}</p>
        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px] text-ink/80 dark:text-paper/80">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/30 text-ink dark:bg-accent/20 dark:text-accent">
                <Check width={13} height={13} strokeWidth={2.2} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <a
          href="#waitlist"
          className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-paper"
        >
          Learn more
          <ArrowRight
            width={16}
            height={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </a>
      </Reveal>

      <Reveal delay={120} className={flip ? "lg:order-1" : ""}>
        {mock}
      </Reveal>
    </div>
  );
}

export default function Features() {
  return (
    <section id="platform" className="py-24 sm:py-32">
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker">The platform</p>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold tracking-tightest text-ink dark:text-paper sm:text-5xl">
            One platform, the whole talent loop
          </h2>
          <p className="mt-5 text-lg text-ink/60 dark:text-paper/60">
            Sourcing ideas, validating skills, hiring, upskilling. Forge runs
            each stage as a live program, not a slide deck.
          </p>
        </Reveal>

        <div className="mt-20 space-y-28">
          <FeatureRow
            icon={<FlagIcon width={22} height={22} />}
            kicker="Innovation hackathons"
            title="Run challenges that end in shipped solutions"
            body="Turn your hardest problem into a live challenge and open it up to builders everywhere. Every team lands on one board, from first idea to final submission."
            points={[
              "Branded challenge pages live in minutes",
              "Open it up to builders and startups, wherever they are",
              "Walk away with working prototypes, not slideware",
            ]}
            mock={<ChallengeBoardMock />}
          />

          <FeatureRow
            id="builders"
            flip
            icon={<TargetIcon width={22} height={22} />}
            kicker="Skills-based hiring"
            title="Hire from the work, not the résumé"
            body="Every submission turns into a candidate profile backed by real work. Compare people on what they built, not how they describe themselves."
            points={[
              "Scores that come from real output",
              "Side-by-side candidate comparison",
              "Plagiarism and AI-assist checks built in",
            ]}
            mock={<CandidateMock />}
          />

          <FeatureRow
            icon={<TerminalIcon width={22} height={22} />}
            kicker="Skill validation"
            title="Proof of skill, not a claim on a page"
            body="Challenges grade themselves the moment a build lands, checking correctness, design, and code quality. Whoever passes gets a certificate they can verify."
            points={[
              "Real-world, role-specific challenges",
              "Instant auto-evaluation and feedback",
              "Verifiable, shareable certificates",
            ]}
            mock={<ValidationMock />}
          />

          <FeatureRow
            flip
            icon={<LayersIcon width={22} height={22} />}
            kicker="AI capacity building"
            title="Get your team actually building with AI"
            body="Teach people to use AI in their day-to-day, then put it to work right away in a focused sprint on a real internal problem."
            points={[
              "Learning tracks tailored to each role",
              "Applied sprints on real internal problems",
              "Dashboards that show what your team actually learned",
            ]}
            mock={<TrackMock />}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- mock 1: challenge board ---------- */
function ChallengeBoardMock() {
  const cols = [
    { t: "Ideas", n: 24, cards: ["Edge caching", "Risk graph"] },
    { t: "Building", n: 11, cards: ["Stream scorer", "Anomaly map"] },
    { t: "Submitted", n: 8, cards: ["Fraud-net v2"], done: true },
  ];
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink/10 bg-ink p-5 shadow-[0_30px_80px_-40px_rgba(10,10,11,0.5)] dark:border-ink-line">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-dark">
          Sample challenge · board
        </p>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] text-accent">
          43 teams
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cols.map((c) => (
          <div key={c.t} className="rounded-lg border border-ink-line bg-ink-soft p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-paper/70">{c.t}</span>
              <span className="font-mono text-[10px] text-muted-dark">{c.n}</span>
            </div>
            <div className="space-y-2">
              {c.cards.map((card) => (
                <div
                  key={card}
                  className={`rounded-md border px-2.5 py-2 text-[11px] ${
                    c.done
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-ink-line bg-ink text-paper/75"
                  }`}
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- mock 2: candidate profile ---------- */
function CandidateMock() {
  const skills = [
    { k: "Problem solving", v: 94 },
    { k: "Code quality", v: 90 },
    { k: "Collaboration", v: 86 },
  ];
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink/10 bg-paper-card p-6 shadow-[0_30px_80px_-40px_rgba(10,10,11,0.25)] dark:border-ink-line dark:bg-ink-soft dark:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-base font-bold text-accent dark:bg-ink-raised">
          KI
        </div>
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-ink dark:text-paper">K. Iyer</p>
          <p className="font-mono text-xs text-muted dark:text-muted-dark">Backend · Submission #112</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Match</p>
          <p className="font-display text-2xl font-extrabold text-ink dark:text-paper">96%</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {skills.map((s) => (
          <div key={s.k}>
            <div className="flex justify-between text-xs text-ink/60 dark:text-paper/60">
              <span>{s.k}</span>
              <span className="font-mono">{s.v}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
              <div className="h-full rounded-full bg-ink dark:bg-accent" style={{ width: `${s.v}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-ink/10 bg-paper p-3 dark:border-ink-line dark:bg-ink">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/30 text-ink dark:bg-accent/20 dark:text-accent">
          <Check width={13} height={13} strokeWidth={2.2} />
        </span>
        <span className="text-xs text-ink/70 dark:text-paper/70">Original work · passed integrity checks</span>
      </div>
    </div>
  );
}

/* ---------- mock 3: validation / certificate ---------- */
function ValidationMock() {
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink/10 bg-ink shadow-[0_30px_80px_-40px_rgba(10,10,11,0.5)] dark:border-ink-line">
      <div className="border-b border-ink-line px-5 py-3 font-mono text-xs text-muted-dark">
        evaluation · run #4012
      </div>
      <div className="grid gap-px bg-ink-line sm:grid-cols-2">
        <div className="bg-ink p-5 font-mono text-xs leading-7">
          <p className="text-muted-dark">$ forge eval submit</p>
          <p className="text-paper/70">
            <span className="text-accent">✓</span> correctness 100%
          </p>
          <p className="text-paper/70">
            <span className="text-accent">✓</span> p95 latency 62ms
          </p>
          <p className="text-paper/70">
            <span className="text-accent">✓</span> test coverage 91%
          </p>
          <p className="text-paper/70">
            <span className="text-accent">✓</span> no integrity flags
          </p>
        </div>
        <div className="flex flex-col items-center justify-center bg-ink-soft p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent text-accent">
            <span className="font-display text-xl font-extrabold">A</span>
          </div>
          <p className="mt-4 font-display text-base font-bold text-paper">
            Verified skill certificate
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-dark">
            forge.app/verify/9f2c-aa17
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- mock 4: learning track ---------- */
function TrackMock() {
  const steps = [
    { t: "Foundations of applied AI", s: "done" },
    { t: "Prompting & evaluation", s: "done" },
    { t: "Build: internal copilot", s: "active" },
    { t: "Sprint review", s: "todo" },
  ];
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink/10 bg-paper-card p-6 shadow-[0_30px_80px_-40px_rgba(10,10,11,0.25)] dark:border-ink-line dark:bg-ink-soft dark:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted dark:text-muted-dark">
          AI-native track · Platform team
        </p>
        <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] text-accent dark:bg-paper dark:text-ink">
          63% complete
        </span>
      </div>
      <ol className="relative space-y-4 pl-6">
        <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-ink/15 dark:bg-white/15" />
        {steps.map((step) => (
          <li key={step.t} className="relative">
            <span
              className={`absolute -left-6 top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                step.s === "done"
                  ? "border-ink bg-ink dark:border-paper dark:bg-paper"
                  : step.s === "active"
                  ? "border-accent-deep bg-accent"
                  : "border-ink/25 bg-paper dark:border-white/20 dark:bg-ink"
              }`}
            />
            <span
              className={`text-sm ${
                step.s === "todo"
                  ? "text-ink/40 dark:text-paper/40"
                  : "font-medium text-ink dark:text-paper"
              }`}
            >
              {step.t}
            </span>
            {step.s === "active" && (
              <span className="ml-2 rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] text-ink dark:bg-accent/20 dark:text-accent">
                in progress
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
