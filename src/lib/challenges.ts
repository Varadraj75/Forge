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
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  status: "LIVE" | "UPCOMING" | "ENDED";
  closesAt: string; // ISO date
  participantsCount: number;
  submissionsCount: number;
  bounty: string;
  overview: string;
  problemStatement: string;
  specifications: string[];
  rules: string[];
  evaluationCriteria: EvaluationCriterion[];
  leaderboard: LeaderboardEntry[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: "c_fraud_scoring",
    slug: "demo-challenge",
    title: "Real-Time Fraud Scoring Engine",
    subtitle: "Score incoming financial transactions at high throughput with sub-80ms p95 latency.",
    category: "Fintech & Fraud",
    difficulty: "Advanced",
    status: "LIVE",
    closesAt: "2026-11-20T18:00:00Z",
    participantsCount: 1284,
    submissionsCount: 367,
    bounty: "$12,500 Prize Pool",
    overview:
      "Modern payment processors handle tens of thousands of card events every second. In this challenge, your task is to build a microservice capable of evaluating transactions against velocity rules, geographic anomalies, and risk heuristics in real-time.",
    problemStatement:
      "Build an HTTP/gRPC service that ingests transaction payloads, evaluates historical transaction windows for each cardholder within memory, and returns a fraud confidence score between 0.00 and 100.00. The engine must reject malicious payloads and sustain high throughput under concurrent load.",
    specifications: [
      "Process transactions with strict p95 latency under 80ms at 2,000 requests per second.",
      "Track rolling 1-hour and 24-hour spending velocity per cardholder account.",
      "Flag sudden geographic leaps (speed of travel > 800 km/h between successive card events).",
      "Zero memory leaks over 24-hour continuous benchmark runs.",
      "Expose /healthz and /metrics endpoints compatible with Prometheus format.",
    ],
    rules: [
      "All submissions must be open source and runnable via Docker or standard CLI.",
      "Plagiarism and verbatim copying of existing solutions will result in immediate disqualification.",
      "AI-assisted coding is permitted, but the submission must pass comprehensive code quality and originality checks.",
    ],
    evaluationCriteria: [
      { metric: "Correctness & Accuracy", benchmark: "412 / 412 test cases passed", weight: "40%" },
      { metric: "Latency & Throughput", benchmark: "p95 < 80ms @ 2,000 req/s", weight: "30%" },
      { metric: "Architecture & Code Quality", benchmark: "Grade A linting and clean modular design", weight: "20%" },
      { metric: "Integrity & Originality", benchmark: "Passed AI integrity & originality audit", weight: "10%" },
    ],
    leaderboard: [
      { rank: 1, username: "k.iyer", score: 98.4, latencyMs: 42, testsPassed: "412/412", avatar: "KI" },
      { rank: 2, username: "marco.dev", score: 96.1, latencyMs: 58, testsPassed: "412/412", avatar: "MD" },
      { rank: 3, username: "you", score: 95.7, latencyMs: 62, testsPassed: "412/412", avatar: "YO", isCurrentUser: true },
      { rank: 4, username: "sara.chen", score: 93.8, latencyMs: 71, testsPassed: "409/412", avatar: "SC" },
      { rank: 5, username: "alex_b", score: 91.2, latencyMs: 76, testsPassed: "405/412", avatar: "AB" },
      { rank: 6, username: "dev_rishi", score: 89.5, latencyMs: 79, testsPassed: "398/412", avatar: "DR" },
    ],
  },
  {
    id: "c_anomaly_detection",
    slug: "stream-anomaly-detection",
    title: "High-Throughput Stream Anomaly Detection",
    subtitle: "Identify outlier telemetry signals across 10,000 IoT sensor nodes with sliding window algorithms.",
    category: "Distributed Systems",
    difficulty: "Expert",
    status: "LIVE",
    closesAt: "2026-11-25T12:00:00Z",
    participantsCount: 842,
    submissionsCount: 195,
    bounty: "$10,000 Prize Pool",
    overview:
      "IoT fleets stream millions of telemetry events every minute. Build an anomaly detection pipeline that maintains dynamic threshold baselines and detects anomalies without drowning in false positives.",
    problemStatement:
      "Design an event processor that consumes simulated IoT sensor metrics, calculates exponentially weighted moving averages and Z-scores over sliding timeframes, and broadcasts anomaly alarms within 200ms of occurrence.",
    specifications: [
      "Sustain stream ingestion of 50,000 events/sec.",
      "Calculate dynamic anomaly thresholding per device category.",
      "Provide an alert stream with deduplication and suppression windows.",
    ],
    rules: [
      "Solutions must be accompanied by comprehensive unit tests.",
      "Code must pass memory profiling without leaking under high volume.",
    ],
    evaluationCriteria: [
      { metric: "Precision & Recall", benchmark: "F1 Score > 0.94", weight: "45%" },
      { metric: "Throughput Capability", benchmark: "> 50k events/sec", weight: "35%" },
      { metric: "Code Robustness", benchmark: "Graceful error recovery", weight: "20%" },
    ],
    leaderboard: [
      { rank: 1, username: "elena_v", score: 97.9, latencyMs: 110, testsPassed: "100%", avatar: "EV" },
      { rank: 2, username: "cyber_fox", score: 95.3, latencyMs: 135, testsPassed: "99%", avatar: "CF" },
      { rank: 3, username: "quantum_coder", score: 94.0, latencyMs: 142, testsPassed: "97%", avatar: "QC" },
    ],
  },
  {
    id: "c_rag_copilot",
    slug: "rag-copilot-benchmarks",
    title: "Enterprise RAG Evaluation & Hallucination Guard",
    subtitle: "Build an evaluation harness to audit retrieval-augmented generation outputs for truthfulness.",
    category: "Applied AI / LLM",
    difficulty: "Intermediate",
    status: "LIVE",
    closesAt: "2026-11-28T23:59:00Z",
    participantsCount: 1530,
    submissionsCount: 412,
    bounty: "$15,000 Prize Pool",
    overview:
      "RAG applications often hallucinate or cite irrelevant context. In this challenge, build an automated verification engine that compares generated answers against retrieved ground truth documents.",
    problemStatement:
      "Create an evaluation pipeline that consumes query-context-response triplets, computes lexical and semantic grounding scores, and outputs a confidence index with citation verification.",
    specifications: [
      "Zero-shot semantic citation attribution check.",
      "Latency under 1.5 seconds per document verification.",
      "Explainable verification report detailing supported vs ungrounded statements.",
    ],
    rules: [
      "Use open-source models or standard APIs.",
      "Benchmarked on a blinded test set of 1,000 enterprise queries.",
    ],
    evaluationCriteria: [
      { metric: "Hallucination Detection Accuracy", benchmark: "AUC-ROC > 0.92", weight: "50%" },
      { metric: "Verification Latency", benchmark: "< 1.5s per claim", weight: "30%" },
      { metric: "Report Clarity", benchmark: "Actionable citation mapping", weight: "20%" },
    ],
    leaderboard: [
      { rank: 1, username: "ai_architect", score: 99.1, latencyMs: 820, testsPassed: "100%", avatar: "AA" },
      { rank: 2, username: "turing_complete", score: 96.8, latencyMs: 910, testsPassed: "98%", avatar: "TC" },
      { rank: 3, username: "data_samurai", score: 94.7, latencyMs: 1050, testsPassed: "96%", avatar: "DS" },
    ],
  },
];

export function getChallenge(idOrSlug: string): Challenge | undefined {
  const normalized = idOrSlug.toLowerCase().trim();
  return CHALLENGES.find(
    (c) =>
      c.id.toLowerCase() === normalized ||
      c.slug.toLowerCase() === normalized ||
      (normalized === "real-time-fraud-scoring" && c.slug === "demo-challenge")
  );
}

export function getAllChallenges(): Challenge[] {
  return CHALLENGES;
}
