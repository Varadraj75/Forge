"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import type { Challenge, LeaderboardEntry } from "@/lib/challenges";
import { Check, ArrowRight } from "@/components/icons";

interface Props {
  challenge: Challenge;
}

type TabType = "specs" | "evaluation" | "leaderboard" | "submit";

function computeTimeRemaining(deadlineStr: string) {
  const targetDate = new Date(deadlineStr).getTime();
  const distance = targetDate - Date.now();
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

export default function ChallengeClientView({ challenge }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("specs");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Immediate initial countdown computation from challenge.deadline
  const [timeLeft, setTimeLeft] = useState(() =>
    computeTimeRemaining(challenge.deadline)
  );

  useEffect(() => {
    const update = () => {
      setTimeLeft(computeTimeRemaining(challenge.deadline));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [challenge.deadline]);

  // Submission form state
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(challenge.leaderboard);
  const [submissionResult, setSubmissionResult] = useState<{
    passed: boolean;
    score: number;
    latency: number;
    grade: string;
    casesPassed: string;
  } | null>(null);

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (timeLeft.isExpired) {
      setErrorMessage("This challenge has ended. Submissions are now closed.");
      return;
    }

    if (!repoUrl || !repoUrl.startsWith("http")) {
      setErrorMessage("Please enter a valid Git repository URL (https://...).");
      return;
    }

    setSubmitting(true);
    setSubmissionResult(null);

    // Simulate multi-stage automated sandbox evaluation
    setTimeout(() => {
      setSubmitting(false);
      const result = {
        passed: true,
        score: 96.4,
        latency: 34,
        grade: "A+",
        casesPassed: "412/412",
      };
      setSubmissionResult(result);

      // Add user submission to live local leaderboard
      const userEntry: LeaderboardEntry = {
        rank: 2,
        username: "you (verified)",
        score: result.score,
        latencyMs: result.latency,
        testsPassed: result.casesPassed,
        avatar: "YOU",
        isCurrentUser: true,
      };

      setLeaderboard((prev) => {
        const withoutUser = prev.filter((p) => !p.isCurrentUser);
        const combined = [...withoutUser, userEntry].sort((a, b) => b.score - a.score);
        return combined.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      });
    }, 1200);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "specs", label: "Problem Specs" },
    { id: "evaluation", label: "Evaluation Rubric" },
    { id: "leaderboard", label: "Live Leaderboard" },
    { id: "submit", label: "Submit Solution" },
  ];

  // WAI-ARIA roving keyboard navigation across tabs
  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      setActiveTab(tabs[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics & Countdown Bar */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink/10 bg-paper-card p-5 sm:grid-cols-4 dark:border-ink-line dark:bg-ink-soft">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            Registered Builders
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink dark:text-paper">
            {challenge.buildersCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            Total Submissions
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink dark:text-paper">
            {challenge.submissionsCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            Evaluation Latency
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-accent">
            &lt; 50ms p99
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted dark:text-muted-dark">
            {timeLeft.isExpired ? "Status" : "Closes In"}
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-ink dark:text-paper">
            {timeLeft.isExpired
              ? "Closed"
              : `${String(timeLeft.days).padStart(2, "0")}d : ${String(timeLeft.hours).padStart(2, "0")}h : ${String(timeLeft.minutes).padStart(2, "0")}m : ${String(timeLeft.seconds).padStart(2, "0")}s`}
          </p>
        </div>
      </div>

      {/* Accessible Tab Navigation with WAI-ARIA Roving Focus */}
      <div
        role="tablist"
        aria-label="Challenge details"
        className="flex flex-wrap gap-2 border-b border-ink/10 pb-3 dark:border-ink-line"
      >
        {tabs.map((t, idx) => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={isSelected}
              aria-controls={`panel-${t.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(t.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`min-h-11 px-4 py-2 inline-flex items-center justify-center rounded-lg font-mono text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? "bg-accent text-ink font-bold shadow-sm"
                  : "bg-paper-card text-ink/70 hover:text-ink border border-ink/10 dark:border-ink-line dark:bg-ink-soft dark:text-paper/70 dark:hover:text-paper"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels with WAI-ARIA APG Attributes */}
      {activeTab === "specs" && (
        <div
          role="tabpanel"
          id="panel-specs"
          aria-labelledby="tab-specs"
          tabIndex={0}
          className="space-y-6 focus:outline-none"
        >
          <div className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft">
            <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
              Problem Statement
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80 dark:text-paper/80">
              {challenge.problemStatement}
            </p>
          </div>

          <div className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft">
            <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
              Technical Requirements
            </h2>
            <ul className="mt-4 space-y-3">
              {challenge.technicalRequirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-ink/80 dark:text-paper/80"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Check width={12} height={12} strokeWidth={2.4} />
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-ink/10 bg-ink p-6 text-paper dark:border-ink-line">
            <div className="flex items-center justify-between border-b border-ink-line pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-dark">
                Starter Code Template
              </span>
              <span className="font-mono text-xs text-accent">TypeScript 5</span>
            </div>
            <pre className="mt-4 overflow-x-auto font-mono text-xs leading-relaxed text-paper/90">
              <code>{challenge.starterCodeSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {activeTab === "evaluation" && (
        <div
          role="tabpanel"
          id="panel-evaluation"
          aria-labelledby="tab-evaluation"
          tabIndex={0}
          className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft focus:outline-none"
        >
          <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
            Evaluation Rubric &amp; Weighting
          </h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
            Solutions are automatically assessed against this criteria in our isolated micro-VM sandboxes.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-ink/10 text-muted dark:border-ink-line dark:text-muted-dark">
                <tr>
                  <th className="pb-3 pr-4 font-semibold uppercase">Metric</th>
                  <th className="pb-3 pr-4 font-semibold uppercase">Target Benchmark</th>
                  <th className="pb-3 text-right font-semibold uppercase">Score Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 dark:divide-ink-line">
                {challenge.evaluationCriteria.map((c, i) => (
                  <tr key={i} className="hover:bg-accent/5">
                    <td className="py-3.5 pr-4 font-medium text-ink dark:text-paper">
                      {c.metric}
                    </td>
                    <td className="py-3.5 pr-4 text-ink/70 dark:text-paper/70">
                      {c.benchmark}
                    </td>
                    <td className="py-3.5 text-right font-bold text-accent">
                      {c.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div
          role="tabpanel"
          id="panel-leaderboard"
          aria-labelledby="tab-leaderboard"
          tabIndex={0}
          className="rounded-xl border border-ink/10 bg-paper-card p-6 dark:border-ink-line dark:bg-ink-soft focus:outline-none"
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-4 dark:border-ink-line">
            <div>
              <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
                Live Challenge Leaderboard
              </h2>
              <p className="text-xs text-muted dark:text-muted-dark">
                Ranked by verification test passing rate and p99 execution latency.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-accent">
              Active Session
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.username}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  entry.isCurrentUser
                    ? "border-accent bg-accent/10 dark:border-accent dark:bg-accent/15"
                    : "border-ink/10 bg-paper dark:border-ink-line dark:bg-ink"
                }`}
              >
                <span className="w-6 font-mono text-sm font-bold text-muted dark:text-muted-dark">
                  #{entry.rank}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${
                    entry.isCurrentUser
                      ? "bg-accent text-ink"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {entry.avatar}
                </span>
                <div>
                  <span className="text-sm font-semibold text-ink dark:text-paper">
                    {entry.username}
                  </span>
                  <p className="text-[11px] text-muted dark:text-muted-dark">
                    Passed: {entry.testsPassed} · Latency: {entry.latencyMs}ms
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <span className="font-mono text-base font-bold text-ink dark:text-paper">
                    {entry.score}
                  </span>
                  <span className="block text-[10px] uppercase text-muted dark:text-muted-dark">
                    pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "submit" && (
        <div
          role="tabpanel"
          id="panel-submit"
          aria-labelledby="tab-submit"
          tabIndex={0}
          className="rounded-xl border border-ink/10 bg-paper-card p-6 sm:p-8 dark:border-ink-line dark:bg-ink-soft focus:outline-none"
        >
          <h2 className="font-display text-xl font-bold text-ink dark:text-paper">
            Submit Solution for Evaluation
          </h2>
          <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
            Provide your public Git repository URL. Forge evaluates the solution inside an isolated sandbox and posts your score to the live leaderboard.
          </p>

          <form onSubmit={handleSubmitSolution} className="mt-6 space-y-4">
            <div>
              <label htmlFor="repo-url" className="block font-mono text-xs uppercase text-muted dark:text-muted-dark">
                Repository URL (GitHub / GitLab)
              </label>
              <input
                id="repo-url"
                type="url"
                required
                disabled={timeLeft.isExpired}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/forge-solution"
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-ink-line dark:bg-ink dark:text-paper disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="repo-branch" className="block font-mono text-xs uppercase text-muted dark:text-muted-dark">
                  Target Branch
                </label>
                <input
                  id="repo-branch"
                  type="text"
                  disabled={timeLeft.isExpired}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-ink-line dark:bg-ink dark:text-paper disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block font-mono text-xs uppercase text-muted dark:text-muted-dark">
                  Architecture Notes (Optional)
                </label>
                <input
                  id="notes"
                  type="text"
                  disabled={timeLeft.isExpired}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring buffer with LRU cache"
                  className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-ink-line dark:bg-ink dark:text-paper disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || timeLeft.isExpired}
              className="btn-accent inline-flex w-full items-center justify-center gap-2 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span>Evaluating in sandbox...</span>
              ) : timeLeft.isExpired ? (
                <span>Submissions Closed</span>
              ) : (
                <>
                  <span>Run Sandbox Tests</span>
                  <ArrowRight width={16} height={16} />
                </>
              )}
            </button>
          </form>

          {/* Submission Feedback Result */}
          {submissionResult && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-5 dark:border-accent/40 dark:bg-accent/10"
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent">
                <Check width={14} height={14} strokeWidth={2.4} />
                <span>Sandbox Verification Passed — Grade {submissionResult.grade}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-ink/10 bg-paper p-2.5 dark:border-ink-line dark:bg-ink">
                  <span className="block font-mono text-[10px] text-muted dark:text-muted-dark uppercase">Score</span>
                  <span className="font-mono text-base font-bold text-ink dark:text-paper">{submissionResult.score}</span>
                </div>
                <div className="rounded-lg border border-ink/10 bg-paper p-2.5 dark:border-ink-line dark:bg-ink">
                  <span className="block font-mono text-[10px] text-muted dark:text-muted-dark uppercase">p99 Latency</span>
                  <span className="font-mono text-base font-bold text-ink dark:text-paper">{submissionResult.latency}ms</span>
                </div>
                <div className="rounded-lg border border-ink/10 bg-paper p-2.5 dark:border-ink-line dark:bg-ink">
                  <span className="block font-mono text-[10px] text-muted dark:text-muted-dark uppercase">Edge Cases</span>
                  <span className="font-mono text-base font-bold text-ink dark:text-paper">{submissionResult.casesPassed}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-ink/70 dark:text-paper/70">
                Your submission has been verified and added to the{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("leaderboard")}
                  className="font-semibold text-accent underline underline-offset-2 hover:opacity-80"
                >
                  live leaderboard
                </button>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
