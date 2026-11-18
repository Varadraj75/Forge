export default function LivePlatformStatsSkeleton() {
  return (
    <section
      aria-label="Loading platform telemetry"
      className="shell my-12"
    >
      <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-sm dark:border-ink-line dark:bg-ink-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink/10 pb-4 dark:border-ink-line">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent/60" />
            <div className="h-4 w-44 motion-safe:animate-pulse rounded bg-ink/10 dark:bg-white/10" />
          </div>
          <div className="h-4 w-32 motion-safe:animate-pulse rounded bg-ink/10 dark:bg-white/10" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-ink/5 bg-paper/60 p-4 dark:border-ink-line/50 dark:bg-ink/40"
            >
              <div className="h-3 w-20 motion-safe:animate-pulse rounded bg-ink/10 dark:bg-white/10" />
              <div className="mt-3 h-8 w-16 motion-safe:animate-pulse rounded bg-ink/15 dark:bg-white/15" />
              <div className="mt-2 h-2.5 w-24 motion-safe:animate-pulse rounded bg-ink/10 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
