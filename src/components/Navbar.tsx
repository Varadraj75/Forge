"use client";

import { useEffect, useState } from "react";
import { Logo, Menu, Close, ArrowRight } from "./icons";

const links = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#outcomes" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-[68px] items-center justify-between">
        <a href="#top" aria-label="Forge home">
          <Logo />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a href="#waitlist" className="text-sm font-medium text-ink/80 hover:text-ink">
            Sign in
          </a>
          <a href="#waitlist" className="btn-accent">
            Get started
            <ArrowRight width={16} height={16} />
          </a>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-paper md:hidden">
          <div className="shell flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-ink/80 hover:bg-ink/5"
              >
                {l.label}
              </a>
            ))}
            <a href="#waitlist" onClick={() => setOpen(false)} className="btn-accent mt-2 w-full">
              Get started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
