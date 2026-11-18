import { NextRequest } from "next/server";
import net from "net";

interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();
const MAX_ENTRIES = 5000;

// Clean up stale IP records every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS && ipRequestMap.size < MAX_ENTRIES) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  ipRequestMap.forEach((record, ip) => {
    const valid = record.timestamps.filter((ts: number) => ts > threshold);
    if (valid.length === 0) {
      ipRequestMap.delete(ip);
    } else {
      record.timestamps = valid;
    }
  });

  // Hard bound protection: if still over MAX_ENTRIES, evict oldest entries
  if (ipRequestMap.size >= MAX_ENTRIES) {
    const keysToEvict = Array.from(ipRequestMap.keys()).slice(0, 1000);
    keysToEvict.forEach((k) => ipRequestMap.delete(k));
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Sliding window in-memory rate limiter with bounded cardinality.
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
    record = { timestamps: [] };
    ipRequestMap.set(ip, record);
  }

  // Filter timestamps within current sliding window
  const windowStart = now - windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  record.timestamps.push(now);
  const remaining = limit - record.timestamps.length;
  const resetInSeconds = Math.ceil(windowMs / 1000);

  return {
    success: true,
    limit,
    remaining,
    resetInSeconds,
  };
}

/** Reset rate limit state (helpful in tests) */
export function _resetRateLimiter(): void {
  ipRequestMap.clear();
}

/** Helper to check whether a string is a valid IPv4 or IPv6 address */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  return net.isIP(ip.trim()) !== 0;
}

/** Extract reliable client IP */
export function getClientIp(req: NextRequest): string {
  if (req.ip && isValidIp(req.ip)) {
    return req.ip.trim();
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (isValidIp(firstIp)) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  return "unknown-client";
}
