import { describe, it, expect } from "vitest";
import { getAllChallenges, getChallenge } from "../challenges";

describe("challenges catalog", () => {
  it("returns all defined challenges", () => {
    const list = getAllChallenges();
    expect(list.length).toBeGreaterThanOrEqual(3);
  });

  it("finds a challenge by exact slug", () => {
    const c = getChallenge("demo-challenge");
    expect(c).toBeDefined();
    expect(c?.title).toContain("Fraud Scoring");
    expect(c?.category).toBe("Fintech & Fraud");
  });

  it("finds a challenge by id", () => {
    const c = getChallenge("ratelimit-02");
    expect(c).toBeDefined();
    expect(c?.slug).toBe("rate-limiter");
  });

  it("returns undefined for unknown challenge slugs", () => {
    const c = getChallenge("non-existent-challenge");
    expect(c).toBeUndefined();
  });
});
