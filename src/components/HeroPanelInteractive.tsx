"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ChallengeData {
  id: string;
  slug: string;
  category: string;
  title: string;
  route: string;
  builders: string;
  submissions: string;
  closesIn: string;
  leaderboard: { n: string; score: number; you: boolean }[];
  testCases: number;
  latencyMs: number;
  qualityGrade: string;
  skillSignal: number;
  skills: { k: string; v: number }[];
}

const CHALLENGES: ChallengeData[] = [
  {
    id: "fraud",
    slug: "demo-challenge",
    category: "Hiring hackathon · FinTech",
    title: "Real-time fraud scoring",
    route: "forge.app/c/fraud-scoring",
    builders: "1,284",
    submissions: "367",
    closesIn: "06:41:22",
    leaderboard: [
      { n: "k.iyer", score: 98.4, you: false },
      { n: "marco.dev", score: 96.1, you: false },
      { n: "you", score: 95.7, you: true },
    ],
    testCases: 412,
    latencyMs: 64,
    qualityGrade: "A+",
    skillSignal: 95.7,
    skills: [
      { k: "Algorithms", v: 92 },
      { k: "System design", v: 88 },
      { k: "Code quality", v: 97 },
    ],
  },
  {
    id: "ratelimit",
    slug: "rate-limiter",
    category: "System design challenge",
    title: "Distributed token bucket",
    route: "forge.app/c/rate-limiter",
    builders: "942",
    submissions: "281",
    closesIn: "14:18:05",
    leaderboard: [
      { n: "s.patel", score: 99.1, you: false },
      { n: "you", score: 96.8, you: true },
      { n: "alex.go", score: 94.3, you: false },
    ],
    testCases: 512,
    latencyMs: 42,
    qualityGrade: "A",
    skillSignal: 96.8,
    skills: [
      { k: "Concurrency", v: 96 },
      { k: "Redis clustering", v: 94 },
      { k: "Resilience", v: 98 },
    ],
  },
  {
    id: "rag",
    slug: "eval-copilot",
    category: "AI capacity building",
    title: "Autonomous code evaluator",
    route: "forge.app/c/eval-copilot",
    builders: "1,605",
    submissions: "419",
    closesIn: "22:05:40",
    leaderboard: [
      { n: "you", score: 97.4, you: true },
      { n: "elena.ai", score: 96.5, you: false },
      { n: "dev_99", score: 93.8, you: false },
    ],
    testCases: 384,
    latencyMs: 78,
    qualityGrade: "A+",
    skillSignal: 97.4,
    skills: [
      { k: "LLM Orchestration", v: 98 },
      { k: "Evaluation bounds", v: 95 },
      { k: "Latency opt", v: 96 },
    ],
  },
];

export default function HeroPanelInteractive() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [runStage, setRunStage] = useState(3); // 3 = all passed
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const challenge = CHALLENGES[selectedIdx];

  const handleSelectChallenge = (index: number) => {
    clearAllTimers();
    setIsRunning(false);
    setSelectedIdx(index);
    setRunStage(3);
  };

  const handleRunVerification = () => {
    if (isRunning) return;
    clearAllTimers();
    setIsRunning(true);
    setRunStage(0);

    const t1 = setTimeout(() => setRunStage(1), 350);
    const t2 = setTimeout(() => setRunStage(2), 700);
    const t3 = setTimeout(() => {
      setRunStage(3);
      setIsRunning(false);
    }, 1050);

    timersRef.current = [t1, t2, t3];
  };

  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-xl2 border border-ink/10 bg-ink shadow-[0_40px_120px_-40px_rgba(10,10,11,0.55)] dark:border-ink-line dark:shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
        {/* window chrome */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-line px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <Link
              href={`/challenges/${challenge.slug}`}
              className="ml-3 font-mono text-xs text-muted-dark hover:text-accent transition-colors underline underline-offset-2"
              title="Open full interactive challenge details"
            >
              {challenge.route} ↗
            </Link>
          </div>

          {/* challenge selector tabs with 44px AAA touch target */}
          <div
            role="tablist"
            aria-label="Challenge tracks"
            className="flex items-center gap-1.5 rounded-lg border border-ink-line bg-ink-soft p-1"
          >
            {CHALLENGES.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                type="button"
                aria-selected={selectedIdx === i}
                onClick={() => handleSelectChallenge(i)}
                className={`min-h-11 px-3.5 py-2 inline-flex items-center justify-center rounded font-mono text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  selectedIdx === i
                    ? "bg-accent/20 font-semibold text-accent"
                    : "text-paper/60 hover:text-paper"
                }`}
              >
                {c.title.split(" ")[0]}
              </button>
            ))}
          </div>

          <span className="ml-auto flex items-center gap-2 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            SIMULATED BENCHMARK
          </span>
        </div>

        <div className="grid gap-px bg-ink-line sm:grid-cols-[1.4fr_1fr]">
          {/* left: challenge + stats + leaderboard */}
          <div className="bg-ink p-6 dotgrid">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-dark">
              {challenge.category}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-paper">
              {challenge.title}
            </h3>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "Builders", v: challenge.builders },
                { k: "Submissions", v: challenge.submissions },
                { k: "Closes in", v: challenge.closesIn },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-ink-line bg-ink-soft px-3 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-dark">
                    {s.k}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-paper">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-dark mb-1">
                Live Leaderboard Benchmark
              </p>
              {challenge.leaderboard.map((row, i) => (
                <div
                  key={row.n}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    row.you
                      ? "border-accent/40 bg-accent/10"
                      : "border-ink-line bg-ink-soft"
                  }`}
                >
                  <span className="font-mono text-xs text-muted-dark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-sm ${row.you ? "font-semibold text-accent" : "text-paper/80"}`}>
                    {row.n}
                  </span>
                  <span className="ml-auto font-mono text-xs text-paper/60">{row.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* right: submission / interactive scoring preview */}
          <div className="bg-ink-soft p-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-dark">
                Auto-Evaluation
              </p>
              <button
                type="button"
                onClick={handleRunVerification}
                disabled={isRunning}
                className="min-h-11 px-3.5 py-2 inline-flex items-center justify-center rounded-md border border-accent/40 bg-accent/10 font-mono text-xs font-semibold text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {isRunning ? "Running tests…" : "▶ Run verification"}
              </button>
            </div>

            <div
              role="status"
              aria-live="polite"
              className="mt-4 space-y-2 font-mono text-xs leading-relaxed min-h-[96px]"
            >
              <p className="text-muted-dark">
                {isRunning ? "› executing verification suite…" : "› verification suite completed"}
              </p>
              {runStage >= 1 && (
                <p className="text-paper/70">
                  <span className="text-accent">PASS</span> {challenge.testCases} / {challenge.testCases} cases
                </p>
              )}
              {runStage >= 2 && (
                <p className="text-paper/70">
                  <span className="text-accent">PASS</span> latency p95 &lt; {challenge.latencyMs}ms
                </p>
              )}
              {runStage >= 3 && (
                <p className="text-paper/70">
                  code quality <span className="text-accent">{challenge.qualityGrade}</span>
                </p>
              )}
            </div>

            <div className="mt-6 rounded-lg border border-ink-line bg-ink p-4">
              <div className="flex items-end justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-dark">
                  Skill signal
                </p>
                <p className="grad-text font-display text-xl font-bold">
                  {runStage === 3 ? challenge.skillSignal : "…"}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                {challenge.skills.map((b) => (
                  <div key={b.k}>
                    <div className="flex justify-between font-mono text-[10px] text-muted-dark">
                      <span>{b.k}</span>
                      <span>{runStage === 3 ? `${b.v}%` : "—"}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-line">
                      <div
                        className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                        style={{
                          width: runStage === 3 ? `${b.v}%` : "15%",
                          backgroundImage: "var(--grad)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
