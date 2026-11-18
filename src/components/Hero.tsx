import { ArrowRight } from "./icons";
import Reveal from "./Reveal";
import HeroPanelInteractive from "./HeroPanelInteractive";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[68px]">
      {/* atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 dotgrid-light opacity-50 dark:opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-[18%] -z-10 h-[360px] w-[460px] -translate-x-1/2 rounded-full bg-accent/40 blur-[120px] dark:bg-accent/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[14%] -z-10 h-[340px] w-[440px] translate-x-1/2 rounded-full bg-[#1fc9f5]/30 blur-[130px] dark:bg-[#1fc9f5]/15"
      />

      <div className="shell pb-16 pt-20 text-center sm:pt-24">
        <p className="kicker animate-fade-up">Hackathon-driven talent platform</p>

        <h1
          className="mx-auto mt-6 max-w-4xl text-balance font-display text-5xl font-extrabold leading-[0.98] tracking-tightest text-ink transition-colors dark:text-paper sm:text-6xl md:text-7xl animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
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

        <p
          className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-relaxed text-ink/65 transition-colors dark:text-paper/70 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Post your hardest problem as a live challenge and watch people
          actually build solutions to it. You see the work before you hire, so
          skill speaks louder than the résumé.
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row"
          style={{ animationDelay: "180ms" }}
        >
          <a href="#waitlist" className="btn-accent w-full sm:w-auto">
            Start a program
            <ArrowRight width={16} height={16} />
          </a>
          <a href="#builders" className="btn-ghost w-full sm:w-auto">
            For builders
          </a>
        </div>
      </div>

      {/* showpiece interactive product panel */}
      <Reveal delay={120} className="shell pb-20">
        <HeroPanelInteractive />
      </Reveal>
    </section>
  );
}
