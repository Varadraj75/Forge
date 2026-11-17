/**
 * leads-store.ts
 * -------------------------------------------------------------------------
 * A tiny in-memory store for demo / waitlist submissions.
 *
 * This intentionally keeps the surface area small so the focus stays on the
 * frontend. In production you would replace the array below with a real
 * datastore (Postgres via Prisma/Drizzle, or a hosted KV) and make
 * `addLead` / `listLeads` async. The route handler in app/api/leads/route.ts
 * already awaits nothing extra, so swapping the implementation is a one-file
 * change.
 *
 * Note: on a serverless host (Vercel) this resets on cold start. That is fine
 * for a screening demo; a DB removes the limitation in production.
 */

export type Intent = "company" | "builder";

export interface Lead {
  id: string;
  name: string;
  email: string;
  organization: string;
  intent: Intent;
  createdAt: string;
}

export interface LeadInput {
  name: unknown;
  email: unknown;
  organization: unknown;
  intent: unknown;
}

const leads: Lead[] = [];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  value?: Omit<Lead, "id" | "createdAt">;
}

/** Server-side validation. Never trust the client. */
export function validateLead(input: LeadInput): ValidationResult {
  const errors: Record<string, string> = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const organization =
    typeof input.organization === "string" ? input.organization.trim() : "";
  const intent = input.intent;

  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid work email.";
  if (organization.length < 2) errors.organization = "Tell us where you work.";
  if (intent !== "company" && intent !== "builder")
    errors.intent = "Choose how you'd like to use Forge.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    value: { name, email, organization, intent: intent as Intent },
  };
}

export function addLead(value: Omit<Lead, "id" | "createdAt">): Lead {
  // de-dupe by email so a double-submit doesn't create noise
  const existing = leads.find((l) => l.email === value.email);
  if (existing) return existing;

  const lead: Lead = {
    id: `ld_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    ...value,
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  return lead;
}

export function listLeads(): Lead[] {
  return [...leads];
}

export function leadCount(): number {
  return leads.length;
}

/** Reset helper for test environments only. */
export function _resetLeadsForTesting(): void {
  if (process.env.NODE_ENV === "test") {
    leads.length = 0;
  }
}
