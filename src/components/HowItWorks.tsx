import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Post a real problem",
    body: "Write up the actual thing you're stuck on, set a deadline, and put it live on its own page.",
  },
  {
    n: "02",
    title: "People build it",
    body: "Builders submit working code. Forge runs the checks, so you're not grading dozens of repos by hand.",
  },
  {
    n: "03",
    title: "You pick who's good",
    body: "Look at the work, shortlist the people behind it, and take the conversation from there.",
  },
];

export default function HowItWorks() {
  return (
    <section id="outcomes" className="border-y border-ink/10 bg-paper-deep/60 py-20 transition-colors dark:border-ink-line dark:bg-ink-soft/40 sm:py-24">
      <div className="shell">
        <Reveal className="max-w-xl">
          <p className="kicker">How it works</p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tightest text-ink dark:text-paper sm:text-4xl">
            Three steps, no recruiter in the middle
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="pt-5" style={{ borderTop: "2px solid transparent", borderImage: "var(--grad) 1" }}>
                <p className="grad-text font-display text-2xl font-extrabold tracking-tightest">{s.n}</p>
                <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-ink dark:text-paper">
                  {s.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65 dark:text-paper/70">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
