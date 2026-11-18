import { Logo, LinkedInIcon, XIcon } from "./icons";

interface FooterColumn {
  title: string;
  links: { label: string; href?: string }[];
}

const columns: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "Innovation hackathons", href: "#platform" },
      { label: "Hiring hackathons", href: "#builders" },
      { label: "Skill validation", href: "#platform" },
      { label: "AI capacity building", href: "#platform" },
    ],
  },
  {
    title: "Program",
    links: [
      { label: "How it works", href: "#outcomes" },
      { label: "Questions & FAQ", href: "#faq" },
      { label: "For builders", href: "#builders" },
      { label: "Request walkthrough", href: "#waitlist" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Challenge library" },
      { label: "Guides & documentation" },
      { label: "Security & integrity" },
      { label: "System status" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Early access waitlist", href: "#waitlist" },
      { label: "Sign in", href: "#waitlist" },
      { label: "Contact program team", href: "#waitlist" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink text-paper">
      <div className="shell py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo invert />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-dark">
              Hackathons, skills-based hiring, and AI upskilling, all in one
              place.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#top"
                aria-label="Forge on LinkedIn (Prototype)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-line text-paper/70 transition-colors hover:border-accent hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <LinkedInIcon width={18} height={18} />
              </a>
              <a
                href="#top"
                aria-label="Forge on X (Prototype)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-line text-paper/70 transition-colors hover:border-accent hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <XIcon width={17} height={17} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-dark">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <a
                        href={l.href}
                        className="text-sm text-paper/70 transition-colors hover:text-paper focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <span className="text-sm text-paper/40 cursor-default">
                        {l.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-dark">
            © {new Date().getFullYear()} Forge. Built for IEEE IGDTUW Open Source Week 10.0.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-dark">
            <span className="hover:text-paper cursor-default">Privacy Policy</span>
            <span className="hover:text-paper cursor-default">Terms of Service</span>
            <span className="hover:text-paper cursor-default">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
