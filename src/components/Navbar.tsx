"use client";

import { useEffect, useState, useRef } from "react";
import { Logo, Menu, Close, ArrowRight } from "./icons";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#outcomes" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled
        ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md dark:border-white/10 dark:bg-ink/85"
        : "border-b border-transparent"
        }`}
    >
      <nav aria-label="Main navigation" className="shell flex h-[68px] items-center justify-between">
        <a href="#top" aria-label="Forge home" className="focus-visible:rounded-lg">
          <Logo />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-ink/70 transition-colors hover:text-ink focus-visible:rounded-md dark:text-paper/70 dark:hover:text-paper"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <a href="#waitlist" className="btn-accent">
            Get started
            <ArrowRight width={16} height={16} />
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            ref={toggleRef}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors dark:border-white/20 dark:text-paper"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        aria-hidden={!open}
        className={`border-t border-ink/10 bg-paper shadow-lg dark:border-white/10 dark:bg-ink md:hidden ${open ? "block" : "hidden"
          }`}
      >
        <div className="shell flex flex-col gap-1 py-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="min-h-11 inline-flex items-center rounded-lg px-3 py-2 text-base font-medium text-ink/80 hover:bg-ink/5 dark:text-paper/80 dark:hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-ink/10 dark:border-white/10">
            <a
              href="#waitlist"
              onClick={() => setOpen(false)}
              className="btn-accent"
            >
              Get started
              <ArrowRight width={16} height={16} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
