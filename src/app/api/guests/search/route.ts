import { NextResponse } from "next/server";

import { cleanText, searchGuestRegistry } from "@/lib/guests";

export const runtime = "nodejs";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allowAttempt(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const windowMs = 60_000;
  const maxAttempts = 20;
  const bucket = rateLimit.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxAttempts) return false;
  bucket.count += 1;
  return true;
}

async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!allowAttempt(request)) {
    return NextResponse.json({ guests: [] }, { status: 429 });
  }

  const body = await parseJson(request);
  const query = cleanText(body?.query, 80);
  const result = await searchGuestRegistry(query);
  if (!result.ok) {
    return NextResponse.json({ guests: [] }, { status: result.status });
  }

  return NextResponse.json({ guests: result.guests });
}
