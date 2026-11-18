import { getPlatformTelemetry } from "@/lib/telemetry";

export default async function LivePlatformStats() {
  const telemetry = await getPlatformTelemetry();

  const metrics = [
    {
      label: "Early Access Queue",
      value: telemetry.waitlistRegistrations.toString(),
      sub: "Live waitlist signups",
      highlight: true,
    },
    {
      label: "Challenge Tracks",
      value: `${telemetry.challengeTracks} Tracks`,
      sub: "Curated launch tracks",
      highlight: false,
    },
    {
      label: "Auto-Eval Target",
      value: "Pre-launch",
      sub: "Verification suite target",
      highlight: false,
    },
    {
      label: "Target p95 Latency",
      value: `< ${telemetry.benchmarkP95LatencyMs}ms`,
      sub: "Architecture latency goal",
      highlight: false,
    },
  ];

  return (
    <section
      aria-label="Platform telemetry and prototype benchmarks"
      className="shell my-12"
    >
      <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-[0_20px_50px_-20px_rgba(10,10,11,0.08)] transition-colors dark:border-ink-line dark:bg-ink-soft dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
        {/* subtle gradient glow line on top */}
        <div aria-hidden className="glow-line absolute inset-x-0 top-0 opacity-70" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-ink/10 pb-4 dark:border-ink-line">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink dark:text-paper">
              Platform Telemetry
            </span>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] font-medium text-ink dark:text-accent">
              Prototype Metrics
            </span>
          </div>

          <div className="font-mono text-[11px] text-muted dark:text-muted-dark">
            Live waitlist feed · Prototype architecture targets
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${m.highlight
                ? "border-accent/40 bg-accent/10 dark:border-accent/30 dark:bg-accent/5"
                : "border-ink/5 bg-paper/60 dark:border-ink-line dark:bg-ink/60"
                }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted dark:text-muted-dark">
                {m.label}
              </p>
              <p
                className={`mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl ${m.highlight
                  ? "grad-text"
                  : "text-ink dark:text-paper"
                  }`}
              >
                {m.value}
              </p>
              <p className="mt-1 text-xs text-muted dark:text-muted-dark">
                {m.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
