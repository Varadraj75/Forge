import { describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "../route";
import { _resetLeadsForTesting, setStorageAdapter } from "@/lib/leads-store";
import { MemoryLeadsAdapter } from "@/lib/storage-adapter";
import { _resetRateLimiter } from "@/lib/rate-limiter";
import { NextRequest } from "next/server";

describe("api/leads route handlers", () => {
  beforeEach(async () => {
    setStorageAdapter(new MemoryLeadsAdapter());
    await _resetLeadsForTesting();
    _resetRateLimiter();
  });

  it("GET returns current count with no-store cache headers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(typeof data.count).toBe("number");
    expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
  });

  it("POST saves valid lead and returns 201 with generated id and total count", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.1",
      },
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@analytical.dev",
        organization: "Analytical Engines",
        intent: "builder",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.leadId).toMatch(/^ld_/);
    expect(data.count).toBe(1);
    expect(data.message).toContain("You're on the list");
  });

  it("POST returns 422 with granular field errors when validation fails", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.2",
      },
      body: JSON.stringify({
        name: "",
        email: "invalid-email",
        organization: "",
        intent: "invalid-intent",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.errors).toHaveProperty("name");
    expect(data.errors).toHaveProperty("email");
    expect(data.errors).toHaveProperty("organization");
    expect(data.errors).toHaveProperty("intent");
  });

  it("POST returns 413 when content-length header exceeds 10KB", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "content-length": "12000",
        "x-forwarded-for": "198.51.100.99",
      },
      body: JSON.stringify({ name: "Large", email: "large@test.com", organization: "Large", intent: "company" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toContain("Payload too large");
  });

  it("POST returns 413 when actual body bytes exceed 10KB even without content-length header", async () => {
    // Generate an oversized payload (> 10KB)
    const largePadding = "x".repeat(11 * 1024);
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.98",
      },
      body: JSON.stringify({
        name: "Oversized",
        email: "oversized@test.com",
        organization: "Big Data Corp",
        intent: "company",
        padding: largePadding,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toContain("Payload too large");
  });

  it("POST returns 400 on malformed JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.3",
      },
      body: "invalid-json-string{",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Invalid JSON payload");
  });

  it("POST returns fake 201 without storing lead when honeypot field is filled", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.4",
      },
      body: JSON.stringify({
        name: "Spam Bot",
        email: "spambot@automated.ru",
        organization: "BotNet LLC",
        intent: "builder",
        hp: "I am a malicious bot filling invisible inputs",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.leadId).toMatch(/^ld_/);

    // Ensure bot was NOT saved into real storage
    const getRes = await GET();
    const getData = await getRes.json();
    expect(getData.count).toBe(0);
  });

  it("POST enforces rate limiting (returns 429 on 6th request from same IP)", async () => {
    const ip = "198.51.100.5";
    for (let i = 0; i < 5; i++) {
      const req = new NextRequest("http://localhost:3000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({
          name: `User ${i}`,
          email: `user${i}@rate.dev`,
          organization: "Rate Corp",
          intent: "builder",
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    }

    // 6th request should be rate-limited
    const reqBlocked = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({
        name: "User Blocked",
        email: "blocked@rate.dev",
        organization: "Rate Corp",
        intent: "builder",
      }),
    });
    const resBlocked = await POST(reqBlocked);
    expect(resBlocked.status).toBe(429);
    expect(resBlocked.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(resBlocked.headers.get("Retry-After")).toBeDefined();
  });
});
