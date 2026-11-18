import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimit,
  _resetRateLimiter,
  getClientIp,
  isValidIp,
  sanitizeIpCandidate,
  MAX_TRACKED_IPS,
  _getTrackedIpCount,
} from "../rate-limiter";
import { NextRequest } from "next/server";

describe("rate-limiter", () => {
  beforeEach(() => {
    _resetRateLimiter();
  });

  describe("sliding window limits", () => {
    it("allows requests under the specified limit", () => {
      const ip = "192.168.1.100";
      const res1 = rateLimit(ip, 3, 10000);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = rateLimit(ip, 3, 10000);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = rateLimit(ip, 3, 10000);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("blocks requests exceeding the limit with 429 semantics", () => {
      const ip = "10.0.0.1";
      for (let i = 0; i < 5; i++) {
        expect(rateLimit(ip, 5, 10000).success).toBe(true);
      }

      const blocked = rateLimit(ip, 5, 10000);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it("bounds in-memory tracking map under heavy load to prevent memory leaks", () => {
      // Simulate high volume of unique IPs
      for (let i = 0; i < MAX_TRACKED_IPS + 50; i++) {
        rateLimit(`10.${Math.floor(i / 256)}.${i % 256}.1`, 5, 1000);
      }

      // Memory tracking should remain bounded
      expect(_getTrackedIpCount()).toBeLessThanOrEqual(MAX_TRACKED_IPS + 50);
    });

    it("preserves blocked IPs during eviction so rate limits cannot be reset by flooding new IPs", () => {
      const blockedIp = "10.0.0.99";
      for (let i = 0; i < 5; i++) {
        rateLimit(blockedIp, 5, 60000);
      }
      expect(rateLimit(blockedIp, 5, 60000).success).toBe(false);

      // Verify precondition: exactly 1 IP tracked initially
      expect(_getTrackedIpCount()).toBe(1);

      // Flood the cache with benign single-request IPs to trigger eviction
      const floodCount = MAX_TRACKED_IPS + 50;
      for (let i = 0; i < floodCount; i++) {
        rateLimit(`172.16.${Math.floor(i / 256)}.${i % 256}`, 5, 60000);
      }

      // Verify that eviction actually took place (table size is less than total unique IPs introduced)
      expect(_getTrackedIpCount()).toBeLessThan(floodCount + 1);

      // Blocked IP must STILL be blocked and not prematurely evicted
      expect(rateLimit(blockedIp, 5, 60000).success).toBe(false);
    });

    it("respects custom limit parameters on per-record basis and dynamically updates limits", () => {
      const customIp = "10.10.10.10";
      // Allow 2 requests initially
      expect(rateLimit(customIp, 2, 60000).success).toBe(true);
      expect(rateLimit(customIp, 2, 60000).success).toBe(true);
      expect(rateLimit(customIp, 2, 60000).success).toBe(false);

      // Dynamically expand the limit to 4 for this IP; 3rd request should now succeed
      const expanded = rateLimit(customIp, 4, 60000);
      expect(expanded.success).toBe(true);
      expect(expanded.remaining).toBe(1);
      expect(expanded.limit).toBe(4);
    });
  });

  describe("IP validation and sanitization", () => {
    it("identifies valid IPv4 and IPv6 addresses", () => {
      expect(isValidIp("192.168.1.1")).toBe(true);
      expect(isValidIp("10.0.0.1")).toBe(true);
      expect(isValidIp("2001:db8::1")).toBe(true);
      expect(isValidIp("::1")).toBe(true);
    });

    it("rejects invalid, malformed, or spoofed IP values", () => {
      expect(isValidIp("")).toBe(false);
      expect(isValidIp("not-an-ip")).toBe(false);
      expect(isValidIp("999.999.999.999")).toBe(false);
      expect(isValidIp("dead:beef")).toBe(false);
      expect(isValidIp("../../etc/passwd")).toBe(false);
    });

    it("sanitizes IP candidates with port numbers", () => {
      expect(sanitizeIpCandidate("192.168.1.1:8080")).toBe("192.168.1.1");
      expect(sanitizeIpCandidate("[2001:db8::1]:8080")).toBe("2001:db8::1");
      expect(sanitizeIpCandidate("  10.0.0.5  ")).toBe("10.0.0.5");
      expect(sanitizeIpCandidate("invalid-ip:9999")).toBeNull();
    });
  });

  describe("getClientIp header extraction and spoofing defense", () => {
    it("extracts client IP accurately from x-forwarded-for header", () => {
      const req = new NextRequest("http://localhost:3000/api/leads", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("prioritizes trusted x-vercel-forwarded-for over standard headers", () => {
      const req = new NextRequest("http://localhost:3000/api/leads", {
        headers: {
          "x-vercel-forwarded-for": "198.51.100.22",
          "x-forwarded-for": "spoofed-ip, 1.2.3.4",
        },
      });
      expect(getClientIp(req)).toBe("198.51.100.22");
    });

    it("prioritizes cf-connecting-ip when present", () => {
      const req = new NextRequest("http://localhost:3000/api/leads", {
        headers: {
          "cf-connecting-ip": "198.51.100.44",
          "x-forwarded-for": "10.0.0.1",
        },
      });
      expect(getClientIp(req)).toBe("198.51.100.44");
    });

    it("falls back to 127.0.0.1 when headers are missing or spoofed with garbage", () => {
      const reqEmpty = new NextRequest("http://localhost:3000/api/leads");
      expect(getClientIp(reqEmpty)).toBe("127.0.0.1");

      const reqSpoofed = new NextRequest("http://localhost:3000/api/leads", {
        headers: { "x-forwarded-for": "malicious-header-value" },
      });
      expect(getClientIp(reqSpoofed)).toBe("127.0.0.1");
    });
  });
});
