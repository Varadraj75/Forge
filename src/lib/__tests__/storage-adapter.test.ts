import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MemoryLeadsAdapter,
  FileLeadsAdapter,
  createDefaultStorageAdapter,
} from "../storage-adapter";
import fs from "fs";
import path from "path";

describe("storage adapters", () => {
  const testFilePath = path.join(process.cwd(), ".data", "test-leads.json");
  const origEnv = process.env.LEADS_STORAGE_ADAPTER;

  beforeEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    // Safely restore environment variable without stringifying undefined
    if (origEnv !== undefined) {
      process.env.LEADS_STORAGE_ADAPTER = origEnv;
    } else {
      delete process.env.LEADS_STORAGE_ADAPTER;
    }
  });

  describe("MemoryLeadsAdapter", () => {
    it("adds, lists, and retrieves leads in memory", async () => {
      const adapter = new MemoryLeadsAdapter();
      expect(await adapter.leadCount()).toBe(0);

      const lead = await adapter.addLead({
        name: "Test Builder",
        email: "builder@test.com",
        organization: "Builder Inc",
        intent: "builder",
      });

      expect(lead.id).toBeDefined();
      expect(await adapter.leadCount()).toBe(1);

      const all = await adapter.listLeads();
      expect(all.length).toBe(1);
      expect(all[0].name).toBe("Test Builder");

      // Verify case-insensitive and whitespace-insensitive email lookup
      const found = await adapter.findLeadByEmail("  BUILDER@TEST.COM  ");
      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Builder");

      await adapter.clear();
      expect(await adapter.leadCount()).toBe(0);
      expect((await adapter.listLeads()).length).toBe(0);
    });
  });

  describe("FileLeadsAdapter", () => {
    it("safely reads non-existent file returning empty array without creating files", () => {
      const missingFilePath = path.join(process.cwd(), ".data", "missing-leads.json");
      if (fs.existsSync(missingFilePath)) fs.unlinkSync(missingFilePath);

      const adapter = new FileLeadsAdapter(missingFilePath);
      expect(adapter.readLeads()).toEqual([]);
      expect(fs.existsSync(missingFilePath)).toBe(false);
    });

    it("persists leads to filesystem, lists them, and handles clear()", async () => {
      const adapter = new FileLeadsAdapter(testFilePath);
      expect(await adapter.leadCount()).toBe(0);

      await adapter.addLead({
        name: "Persisted Lead",
        email: "persist@test.com",
        organization: "Persistence Co",
        intent: "company",
      });

      expect(await adapter.leadCount()).toBe(1);
      expect(fs.existsSync(testFilePath)).toBe(true);

      const all = await adapter.listLeads();
      expect(all.length).toBe(1);

      // Verify case-insensitive and whitespace-insensitive email lookup
      const found = await adapter.findLeadByEmail("  PERSIST@TEST.COM  ");
      expect(found).toBeDefined();
      expect(found?.organization).toBe("Persistence Co");

      // Clear persistence test
      await adapter.clear();
      expect(await adapter.leadCount()).toBe(0);
      expect((await adapter.listLeads()).length).toBe(0);

      // Verify file on disk is emptied
      const adapterReloaded = new FileLeadsAdapter(testFilePath);
      expect(await adapterReloaded.leadCount()).toBe(0);
    });

    it("throws a descriptive error when encountering a corrupted or non-array leads file", () => {
      const dir = path.dirname(testFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Corrupted JSON
      fs.writeFileSync(testFilePath, "{ broken json ...", "utf-8");
      const corruptedAdapter = new FileLeadsAdapter(testFilePath);
      expect(() => corruptedAdapter.readLeads()).toThrow(/Failed to parse leads file/);

      // Non-array JSON
      fs.writeFileSync(testFilePath, JSON.stringify({ notAnArray: true }), "utf-8");
      expect(() => corruptedAdapter.readLeads()).toThrow(/Corrupted leads data/);
    });
  });

  describe("createDefaultStorageAdapter factory", () => {
    it("returns MemoryLeadsAdapter by default", () => {
      delete process.env.LEADS_STORAGE_ADAPTER;
      const adapter = createDefaultStorageAdapter();
      expect(adapter).toBeInstanceOf(MemoryLeadsAdapter);
    });

    it("normalizes and accepts case-insensitive and padded 'file' adapter setting", () => {
      process.env.LEADS_STORAGE_ADAPTER = "  FILE  ";
      const adapter = createDefaultStorageAdapter();
      expect(adapter).toBeInstanceOf(FileLeadsAdapter);
    });
  });
});
