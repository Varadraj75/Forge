import net from "net";
import { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
  limit: number;
}

export const MAX_TRACKED_IPS = 10000;
const ipRequestMap = new Map<string, RateLimitRecord>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS && ipRequestMap.size < MAX_TRACKED_IPS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  ipRequestMap.forEach((record, ip) => {
    record.timestamps = record.timestamps.filter((t: number) => t > threshold);
    if (record.timestamps.length === 0) {
      ipRequestMap.delete(ip);
    }
  });

  // Evict entries when map exceeds bounded capacity:
  // 1. Unblocked records (timestamps.length < record.limit) are evicted first, ordered by oldest activity
  // 2. Blocked records (timestamps.length >= record.limit) are evicted only if needed, ordered by oldest activity
  // This ensures that eviction always frees up room, preventing table pegging and re-sorting loops.
  if (ipRequestMap.size >= MAX_TRACKED_IPS) {
    const sorted = Array.from(ipRequestMap.entries()).sort(
      ([, a], [, b]) => {
        const aBlocked = a.timestamps.length >= a.limit ? 1 : 0;
        const bBlocked = b.timestamps.length >= b.limit ? 1 : 0;
        if (aBlocked !== bBlocked) return aBlocked - bBlocked;

        const lastA = a.timestamps[a.timestamps.length - 1] ?? 0;
        const lastB = b.timestamps[b.timestamps.length - 1] ?? 0;
        return lastA - lastB;
      }
    );
    const evictionCount = Math.max(1, Math.floor(MAX_TRACKED_IPS * 0.2));
    for (let i = 0; i < evictionCount && i < sorted.length; i++) {
      ipRequestMap.delete(sorted[i][0]);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter: number; // seconds
}

/**
 * Validates that an IP string is a syntactically valid IPv4 or IPv6 address.
 */
export function isValidIp(ip: string): boolean {
  if (!ip) return false;
  if (typeof net !== "undefined" && typeof net.isIP === "function") {
    return net.isIP(ip) !== 0;
  }
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Sanitizes raw IP strings, stripping port annotations and validating IPv4/IPv6 syntax.
 */
export function sanitizeIpCandidate(raw: string): string | null {
  if (!raw) return null;
  let clean = raw.trim();

  // Strip brackets from bracketed IPv6: "[2001:db8::1]:8080" or "[2001:db8::1]"
  if (clean.startsWith("[")) {
    const end = clean.indexOf("]");
    if (end !== -1) {
      clean = clean.substring(1, end);
    }
  } else if (clean.includes(":") && clean.indexOf(":") === clean.lastIndexOf(":")) {
    // IPv4 with port: "192.168.1.1:3000"
    clean = clean.split(":")[0].trim();
  }

  return isValidIp(clean) ? clean : null;
}

/**
 * Applies a sliding-window rate limit based on client IP.
 * Default: 5 requests per 60 seconds.
 */
export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  cleanupStaleRecords(windowMs);

  let record = ipRequestMap.get(ip);
  if (!record) {
    record = { timestamps: [], limit };
    ipRequestMap.set(ip, record);
  } else {
    record.limit = limit;
  }

  // Remove timestamps outside the sliding window
  const windowStart = now - windowMs;
  record.timestamps = record.timestamps.filter((t: number) => t > windowStart);

  const resetTimeSeconds = Math.ceil((now + windowMs) / 1000);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTimeSeconds,
      retryAfter,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    success: true,
    limit,
    remaining,
    reset: resetTimeSeconds,
    retryAfter: 0,
  };
}

/**
 * Extracts validated client IP from request headers with trusted proxy order and spoofing defense.
 */
export function getClientIp(req: NextRequest): string {
  // Check headers in order of proxy reliability
  const vercelForwarded = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const candidate = sanitizeIpCandidate(vercelForwarded.split(",")[0]);
    if (candidate) return candidate;
  }

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    const candidate = sanitizeIpCandidate(cfConnectingIp);
    if (candidate) return candidate;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    const candidate = sanitizeIpCandidate(realIp);
    if (candidate) return candidate;
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const candidate = sanitizeIpCandidate(forwarded.split(",")[0]);
    if (candidate) return candidate;
  }

  return "127.0.0.1";
}

/**
 * For testing purposes only: resets the in-memory rate limit table.
 */
export function _resetRateLimiter() {
  ipRequestMap.clear();
  lastCleanup = Date.now();
}

/**
 * For testing purposes: returns the count of tracked IP entries.
 */
export function _getTrackedIpCount(): number {
  return ipRequestMap.size;
}
