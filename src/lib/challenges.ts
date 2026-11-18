export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  latencyMs: number;
  testsPassed: string;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface EvaluationCriterion {
  metric: string;
  benchmark: string;
  weight: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "Fintech & Fraud" | "Distributed Systems" | "Applied AI / LLM" | "Infrastructure";
  difficulty: "Intermediate" | "Advanced" | "Expert";
  deadline: string;
  startDate?: string;
  status?: "ACTIVE" | "UPCOMING" | "CLOSED";
  buildersCount: number;
  submissionsCount: number;
  summary: string;
  problemStatement: string;
  technicalRequirements: string[];
  evaluationCriteria: EvaluationCriterion[];
  starterCodeSnippet: string;
  leaderboard: LeaderboardEntry[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: "fraud-01",
    slug: "demo-challenge",
    title: "Real-Time Transaction Fraud Scoring",
    subtitle: "Streaming fraud assessment with sub-50ms latency guarantees.",
    category: "Fintech & Fraud",
    difficulty: "Advanced",
    deadline: "2026-11-25T23:59:59Z",
    startDate: "2026-11-01T00:00:00Z",
    status: "ACTIVE",
    buildersCount: 1284,
    submissionsCount: 367,
    summary:
      "Design and deploy an asynchronous transaction scoring engine that evaluates financial transactions against behavioral velocity thresholds.",
    problemStatement:
      "High-frequency debit/credit pipelines process tens of thousands of authorization requests per second. Your engine must ingest streaming transaction events, compute aggregate velocity windows, evaluate against rule-based and heuristics-based risk filters, and return a risk rating (ALLOW, REVIEW, BLOCK) in under 50ms at p99.",
    technicalRequirements: [
      "Process ISO 8583 and JSON financial payloads with zero deserialization memory leaks.",
      "Maintain a 15-minute sliding velocity cache per cardholder ID using partitioned memory rings.",
      "Guarantee deterministic idempotency across concurrent duplicate webhook requests.",
      "Achieve p99 response latency under 50ms at 5,000 requests per second.",
    ],
    evaluationCriteria: [
      { metric: "Precision & Recall", benchmark: "F1 Score >= 0.94", weight: "40%" },
      { metric: "p99 Execution Latency", benchmark: "< 45ms at 5,000 rps", weight: "30%" },
      { metric: "Memory Efficiency", benchmark: "< 256MB footprint", weight: "15%" },
      { metric: "Test Suite Coverage", benchmark: "100% edge-case passing", weight: "15%" },
    ],
    starterCodeSnippet: `// Solution entrypoint: fraudScorer.ts
export interface TransactionEvent {
  txId: string;
  cardholderId: string;
  amountCents: number;
  currency: string;
  timestamp: number;
}

export async function scoreTransaction(tx: TransactionEvent) {
  // Implement stateful sliding velocity checks
  return { action: "ALLOW", riskScore: 12, latencyMs: 8 };
}`,
    leaderboard: [
      { rank: 1, username: "k.iyer", score: 98.4, latencyMs: 24, testsPassed: "412/412", avatar: "KI" },
      { rank: 2, username: "marco.dev", score: 96.1, latencyMs: 31, testsPassed: "412/412", avatar: "MD" },
      { rank: 3, username: "alex.cloud", score: 95.7, latencyMs: 38, testsPassed: "412/412", avatar: "AC" },
      { rank: 4, username: "dev_99", score: 94.2, latencyMs: 44, testsPassed: "408/412", avatar: "D9" },
    ],
  },
  {
    id: "ratelimit-02",
    slug: "rate-limiter",
    title: "Distributed Token Bucket Rate Limiter",
    subtitle: "High-throughput token bucket algorithm across geo-distributed nodes.",
    category: "Distributed Systems",
    difficulty: "Expert",
    deadline: "2026-11-28T18:00:00Z",
    startDate: "2026-11-05T00:00:00Z",
    status: "ACTIVE",
    buildersCount: 942,
    submissionsCount: 281,
    summary:
      "Construct a resilient token bucket rate limiter capable of coordinating across multiple cluster nodes with atomic redis operations or CRDT counters.",
    problemStatement:
      "Public APIs require rigorous rate-limiting to prevent cascading service degradation. Build a tiered rate limiter supporting burst allowances, per-client custom tier limits, and strict sliding windows that handles network partition faults gracefully.",
    technicalRequirements: [
      "Implement classic Leaky Bucket and Token Bucket primitives.",
      "Support standard HTTP 429 semantics with Retry-After and X-RateLimit headers.",
      "Zero lock contention across 10,000 concurrent client tokens.",
    ],
    evaluationCriteria: [
      { metric: "Throughput", benchmark: "> 50k ops/sec", weight: "35%" },
      { metric: "Fairness under load", benchmark: "Zero starvation", weight: "35%" },
      { metric: "Partition Tolerance", benchmark: "Graceful local degradation", weight: "30%" },
    ],
    starterCodeSnippet: `export class DistributedLimiter {
  async consume(key: string, tokens: number = 1) {
    // Atomically evaluate bucket capacity
    return { allowed: true, remaining: 99 };
  }
}`,
    leaderboard: [
      { rank: 1, username: "s.patel", score: 99.1, latencyMs: 14, testsPassed: "512/512", avatar: "SP" },
      { rank: 2, username: "h.tanaka", score: 96.8, latencyMs: 19, testsPassed: "512/512", avatar: "HT" },
      { rank: 3, username: "alex.go", score: 94.3, latencyMs: 25, testsPassed: "506/512", avatar: "AG" },
    ],
  },
  {
    id: "eval-03",
    slug: "eval-copilot",
    title: "Autonomous Code Evaluation Agent",
    subtitle: "Multi-step sandboxed test execution and automated static analysis.",
    category: "Applied AI / LLM",
    difficulty: "Advanced",
    deadline: "2026-11-30T12:00:00Z",
    startDate: "2026-11-10T00:00:00Z",
    status: "ACTIVE",
    buildersCount: 1605,
    submissionsCount: 419,
    summary:
      "Build a verification agent that executes arbitrary untrusted test submissions inside micro-sandboxes with deterministic timeout handling.",
    problemStatement:
      "Online hackathons and skills assessments need automated evaluation. Build an orchestrator that checks out a Git repository, verifies security invariants, runs custom unit tests, and formats a standardized rubric score.",
    technicalRequirements: [
      "Enforce execution timeouts and resource constraints (cgroups / firejail).",
      "Produce structured JSON evaluation reports with deterministic rubric scoring.",
      "Prevent container escape and credential exfiltration attacks.",
    ],
    evaluationCriteria: [
      { metric: "Sandbox Isolation", benchmark: "100% containment pass", weight: "40%" },
      { metric: "Rubric Accuracy", benchmark: "> 98% correlation with human review", weight: "35%" },
      { metric: "Execution Overhead", benchmark: "< 1.2s container spinup", weight: "25%" },
    ],
    starterCodeSnippet: `export async function evaluateSubmission(repoUrl: string) {
  // Execute evaluation sandbox
  return { grade: "A+", score: 97.4, passed: true };
}`,
    leaderboard: [
      { rank: 1, username: "j.chen", score: 97.4, latencyMs: 42, testsPassed: "384/384", avatar: "JC" },
      { rank: 2, username: "elena.ai", score: 96.5, latencyMs: 51, testsPassed: "384/384", avatar: "EA" },
      { rank: 3, username: "dev_99", score: 93.8, latencyMs: 64, testsPassed: "372/384", avatar: "D9" },
    ],
  },
];

export function getAllChallenges(): Challenge[] {
  return CHALLENGES;
}

export function getChallenge(slugOrId: string): Challenge | undefined {
  return CHALLENGES.find(
    (c) => c.slug === slugOrId || c.id === slugOrId
  );
}
