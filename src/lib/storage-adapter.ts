import fs from "fs";
import path from "path";
import type { Lead } from "./leads-store";

/**
 * Storage adapter interface for lead persistence.
 * Implementations can be configured via environment variables.
 */
export interface LeadsStorageAdapter {
  addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead>;
  listLeads(): Promise<Lead[]>;
  leadCount(): Promise<number>;
  findLeadByEmail(email: string): Promise<Lead | undefined>;
  clear(): Promise<void>;
}

export class MemoryLeadsAdapter implements LeadsStorageAdapter {
  private leads: Lead[] = [];

  async addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    const existing = await this.findLeadByEmail(value.email);
    if (existing) return existing;

    const lead: Lead = {
      ...value,
      id: `ld_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.leads.unshift(lead);
    return lead;
  }

  async listLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async leadCount(): Promise<number> {
    return this.leads.length;
  }

  async findLeadByEmail(email: string): Promise<Lead | undefined> {
    const normalized = email.toLowerCase().trim();
    return this.leads.find((l) => l.email.toLowerCase().trim() === normalized);
  }

  async clear(): Promise<void> {
    this.leads = [];
  }
}

export class FileLeadsAdapter implements LeadsStorageAdapter {
  private filePath: string;
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), ".data", "leads.json");
  }

  public readLeads(): Lead[] {
    if (!fs.existsSync(this.filePath)) return [];
    let content: string;
    try {
      content = fs.readFileSync(this.filePath, "utf-8");
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw err;
    }

    if (!content.trim()) return [];

    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error(`Corrupted leads data: expected an array, got ${typeof parsed}`);
      }
      return parsed as Lead[];
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith("Corrupted leads")) {
        throw err;
      }
      throw new Error(`Failed to parse leads file at ${this.filePath}: ${(err as Error).message}`);
    }
  }

  private writeLeadsAtomic(leads: Lead[]) {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = path.join(dir, `.leads.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
    fs.writeFileSync(tempPath, JSON.stringify(leads, null, 2), "utf-8");
    fs.renameSync(tempPath, this.filePath);
  }

  async addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    return new Promise<Lead>((resolve, reject) => {
      this.writeQueue = this.writeQueue
        .then(async () => {
          const leads = this.readLeads();
          const normalized = value.email.toLowerCase().trim();
          const existing = leads.find((l) => l.email.toLowerCase().trim() === normalized);
          if (existing) {
            resolve(existing);
            return;
          }

          const lead: Lead = {
            ...value,
            id: `ld_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date().toISOString(),
          };
          leads.unshift(lead);
          this.writeLeadsAtomic(leads);
          resolve(lead);
        })
        .catch(reject);
    });
  }

  async listLeads(): Promise<Lead[]> {
    return this.readLeads();
  }

  async leadCount(): Promise<number> {
    return this.readLeads().length;
  }

  async findLeadByEmail(email: string): Promise<Lead | undefined> {
    const normalized = email.toLowerCase().trim();
    return this.readLeads().find((l) => l.email.toLowerCase().trim() === normalized);
  }

  async clear(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.writeQueue = this.writeQueue
        .then(() => {
          this.writeLeadsAtomic([]);
          resolve();
        })
        .catch(reject);
    });
  }
}

export function createDefaultStorageAdapter(): LeadsStorageAdapter {
  const adapterType = (process.env.LEADS_STORAGE_ADAPTER || "").trim().toLowerCase();
  if (adapterType === "file") {
    return new FileLeadsAdapter();
  }
  return new MemoryLeadsAdapter();
}
