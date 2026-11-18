/**
 * leads-store.ts
 * -------------------------------------------------------------------------
 * Pluggable lead store supporting in-memory and persistent filesystem adapters.
 * Configured via process.env.LEADS_STORAGE_ADAPTER ('memory' | 'file').
 */

import {
  type LeadsStorageAdapter,
  createDefaultStorageAdapter,
  MemoryLeadsAdapter,
} from "./storage-adapter";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  value?: Omit<Lead, "id" | "createdAt">;
}

let activeAdapter: LeadsStorageAdapter = createDefaultStorageAdapter();

/** Configure active storage adapter dynamically (e.g. for testing) */
export function setStorageAdapter(adapter: LeadsStorageAdapter) {
  activeAdapter = adapter;
}

/** Reset active storage adapter state for testing */
export async function _resetLeadsForTesting() {
  await activeAdapter.clear();
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
  else if (name.length > 100) errors.name = "Name must be 100 characters or fewer.";

  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid work email.";
  else if (email.length > 254) errors.email = "Email must be 254 characters or fewer.";

  if (organization.length < 2) errors.organization = "Tell us where you work.";
  else if (organization.length > 120) errors.organization = "Organization must be 120 characters or fewer.";

  if (intent !== "company" && intent !== "builder")
    errors.intent = "Choose how you'd like to use Forge.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    value: { name, email, organization, intent: intent as Intent },
  };
}

/**
 * Atomically checks for duplicate email and persists new lead via the active adapter.
 */
export async function addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  return await activeAdapter.addLead(value);
}

export async function listLeads(): Promise<Lead[]> {
  return await activeAdapter.listLeads();
}

export async function leadCount(): Promise<number> {
  return await activeAdapter.leadCount();
}
