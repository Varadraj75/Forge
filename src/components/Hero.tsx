import Link from "next/link";
import { ArrowRight } from "./icons";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[68px]">
      {/* atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 dotgrid-light opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-[18%] -z-10 h-[360px] w-[460px] -translate-x-1/2 rounded-full bg-accent/40 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[14%] -z-10 h-[340px] w-[440px] translate-x-1/2 rounded-full bg-[#1fc9f5]/30 blur-[130px]"
      />

      <div className="shell pb-16 pt-20 text-center sm:pt-24">
        <p className="kicker animate-fade-up">Hackathon-driven talent platform</p>

        <h1 className="mx-auto mt-6 max-w-4xl text-balance font-display text-5xl font-extrabold leading-[0.98] tracking-tightest text-ink animate-fade-up sm:text-6xl md:text-7xl" style={{ animationDelay: "60ms" }}>
          Where talent and ideas{" "}
          <span className="relative whitespace-nowrap">
            <span className="grad-text">get built</span>
            <span
              aria-hidden
              className="glow-line absolute -bottom-1 left-0 right-0 rounded-full"
            />
          </span>
          .
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-relaxed text-ink/65 animate-fade-up" style={{ animationDelay: "120ms" }}>
          Post your hardest problem as a live challenge and watch people
          actually build solutions to it. You see the work before you hire, so
          skill speaks louder than the résumé.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row" style={{ animationDelay: "180ms" }}>
          <a href="#waitlist" className="btn-accent w-full sm:w-auto">
            Start a program
            <ArrowRight width={16} height={16} />
          </a>
          <a href="#builders" className="btn-ghost w-full sm:w-auto">
            For builders
          </a>
        </div>
      </div>

      {/* showpiece product panel */}
      <Reveal delay={120} className="shell pb-20">
        <HeroPanel />
      </Reveal>
    </section>
  );
}

function HeroPanel() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-xl2 border border-ink/10 bg-ink shadow-[0_40px_120px_-40px_rgba(10,10,11,0.55)]">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-ink-line px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <Link
            href="/challenges/demo-challenge"
            className="ml-3 font-mono text-xs text-muted-dark transition-colors hover:text-accent hover:underline underline-offset-4"
          >
            forge.app/c/demo-challenge ↗
          </Link>
          <span className="ml-auto flex items-center gap-2 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            LIVE
          </span>
        </div>

        <div className="grid gap-px bg-ink-line sm:grid-cols-[1.4fr_1fr]">
          {/* left: challenge + stats + leaderboard */}
          <div className="bg-ink p-6 dotgrid">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-dark">
              Hiring hackathon
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-paper">
              Real-time fraud scoring
            </h3>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "Builders", v: "1,284" },
                { k: "Submissions", v: "367" },
                { k: "Closes in", v: "06:41:22" },
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
              {[
                { n: "k.iyer", score: 98.4, you: false },
                { n: "marco.dev", score: 96.1, you: false },
                { n: "you", score: 95.7, you: true },
              ].map((row, i) => (
                <div
                  key={row.n}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
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

          {/* right: submission / scoring preview */}
          <div className="bg-ink-soft p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-dark">
              Auto-evaluation
            </p>
            <div className="mt-4 space-y-2.5 font-mono text-xs leading-relaxed">
              <p className="text-muted-dark">› running test suite…</p>
              <p className="text-paper/70">
                <span className="text-accent">PASS</span> 412 / 412 cases
              </p>
              <p className="text-paper/70">
                <span className="text-accent">PASS</span> latency p95 &lt; 80ms
              </p>
              <p className="text-paper/70">
                code quality <span className="text-accent">A</span>
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-ink-line bg-ink p-4">
              <div className="flex items-end justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-dark">
                  Skill signal
                </p>
                <p className="grad-text font-display text-xl font-bold">95.7</p>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { k: "Algorithms", v: 92 },
                  { k: "System design", v: 88 },
                  { k: "Code quality", v: 97 },
                ].map((b) => (
                  <div key={b.k}>
                    <div className="flex justify-between font-mono text-[10px] text-muted-dark">
                      <span>{b.k}</span>
                      <span>{b.v}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-line">
                      <div className="h-full rounded-full" style={{ width: `${b.v}%`, backgroundImage: "var(--grad)" }} />
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
