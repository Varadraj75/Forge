import fs from "fs";
import path from "path";
import type { Lead } from "./leads-store";

/**
 * Storage adapter interface for lead persistence.
 * Implementations can be swapped via environment variables without changing business logic.
 */
export interface LeadsStorageAdapter {
  addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead>;
  listLeads(): Promise<Lead[]>;
  leadCount(): Promise<number>;
  findLeadByEmail(email: string): Promise<Lead | undefined>;
  clear?(): Promise<void>;
}

/**
 * In-Memory Adapter (ideal for tests & ephemeral demos)
 */
export class MemoryLeadsAdapter implements LeadsStorageAdapter {
  private leads: Lead[] = [];
  private writeLock: Promise<void> = Promise.resolve();

  async addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    // Serialize writes to prevent race-condition duplicates
    let resolveLock!: () => void;
    const currentLock = this.writeLock;
    this.writeLock = new Promise<void>((res) => {
      resolveLock = res;
    });

    try {
      await currentLock;
      const existing = await this.findLeadByEmail(value.email);
      if (existing) return existing;

      const lead: Lead = {
        id: `ld_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        ...value,
        createdAt: new Date().toISOString(),
      };
      this.leads.push(lead);
      return lead;
    } finally {
      resolveLock();
    }
  }

  async listLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async leadCount(): Promise<number> {
    return this.leads.length;
  }

  async findLeadByEmail(email: string): Promise<Lead | undefined> {
    return this.leads.find((l) => l.email.toLowerCase() === email.toLowerCase());
  }

  async clear(): Promise<void> {
    this.leads = [];
  }
}

/**
 * File-backed JSON Storage Adapter with atomic writes
 * (persists to local disk across server restarts)
 */
export class FileLeadsAdapter implements LeadsStorageAdapter {
  private filePath: string;
  private writeLock: Promise<void> = Promise.resolve();

  constructor(filePath?: string) {
    this.filePath =
      filePath || path.join(process.cwd(), ".data", "leads.json");
  }

  private async readAll(): Promise<Lead[]> {
    try {
      const data = await fs.promises.readFile(this.filePath, "utf8");
      return JSON.parse(data) as Lead[];
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      // Fail closed on file corruption to prevent silent data loss
      throw new Error(`Failed to parse leads storage file: ${(err as Error).message}`);
    }
  }

  private async atomicWrite(leads: Lead[]): Promise<void> {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    const tempPath = `${this.filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await fs.promises.writeFile(tempPath, JSON.stringify(leads, null, 2), "utf8");
    await fs.promises.rename(tempPath, this.filePath);
  }

  async addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    let resolveLock!: () => void;
    const currentLock = this.writeLock;
    this.writeLock = new Promise<void>((res) => {
      resolveLock = res;
    });

    try {
      await currentLock;
      const leads = await this.readAll();
      const existing = leads.find((l) => l.email.toLowerCase() === value.email.toLowerCase());
      if (existing) return existing;

      const lead: Lead = {
        id: `ld_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        ...value,
        createdAt: new Date().toISOString(),
      };
      leads.push(lead);
      await this.atomicWrite(leads);
      return lead;
    } finally {
      resolveLock();
    }
  }

  async listLeads(): Promise<Lead[]> {
    return await this.readAll();
  }

  async leadCount(): Promise<number> {
    const leads = await this.readAll();
    return leads.length;
  }

  async findLeadByEmail(email: string): Promise<Lead | undefined> {
    const leads = await this.readAll();
    return leads.find((l) => l.email.toLowerCase() === email.toLowerCase());
  }

  async clear(): Promise<void> {
    let resolveLock!: () => void;
    const currentLock = this.writeLock;
    this.writeLock = new Promise<void>((res) => {
      resolveLock = res;
    });

    try {
      await currentLock;
      await this.atomicWrite([]);
    } finally {
      resolveLock();
    }
  }
}

/**
 * Factory function to select the active storage adapter.
 * Configurable via LEADS_STORAGE_ADAPTER=memory|file
 */
export function createStorageAdapter(): LeadsStorageAdapter {
  const rawType = process.env.LEADS_STORAGE_ADAPTER;
  if (!rawType) {
    return new MemoryLeadsAdapter();
  }

  const normalized = rawType.trim().toLowerCase();
  if (normalized === "memory") {
    return new MemoryLeadsAdapter();
  }

  if (normalized === "file") {
    return new FileLeadsAdapter();
  }

  throw new Error(
    `Unsupported LEADS_STORAGE_ADAPTER "${rawType}". Valid options are "memory" or "file".`
  );
}
