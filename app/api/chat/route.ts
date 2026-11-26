import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isAdminEmail } from "@/utils/adminEmails";
import { answer, sanitizeMessages } from "@/utils/knowledge/chat";

// Daily free-message cap per identifier (user id, or IP for anonymous).
// The counter resets each day inside consume_message_quota (see
// supabase/message_quota.sql).
const FREE_MESSAGE_LIMIT = 10;

// The prompt, the knowledge base and the model call live in
// utils/knowledge/chat.ts (shared with scripts/knowledge/run-tests.ts).
// This route only adds rate limiting, the daily quota and the HTTP shape.

// Simple in-memory rate limiter: max 20 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 20) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  // Quota key: the logged-in user's id when available, otherwise the IP.
  let quotaKey = ip;
  let skipQuota = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      quotaKey = user.id;
      // Admin emails are premium: no daily cap.
      skipQuota = isAdminEmail(user.email);
    }
  } catch (error) {
    // Reading the session failed — fall back to the IP so the cap still applies.
    console.error("Chat quota: failed to resolve user, using IP", error);
  }

  // Persistent, cross-instance counter in Supabase (shared across serverless
  // instances). Each POST consumes one message; the first FREE_MESSAGE_LIMIT
  // are allowed, from then on we return 429.
  if (!skipQuota) try {
    const admin = createAdminClient();
    const { data: allowed, error } = await admin.rpc("consume_message_quota", {
      p_identifier: quotaKey,
      p_max_messages: FREE_MESSAGE_LIMIT,
    });
    if (error) throw error;
    if (!allowed) {
      return NextResponse.json(
        { error: "You've used your free messages for today. Come back tomorrow or upgrade to Premium to keep chatting." },
        { status: 429 }
      );
    }
  } catch (error) {
    // Fail-safe: if the quota check fails (network/DB), block with 429 instead
    // of giving away unlimited messages. We log the real error server-side and
    // never expose it to the client.
    console.error("Chat quota check failed:", error);
    return NextResponse.json(
      { error: "You've used your free messages for today. Come back tomorrow or upgrade to Premium to keep chatting." },
      { status: 429 }
    );
  }

  try {
    // A body that isn't valid JSON is a bad request (400), not a server error.
    const body = await req.json().catch(() => null);
    const raw = body?.messages;

    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (raw.length > 40) {
      return NextResponse.json({ error: "This conversation is too long. Please start a new chat." }, { status: 400 });
    }

    // Anthropic requires the first message to be from the user; the UI starts
    // with an assistant welcome bubble, which sanitizeMessages drops.
    const messages = sanitizeMessages(raw);
    if (messages.length === 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const result = await answer({
      messages,
      mode: body?.mode === "apply" ? "apply" : "general",
      format: body?.format === "plain" ? "plain" : "rich",
      universityId: typeof body?.universityId === "string" ? body.universityId : undefined,
    });

    // Per-request size, cost and latency, for the logs only (never sent to the client).
    console.log(
      JSON.stringify({
        evt: "chat",
        kbChars: result.stats.chars,
        countries: result.stats.countries,
        cities: result.stats.cities,
        universities: result.stats.universities,
        topics: result.stats.topics,
        ...result.usage,
        latencyMs: result.latencyMs,
      })
    );

    if (!result.text) {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ message: result.text });
  } catch (error) {
    // Log the full error (with stack) server-side; never leak it to the client.
    console.error("Anthropic error:", error instanceof Error ? error.stack ?? error.message : error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
