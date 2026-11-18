"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { ArrowRight, Check } from "./icons";

type Intent = "company" | "builder";
type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  name: string;
  email: string;
  organization: string;
  intent: Intent;
  hp: string;
}

const empty: FormState = { name: "", email: "", organization: "", intent: "company", hp: "" };

export default function Waitlist() {
  const [form, setForm] = useState<FormState>(empty);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const orgInputRef = useRef<HTMLInputElement>(null);
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});
    setMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        const fieldErrors = data.errors ?? {};
        setErrors(fieldErrors);
        setMessage(data.message ?? data.error ?? "Please resolve the highlighted fields.");
        setStatus("error");

        // Programmatically focus the first invalid field for assistive tech
        if (fieldErrors.name && nameInputRef.current) {
          nameInputRef.current.focus();
        } else if (fieldErrors.email && emailInputRef.current) {
          emailInputRef.current.focus();
        } else if (fieldErrors.organization && orgInputRef.current) {
          orgInputRef.current.focus();
        }
        return;
      }

      setStatus("success");
      setMessage(data.message ?? "You're on the list.");
    } catch {
      setMessage("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  const intents: { id: Intent; label: string }[] = [
    { id: "company", label: "For companies" },
    { id: "builder", label: "For builders" },
  ];

  const handleIntentKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % intents.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + intents.length) % intents.length;
    }

    if (nextIndex !== currentIndex) {
      update("intent", intents[nextIndex].id);
      radioRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="py-24 sm:py-32">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-paper-card shadow-[0_40px_120px_-50px_rgba(10,10,11,0.3)] transition-colors dark:border-ink-line dark:bg-ink-soft dark:shadow-[0_40px_120px_-50px_rgba(0,0,0,0.7)]">
          <div aria-hidden className="glow-line absolute inset-x-0 top-0 z-10" />
          <div className="grid lg:grid-cols-2">
            {/* left: pitch */}
            <div className="relative flex flex-col justify-center bg-ink p-9 sm:p-12 dotgrid">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-accent/25 blur-[80px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-[#1fc9f5]/25 blur-[80px]"
              />
              <p className="kicker text-muted-dark">Get started</p>
              <h2
                id="waitlist-title"
                className="mt-4 text-balance font-display text-3xl font-extrabold leading-tight tracking-tightest text-paper sm:text-4xl"
              >
                Bring your next program to Forge
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-muted-dark">
                Tell us a bit about you and we&apos;ll set up a walkthrough.
                Companies get a plan built around their goals; builders get early
                access to live challenges.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Built around your problem, not a template",
                  "See how people do on real work, not interviews",
                  "Open to both companies and builders",
                ].map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-paper/80">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/25 text-accent">
                      <Check width={13} height={13} strokeWidth={2.4} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* right: form */}
            <div className="p-9 sm:p-12">
              {status === "success" ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex h-full flex-col items-center justify-center text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/30 text-ink dark:bg-accent/20 dark:text-accent">
                    <Check width={26} height={26} strokeWidth={2.2} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink dark:text-paper">
                    You&apos;re on the list
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-ink/60 dark:text-paper/60">{message}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(empty);
                      setStatus("idle");
                      setMessage("");
                    }}
                    className="mt-6 text-sm font-semibold text-ink underline underline-offset-4 focus-visible:rounded-md dark:text-paper"
                  >
                    Submit another response
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  {/* Honeypot field for bot spam detection */}
                  <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                    <label htmlFor="company-hp">Company Homepage</label>
                    <input
                      id="company-hp"
                      type="text"
                      name="hp"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.hp}
                      onChange={(e) => update("hp", e.target.value)}
                    />
                  </div>
                  <fieldset>
                    <legend className="sr-only">Select your account intent</legend>
                    <div
                      role="radiogroup"
                      aria-label="Account intent"
                      className="grid grid-cols-2 gap-2 rounded-full border border-ink/10 bg-paper p-1 dark:border-ink-line dark:bg-ink"
                    >
                      {intents.map((it, idx) => {
                        const isSelected = form.intent === it.id;
                        return (
                          <button
                            type="button"
                            key={it.id}
                            ref={(el) => {
                              radioRefs.current[idx] = el;
                            }}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isSelected ? 0 : -1}
                            onKeyDown={(e) => handleIntentKeyDown(e, idx)}
                            onClick={() => update("intent", it.id)}
                            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${isSelected
                              ? "bg-ink text-paper dark:bg-paper dark:text-ink shadow-sm"
                              : "text-ink/55 hover:text-ink dark:text-paper/60 dark:hover:text-paper"
                              }`}
                          >
                            {it.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <Field
                    id="waitlist-name"
                    name="name"
                    label="Full name"
                    inputRef={nameInputRef}
                    error={errors.name}
                    value={form.name}
                    onChange={(v) => update("name", v)}
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                    required
                  />
                  <Field
                    id="waitlist-email"
                    name="email"
                    label="Work email"
                    inputRef={emailInputRef}
                    type="email"
                    error={errors.email}
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    placeholder="ada@company.com"
                    autoComplete="email"
                    required
                  />
                  <Field
                    id="waitlist-organization"
                    name="organization"
                    label={form.intent === "company" ? "Company name" : "Where you build / study"}
                    inputRef={orgInputRef}
                    error={errors.organization}
                    value={form.organization}
                    onChange={(v) => update("organization", v)}
                    placeholder={form.intent === "company" ? "Northbeam" : "IIT Bombay"}
                    autoComplete="organization"
                    required
                  />

                  {status === "error" && message && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    aria-busy={status === "submitting"}
                    className="btn-accent w-full disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "submitting" ? (
                      <>
                        <Spinner />
                        Sending…
                      </>
                    ) : (
                      <>
                        Request access
                        <ArrowRight width={16} height={16} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-ink/45 dark:text-paper/45">
                    We&apos;ll only use this to get in touch. No spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

function Field({
  id,
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  required = false,
  inputRef,
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink/70 dark:text-paper/70">
        {label}
        {required && <span className="ml-0.5 text-accent" aria-hidden="true">*</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink dark:bg-ink dark:text-paper dark:placeholder:text-paper/30 dark:focus:border-accent ${error
          ? "border-red-500 focus:border-red-500 dark:border-red-500"
          : "border-ink/12 dark:border-ink-line"
          }`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
