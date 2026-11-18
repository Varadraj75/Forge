import { NextRequest, NextResponse } from "next/server";
import { addLead, leadCount, validateLead, type LeadInput } from "@/lib/leads-store";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (5 submissions per 60 seconds per IP)
  const clientIp = getClientIp(req);
  const limitCheck = rateLimit(clientIp, 5, 60 * 1000);

  if (!limitCheck.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many submissions. Please wait before trying again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitCheck.resetInSeconds),
          "X-RateLimit-Limit": String(limitCheck.limit),
          "X-RateLimit-Remaining": String(limitCheck.remaining),
        },
      }
    );
  }

  // 2. Parse request JSON
  let body: LeadInput;
  try {
    body = (await req.json()) as LeadInput;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Malformed JSON body." },
      { status: 400 }
    );
  }

  // 3. Validation & Honeypot detection
  const result = validateLead(body);

  // If honeypot caught a bot, respond with benign 200 without saving spam
  if (result.isSpam) {
    return NextResponse.json(
      {
        ok: true,
        message: "You're on the list. We'll be in touch shortly.",
      },
      { status: 200 }
    );
  }

  if (!result.ok || !result.value) {
    return NextResponse.json(
      { ok: false, message: "Please fix the highlighted fields.", errors: result.errors },
      { status: 422 }
    );
  }

  // 4. Save via active storage adapter (async)
  const lead = await addLead(result.value);

  return NextResponse.json(
    {
      ok: true,
      message: "You're on the list. We'll be in touch shortly.",
      id: lead.id,
    },
    {
      status: 201,
      headers: {
        "X-RateLimit-Limit": String(limitCheck.limit),
        "X-RateLimit-Remaining": String(limitCheck.remaining),
      },
    }
  );
}

// Lightweight read endpoint
export async function GET() {
  const count = await leadCount();
  return NextResponse.json({ ok: true, count });
}
