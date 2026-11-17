import { describe, it, expect, beforeEach } from "vitest";
import {
  validateLead,
  addLead,
  listLeads,
  leadCount,
  _resetLeadsForTesting,
} from "../leads-store";

describe("leads-store", () => {
  beforeEach(() => {
    _resetLeadsForTesting();
  });

  describe("validateLead", () => {
    it("should accept valid company lead input", () => {
      const input = {
        name: "Ada Lovelace",
        email: "ada@analytical.engine",
        organization: "Babbage Labs",
        intent: "company",
      };

      const result = validateLead(input);
      expect(result.ok).toBe(true);
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

    it("should reject non-string types gracefully", () => {
      const input = {
        name: 12345,
        email: null,
        organization: undefined,
        intent: false,
      };

      const result = validateLead(input);
      expect(result.ok).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.organization).toBeDefined();
      expect(result.errors.intent).toBeDefined();
    });
  });

  describe("addLead, listLeads, and leadCount", () => {
    it("should add a new lead and increment leadCount", () => {
      expect(leadCount()).toBe(0);

      const lead = addLead({
        name: "Grace Hopper",
        email: "grace@navy.mil",
        organization: "US Navy",
        intent: "builder",
      });

      expect(lead.id).toMatch(/^ld_/);
      expect(lead.name).toBe("Grace Hopper");
      expect(lead.email).toBe("grace@navy.mil");
      expect(lead.createdAt).toBeDefined();
      expect(leadCount()).toBe(1);

      const all = listLeads();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(lead.id);
    });

    it("should deduplicate submissions with identical email addresses", () => {
      const first = addLead({
        name: "Claude Shannon",
        email: "shannon@bell.labs",
        organization: "Bell Labs",
        intent: "company",
      });

      const second = addLead({
        name: "Claude Shannon",
        email: "shannon@bell.labs",
        organization: "MIT",
        intent: "builder",
      });

      expect(leadCount()).toBe(1);
      expect(second.id).toBe(first.id);
      expect(second.createdAt).toBe(first.createdAt);
    });
  });
});
