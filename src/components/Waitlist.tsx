"use client";

import { useState } from "react";
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
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setMessage(data.message ?? "You're on the list.");
    } catch {
      setMessage("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  const intents: { id: Intent; label: string; hint: string }[] = [
    { id: "company", label: "For companies", hint: "Run a program or hire" },
    { id: "builder", label: "For builders", hint: "Compete and get hired" },
  ];

  return (
    <section id="waitlist" className="py-24 sm:py-32">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-paper-card shadow-[0_40px_120px_-50px_rgba(10,10,11,0.3)]">
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
              <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-tight tracking-tightest text-paper sm:text-4xl">
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
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/30 text-ink">
                    <Check width={26} height={26} strokeWidth={2.2} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
                    You&apos;re on the list
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-ink/60">{message}</p>
                  <button
                    onClick={() => {
                      setForm(empty);
                      setStatus("idle");
                      setMessage("");
                    }}
                    className="mt-6 text-sm font-semibold text-ink underline underline-offset-4"
                  >
                    Submit another response
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  <div
                    role="radiogroup"
                    aria-label="Participation type"
                    className="grid grid-cols-2 gap-2 rounded-full border border-ink/10 bg-paper p-1"
                  >
                    {intents.map((it) => (
                      <button
                        type="button"
                        role="radio"
                        data-intent={it.id}
                        aria-checked={form.intent === it.id}
                        tabIndex={form.intent === it.id ? 0 : -1}
                        key={it.id}
                        onClick={() => update("intent", it.id)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
                            e.preventDefault();
                            const nextIntent = it.id === "company" ? "builder" : "company";
                            update("intent", nextIntent);
                            const nextBtn = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-intent="${nextIntent}"]`);
                            nextBtn?.focus();
                          }
                        }}
                        className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                          form.intent === it.id
                            ? "bg-ink text-paper"
                            : "text-ink/55 hover:text-ink"
                        }`}
                      >
                        {it.label}
                      </button>
                    ))}
                  </div>

                  {/* Honeypot field for bot spam filtering */}
                  <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
                    <label htmlFor="hp-field">Leave this empty</label>
                    <input
                      id="hp-field"
                      type="text"
                      name="hp"
                      value={form.hp}
                      onChange={(e) => update("hp", e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <Field
                    label="Full name"
                    error={errors.name}
                    value={form.name}
                    onChange={(v) => update("name", v)}
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                  />
                  <Field
                    label="Work email"
                    type="email"
                    error={errors.email}
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    placeholder="ada@company.com"
                    autoComplete="email"
                  />
                  <Field
                    label={form.intent === "company" ? "Company" : "Where you build / study"}
                    error={errors.organization}
                    value={form.organization}
                    onChange={(v) => update("organization", v)}
                    placeholder={form.intent === "company" ? "Northbeam" : "IIT Bombay"}
                    autoComplete="organization"
                  />

                  {status === "error" && message && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
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
                  <p className="text-center text-xs text-ink/45">
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

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const errorId = error ? `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-error` : undefined;

  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink/70">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink ${
            error ? "border-red-400" : "border-ink/12"
          }`}
        />
      </label>
      {error && (
        <span id={errorId} role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
