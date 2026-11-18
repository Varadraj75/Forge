import { NextRequest, NextResponse } from "next/server";
import { addLead, leadCount, validateLead, type LeadInput } from "@/lib/leads-store";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PAYLOAD_BYTES = 10 * 1024; // 10KB limit

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (5 requests per 60 seconds)
  const ip = getClientIp(req);
  const limiter = rateLimit(ip, 5, 60 * 1000);

  if (!limiter.success) {
    const errorMsg = "Too many requests. Please slow down and try again shortly.";
    return NextResponse.json(
      {
        ok: false,
        error: errorMsg,
        message: errorMsg,
      },
      {
        status: 429,
        headers: {
          "Retry-After": limiter.retryAfter.toString(),
          "X-RateLimit-Limit": limiter.limit.toString(),
          "X-RateLimit-Remaining": limiter.remaining.toString(),
          "X-RateLimit-Reset": limiter.reset.toString(),
        },
      }
    );
  }

  // 2. Fast check: Content-Length header guard (max 10KB to prevent DoS)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "Payload too large. Maximum allowed size is 10KB.",
        message: "Payload too large",
      },
      { status: 413 }
    );
  }

  // 3. Enforce real byte limit on actual body bytes (handles chunked or missing content-length)
  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to read request body", message: "Failed to read request body" },
      { status: 400 }
    );
  }

  const actualBytes = Buffer.byteLength(rawText, "utf-8");
  if (actualBytes > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "Payload too large. Maximum allowed size is 10KB.",
        message: "Payload too large",
      },
      { status: 413 }
    );
  }

  let body: LeadInput & { hp?: unknown };
  try {
    body = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload", message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // 4. Honeypot spam defense: if bot fills hidden field, return indistinguishable 201 without saving
  if (typeof body.hp === "string" && body.hp.trim().length > 0) {
    const fakeId = `ld_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
    return NextResponse.json(
      { ok: true, leadId: fakeId },
      { status: 201 }
    );
  }

  // 5. Schema validation & sanitization
  const validation = validateLead(body);
  if (!validation.ok || !validation.value) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        errors: validation.errors,
      },
      { status: 422 }
    );
  }

  try {
    const lead = await addLead(validation.value);
    const count = await leadCount();

    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        count,
        message: "You're on the list. We'll be in touch soon.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    // Log exception details server-side while keeping client response leak-free
    console.error("Storage error processing lead submission:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error. Failed to save lead.",
        message: "Internal server error. Failed to save lead.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const count = await leadCount();
  return NextResponse.json(
    { ok: true, count },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
