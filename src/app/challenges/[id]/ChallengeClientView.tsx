"use client";

import { useState, useEffect } from "react";
import type { Challenge } from "@/lib/challenges";
import { Check, ArrowRight } from "@/components/icons";

interface Props {
  challenge: Challenge;
}

const TABS = [
  { id: "specs", label: "Overview & Specs" },
  { id: "evaluation", label: "Auto-Evaluation Benchmark" },
  { id: "leaderboard", label: "Live Leaderboard" },
  { id: "submit", label: "Submit Solution" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ChallengeClientView({ challenge }: Props) {
  const [tab, setTab] = useState<TabId>("specs");

  // Solution submission form state
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    latency: number;
    passed: string;
    certId: string;
  } | null>(null);

  // Time remaining calculator (neutral initial state to prevent hydration mismatches)
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [isUpcoming, setIsUpcoming] = useState<boolean>(false);

  useEffect(() => {
    function updateCountdown() {
      if (challenge.status === "UPCOMING") {
        setTimeLeft("Not Open Yet");
        setIsClosed(true);
        setIsUpcoming(true);
        return;
      }

      const diff = new Date(challenge.closesAt).getTime() - Date.now();
      if (diff <= 0 || challenge.status === "ENDED") {
        setTimeLeft("Closed");
        setIsClosed(true);
        setIsUpcoming(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
      setIsClosed(false);
      setIsUpcoming(false);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [challenge.closesAt, challenge.status]);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % TABS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = TABS.length - 1;
    }

    if (targetIndex !== -1) {
      const targetTab = TABS[targetIndex];
      setTab(targetTab.id);
      const targetElement = document.getElementById(`tab-${targetTab.id}`);
      targetElement?.focus();
    }
  };

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || isClosed) return;

    setSubmitting(true);
    setEvalResult(null);

    // Simulated benchmark grading pipeline
    setTimeout(() => {
      setSubmitting(false);
      setEvalResult({
        score: 96.8,
        latency: 54,
        passed: "412 / 412 test cases",
        certId: `cert_${Math.random().toString(36).substring(2, 9)}`,
      });
    }, 1800);
  };

  return (
    <div className="mt-8 space-y-10">
      {/* Header Banner */}
      <div className="rounded-2xl border border-ink-line bg-ink-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent motion-safe:animate-pulse" />
            {challenge.status}
          </span>
          <span className="rounded-full border border-ink-line bg-ink px-3 py-1 font-mono text-xs text-muted-dark">
            {challenge.category}
          </span>
          <span className="rounded-full border border-ink-line bg-ink px-3 py-1 font-mono text-xs text-muted-dark">
            {challenge.difficulty}
          </span>
          <span className="ml-auto font-mono text-sm font-bold text-accent">
            {challenge.bounty}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-paper sm:text-4xl">
          {challenge.title}
        </h1>
        <p className="mt-2 text-base text-muted-dark sm:text-lg">
          {challenge.subtitle}
        </p>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ink-line pt-6 sm:grid-cols-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-dark">
              Enrolled Builders
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-paper">
              {challenge.participantsCount.toLocaleString("en-US")}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-dark">
              Total Submissions
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-paper">
              {challenge.submissionsCount.toLocaleString("en-US")}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-dark">
              {challenge.status === "UPCOMING" ? "Opens In" : "Closes In"}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-accent">
              {timeLeft}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-dark">
              Evaluation
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-paper">
              Auto-Graded
            </p>
          </div>
        </div>
      </div>

      {/* Accessible Tab List with Roving Keyboard Navigation */}
      <div
        role="tablist"
        aria-label="Challenge sections"
        className="flex border-b border-ink-line gap-2 overflow-x-auto pb-px"
      >
        {TABS.map((t, idx) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => handleTabKeyDown(e, idx)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-muted-dark hover:text-paper"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Specs */}
      {tab === "specs" && (
        <div
          id="panel-specs"
          role="tabpanel"
          aria-labelledby="tab-specs"
          className="space-y-8 motion-safe:animate-fade-up"
        >
          <div className="rounded-2xl border border-ink-line bg-ink-soft p-6">
            <h2 className="font-display text-xl font-bold text-paper">Program Overview</h2>
            <p className="mt-3 leading-relaxed text-paper/80">{challenge.overview}</p>
          </div>

          <div className="rounded-2xl border border-ink-line bg-ink-soft p-6">
            <h2 className="font-display text-xl font-bold text-paper">Problem Statement</h2>
            <p className="mt-3 leading-relaxed text-paper/80">{challenge.problemStatement}</p>
          </div>

          <div className="rounded-2xl border border-ink-line bg-ink-soft p-6">
            <h2 className="font-display text-xl font-bold text-paper">Technical Specifications</h2>
            <ul className="mt-4 space-y-3">
              {challenge.specifications.map((spec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-paper/85">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Check width={13} height={13} strokeWidth={2.4} />
                  </span>
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-ink-line bg-ink-soft p-6">
            <h2 className="font-display text-xl font-bold text-paper">Challenge Rules</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-dark">
              {challenge.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Evaluation */}
      {tab === "evaluation" && (
        <div
          id="panel-evaluation"
          role="tabpanel"
          aria-labelledby="tab-evaluation"
          className="rounded-2xl border border-ink-line bg-ink-soft p-6 sm:p-8 motion-safe:animate-fade-up"
        >
          <h2 className="font-display text-2xl font-bold text-paper">Automated Scoring Benchmark</h2>
          <p className="mt-2 text-sm text-muted-dark">
            Solutions are automatically evaluated inside isolated microVM sandboxes upon submission.
          </p>

          <div className="mt-6 divide-y divide-ink-line border-y border-ink-line">
            {challenge.evaluationCriteria.map((c) => (
              <div key={c.metric} className="flex flex-col justify-between py-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-paper">{c.metric}</p>
                  <p className="font-mono text-xs text-muted-dark">{c.benchmark}</p>
                </div>
                <span className="mt-2 inline-block rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-semibold text-accent sm:mt-0">
                  Weight: {c.weight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Leaderboard */}
      {tab === "leaderboard" && (
        <div
          id="panel-leaderboard"
          role="tabpanel"
          aria-labelledby="tab-leaderboard"
          className="rounded-2xl border border-ink-line bg-ink-soft overflow-hidden motion-safe:animate-fade-up"
        >
          <div className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-paper">Leaderboard Standings</h2>
            <span className="font-mono text-xs text-muted-dark">Updated continuously</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-line bg-ink font-mono text-xs uppercase text-muted-dark">
                <tr>
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Builder</th>
                  <th className="px-6 py-3">Test Cases</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-line">
                {challenge.leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`transition-colors ${
                      entry.isCurrentUser ? "bg-accent/10 font-semibold" : "hover:bg-ink"
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-muted-dark">
                      #{String(entry.rank).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-xs font-bold text-accent">
                        {entry.avatar}
                      </div>
                      <span className={entry.isCurrentUser ? "text-accent" : "text-paper"}>
                        {entry.username} {entry.isCurrentUser && "(You)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-dark">
                      {entry.testsPassed}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-dark">
                      {entry.latencyMs}ms
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-base font-bold text-accent">
                      {entry.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Submit Solution */}
      {tab === "submit" && (
        <div
          id="panel-submit"
          role="tabpanel"
          aria-labelledby="tab-submit"
          className="rounded-2xl border border-ink-line bg-ink-soft p-6 sm:p-8 motion-safe:animate-fade-up"
        >
          <h2 className="font-display text-2xl font-bold text-paper">Submit Your Solution</h2>
          <p className="mt-2 text-sm text-muted-dark">
            Provide your public repository. The automated evaluation pipeline will clone and benchmark your build against standard test cases.
          </p>

          {isUpcoming ? (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 text-sm text-amber-300">
              This challenge has not opened yet. Submissions will open once the challenge begins.
            </div>
          ) : isClosed ? (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-sm text-red-300">
              This challenge is currently closed for new submissions.
            </div>
          ) : (
            <form onSubmit={handleSubmitSolution} className="mt-6 space-y-5">
              <div>
                <label htmlFor="repo-url" className="block text-xs font-mono text-muted-dark uppercase tracking-wider mb-2">
                  GitHub Repository URL
                </label>
                <input
                  id="repo-url"
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-username/fraud-scoring-solution"
                  className="w-full rounded-xl border border-ink-line bg-ink px-4 py-3 text-sm text-paper outline-none focus:border-accent"
                />
              </div>

              <div>
                <label htmlFor="branch" className="block text-xs font-mono text-muted-dark uppercase tracking-wider mb-2">
                  Target Branch
                </label>
                <input
                  id="branch"
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-xl border border-ink-line bg-ink px-4 py-3 text-sm text-paper outline-none focus:border-accent"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-mono text-muted-dark uppercase tracking-wider mb-2">
                  Architecture Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Briefly describe key design decisions, cache invalidation strategy, and concurrency primitives..."
                  className="w-full rounded-xl border border-ink-line bg-ink px-4 py-3 text-sm text-paper outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-accent w-full sm:w-auto disabled:opacity-50"
              >
                {submitting ? "Running Automated Evaluation Suite…" : "Submit & Run Auto-Grader"}
                {!submitting && <ArrowRight width={16} height={16} />}
              </button>
            </form>
          )}

          {/* Test suite execution feedback */}
          {submitting && (
            <div className="mt-6 rounded-xl border border-ink-line bg-ink p-4 font-mono text-xs text-muted-dark space-y-2">
              <p className="motion-safe:animate-pulse text-accent">› spinning up ephemeral test runner container…</p>
              <p>› cloning repository and verifying dependencies…</p>
              <p>› executing concurrency stress tests (2,000 req/sec)…</p>
            </div>
          )}

          {evalResult && (
            <div className="mt-8 rounded-xl border border-accent/40 bg-accent/10 p-6 motion-safe:animate-fade-up">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-ink">
                  <Check width={18} height={18} strokeWidth={2.6} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-accent">
                    Evaluation Passed · Simulated Score: {evalResult.score}
                  </h3>
                  <p className="font-mono text-xs text-paper/70">
                    Certificate ID: {evalResult.certId} (Simulated Benchmark Demo)
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-accent/20 pt-4 text-xs font-mono sm:grid-cols-3">
                <div>
                  <span className="text-muted-dark">CORRECTNESS:</span>
                  <p className="text-paper font-semibold">{evalResult.passed}</p>
                </div>
                <div>
                  <span className="text-muted-dark">LATENCY (P95):</span>
                  <p className="text-paper font-semibold">{evalResult.latency}ms</p>
                </div>
                <div>
                  <span className="text-muted-dark">GLOBAL RANK:</span>
                  <p className="text-accent font-semibold">#02 (Top 1%)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
