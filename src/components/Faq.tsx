"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is Forge live yet?",
    a: "Not really. This is a concept and a working prototype. The signup form below talks to a real API, but there's no production platform behind it yet.",
  },
  {
    q: "How is this different from a normal job board?",
    a: "Job boards show you what people say about themselves. Forge shows you what they actually build, under the same conditions as everyone else.",
  },
  {
    q: "Do builders pay to take part?",
    a: "No. Builders join challenges for free. The companies running the programs are the ones who cover the cost.",
  },
  {
    q: "What stops someone from getting AI to do all the work?",
    a: "Submissions go through plagiarism and AI-assist checks, and the scoring looks at how a solution behaves, not just whether it compiles.",
  },
  {
    q: "Who owns what gets built?",
    a: "That gets set per challenge, up front, so everyone knows the terms before they start.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div aria-hidden className="glow-line absolute inset-x-0 top-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-[14%] h-44 w-[40%] rounded-full bg-[#1fc9f5]/20 blur-[90px]"
      />

      <div className="shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker text-muted-dark">Questions</p>
          <h2 className="mt-4 text-balance font-display text-4xl font-extrabold tracking-tightest text-paper sm:text-5xl">
            The honest answers
          </h2>
        </div>

        <div className="mx-auto mt-14 max-w-2xl divide-y divide-ink-line border-y border-ink-line">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="font-display text-lg font-semibold text-paper">{f.q}</span>
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border border-ink-line text-paper/70 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl pb-6 text-[15px] leading-relaxed text-muted-dark">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
