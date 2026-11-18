/**
 * leads-store.ts
 * -------------------------------------------------------------------------
 * Pluggable lead store with adapter architecture supporting in-memory,
 * file-backed JSON storage, and database adapters (Postgres/Prisma/Supabase).
 */

import { createStorageAdapter, type LeadsStorageAdapter } from "./storage-adapter";

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
  hp?: unknown; // Honeypot field for bot filtering
}

let activeAdapter: LeadsStorageAdapter = createStorageAdapter();

export function setStorageAdapter(adapter: LeadsStorageAdapter): void {
  activeAdapter = adapter;
}

export function getStorageAdapter(): LeadsStorageAdapter {
  return activeAdapter;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  ok: boolean;
  isSpam?: boolean;
  errors: Record<string, string>;
  value?: Omit<Lead, "id" | "createdAt">;
}

/** Server-side validation with honeypot spam protection. */
export function validateLead(input: LeadInput): ValidationResult {
  // If honeypot is populated, it is a bot submission
  if (typeof input.hp === "string" && input.hp.trim().length > 0) {
    return { ok: false, isSpam: true, errors: {} };
  }

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

export async function addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  return await activeAdapter.addLead(value);
}

export async function listLeads(): Promise<Lead[]> {
  return await activeAdapter.listLeads();
}

export async function leadCount(): Promise<number> {
  return await activeAdapter.leadCount();
}

/** Reset helper for test environments only. */
export async function _resetLeadsForTesting(): Promise<void> {
  if (process.env.NODE_ENV === "test" && activeAdapter.clear) {
    await activeAdapter.clear();
  }
}
