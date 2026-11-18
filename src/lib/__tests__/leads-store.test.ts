import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  validateLead,
  addLead,
  listLeads,
  leadCount,
  _resetLeadsForTesting,
  setStorageAdapter,
} from "../leads-store";
import { MemoryLeadsAdapter, FileLeadsAdapter, createStorageAdapter } from "../storage-adapter";
import path from "path";
import fs from "fs";

describe("leads-store", () => {
  beforeEach(async () => {
    setStorageAdapter(new MemoryLeadsAdapter());
    await _resetLeadsForTesting();
  });

  describe("validateLead & honeypot", () => {
    it("should accept valid company lead input", () => {
      const input = {
        name: "Ada Lovelace",
        email: "ada@analytical.engine",
        organization: "Babbage Labs",
        intent: "company",
      };

      const result = validateLead(input);
      expect(result.ok).toBe(true);
      expect(result.isSpam).toBeUndefined();
      expect(result.errors).toEqual({});
      expect(result.value).toEqual({
        name: "Ada Lovelace",
        email: "ada@analytical.engine",
        organization: "Babbage Labs",
        intent: "company",
      });
    });

    it("should accept valid builder lead input and normalize email and whitespace", () => {
      const input = {
        name: "  Alan Turing  ",
        email: "  TURING@BLETCHLEY.ORG  ",
        organization: "  Bletchley Park  ",
        intent: "builder",
      };

      const result = validateLead(input);
      expect(result.ok).toBe(true);
      expect(result.value).toEqual({
        name: "Alan Turing",
        email: "turing@bletchley.org",
        organization: "Bletchley Park",
        intent: "builder",
      });
    });

    it("should flag honeypot submissions as spam", () => {
      const input = {
        name: "Spam Bot",
        email: "bot@spammer.com",
        organization: "Spam LLC",
        intent: "builder",
        hp: "http://spam-link.xyz",
      };

      const result = validateLead(input);
      expect(result.ok).toBe(false);
      expect(result.isSpam).toBe(true);
    });

    it("should reject inputs with invalid or missing fields", () => {
      const input = {
        name: "A",
        email: "not-an-email",
        organization: " ",
        intent: "investor",
      };

      const result = validateLead(input);
      expect(result.ok).toBe(false);
      expect(result.errors.name).toBe("Please enter your full name.");
      expect(result.errors.email).toBe("Please enter a valid work email.");
      expect(result.errors.organization).toBe("Tell us where you work.");
      expect(result.errors.intent).toBe("Choose how you'd like to use Forge.");
    });
  });

  describe("addLead, listLeads, and leadCount (async)", () => {
    it("should add a new lead and increment leadCount", async () => {
      expect(await leadCount()).toBe(0);

      const lead = await addLead({
        name: "Grace Hopper",
        email: "grace@navy.mil",
        organization: "US Navy",
        intent: "builder",
      });

      expect(lead.id).toMatch(/^ld_/);
      expect(lead.name).toBe("Grace Hopper");
      expect(lead.email).toBe("grace@navy.mil");
      expect(lead.createdAt).toBeDefined();
      expect(await leadCount()).toBe(1);

      const all = await listLeads();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(lead.id);
    });

    it("should deduplicate submissions with identical email addresses", async () => {
      const first = await addLead({
        name: "Claude Shannon",
        email: "shannon@bell.labs",
        organization: "Bell Labs",
        intent: "company",
      });

      const second = await addLead({
        name: "Claude Shannon",
        email: "shannon@bell.labs",
        organization: "MIT",
        intent: "builder",
      });

      expect(await leadCount()).toBe(1);
      expect(second.id).toBe(first.id);
      expect(second.createdAt).toBe(first.createdAt);
    });
  });

  describe("FileLeadsAdapter", () => {
    const testFile = path.join(process.cwd(), ".data", "test-leads.json");

    const cleanup = async () => {
      if (fs.existsSync(testFile)) {
        try {
          await fs.promises.unlink(testFile);
        } catch {}
      }
    };

    beforeEach(cleanup);
    afterEach(cleanup);

    it("should persist and reload leads from disk", async () => {
      const adapter = new FileLeadsAdapter(testFile);
      expect(await adapter.leadCount()).toBe(0);

      const lead = await adapter.addLead({
        name: "Margaret Hamilton",
        email: "margaret@mit.edu",
        organization: "MIT Instrumentation Lab",
        intent: "builder",
      });

      expect(lead.id).toBeDefined();
      expect(await adapter.leadCount()).toBe(1);

      // Create new instance pointing to same file
      const adapter2 = new FileLeadsAdapter(testFile);
      expect(await adapter2.leadCount()).toBe(1);
      const reloaded = await adapter2.findLeadByEmail("margaret@mit.edu");
      expect(reloaded?.name).toBe("Margaret Hamilton");

      // Cleanup
      await adapter2.clear();
      expect(await adapter2.leadCount()).toBe(0);
      if (fs.existsSync(testFile)) {
        await fs.promises.unlink(testFile);
      }
    });

    it("should return empty list without creating file when file is missing", async () => {
      const missingFile = path.join(process.cwd(), ".data", "non-existent-test.json");
      if (fs.existsSync(missingFile)) fs.unlinkSync(missingFile);

      const adapter = new FileLeadsAdapter(missingFile);
      const leads = await adapter.listLeads();
      expect(leads).toEqual([]);
      expect(fs.existsSync(missingFile)).toBe(false);
    });

    it("should properly normalize LEADS_STORAGE_ADAPTER values with padding", () => {
      const orig = process.env.LEADS_STORAGE_ADAPTER;

      process.env.LEADS_STORAGE_ADAPTER = " memory ";
      expect(createStorageAdapter() instanceof MemoryLeadsAdapter).toBe(true);

      process.env.LEADS_STORAGE_ADAPTER = " file ";
      expect(createStorageAdapter() instanceof FileLeadsAdapter).toBe(true);

      process.env.LEADS_STORAGE_ADAPTER = orig;
    });
  });
});
